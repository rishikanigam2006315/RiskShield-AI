package com.riskshield.ai.service;

import com.riskshield.ai.model.Transaction;
import com.riskshield.ai.repository.TransactionRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Map;

@Service
public class RiskEngineService {

    private final TransactionRepository transactionRepository;
    private final MLPredictionService mlPredictionService;

    public RiskEngineService(
            TransactionRepository transactionRepository,
            MLPredictionService mlPredictionService) {

        this.transactionRepository = transactionRepository;
        this.mlPredictionService = mlPredictionService;
    }

    public void evaluate(Transaction transaction) {

        int riskScore = 0;
        StringBuilder reason = new StringBuilder();

        // =================================
        // 1. AMOUNT BASED RISK
        // =================================

        if (transaction.getAmount() > 50000) {

            riskScore += 30;

            reason.append("High transaction amount. ");

        } else if (transaction.getAmount() > 10000) {

            riskScore += 15;

            reason.append("Above-normal transaction amount. ");
        }


        // =================================
        // 2. FAILED ATTEMPTS
        // =================================

        if (transaction.getFailedAttempts() >= 3) {

            riskScore += 25;

            reason.append("Multiple failed attempts. ");

        } else if (transaction.getFailedAttempts() >= 1) {

            riskScore += 10;

            reason.append("Previous failed attempt detected. ");
        }


        // =================================
        // 3. DEVICE RISK
        // =================================

        if (transaction.getDeviceId() == null ||
                transaction.getDeviceId().isBlank()) {

            riskScore += 20;

            reason.append("Unknown device. ");
        }


        // =================================
        // 4. TRANSACTION VELOCITY
        // =================================

        LocalDateTime fiveMinutesAgo =
                LocalDateTime.now().minusMinutes(5);

        long recentTransactions =
                transactionRepository.countByUserIdAndCreatedAtAfter(
                        transaction.getUserId(),
                        fiveMinutesAgo
                );

        // Current transaction is already saved,
        // so recentTransactions includes it.

        if (recentTransactions >= 5) {

            riskScore += 30;

            reason.append(
                    "High transaction frequency detected. "
            );

        } else if (recentTransactions >= 3) {

            riskScore += 15;

            reason.append(
                    "Multiple recent transactions detected. "
            );
        }


        // =================================
        // 5. USER AVERAGE AMOUNT ANOMALY
        // =================================

        Double averageAmount =
                transactionRepository.findAverageAmountByUserId(
                        transaction.getUserId()
                );

        if (averageAmount != null && averageAmount > 0) {

            double currentAmount = transaction.getAmount();

            // Current amount is more than 3x user's average

            if (currentAmount > averageAmount * 3) {

                riskScore += 25;

                reason.append(
                        "Transaction amount is significantly higher "
                                + "than user's average. "
                );
            }
        }


        // =================================
        // 6. DEVICE ANOMALY
        // =================================

        boolean knownDevice =
                transaction.getDeviceId() != null
                        && !transaction.getDeviceId().isBlank()
                        && transactionRepository
                        .existsByUserIdAndDeviceIdAndIdNot(
                                transaction.getUserId(),
                                transaction.getDeviceId(),
                                transaction.getId()
                        );

        if (!knownDevice) {

            riskScore += 20;

            reason.append(
                    "New device detected. "
            );
        }


        // =================================
        // 7. LOCATION ANOMALY
        // =================================

        boolean knownLocation =
                transaction.getLocation() != null
                        && !transaction.getLocation().isBlank()
                        && transactionRepository
                        .existsByUserIdAndLocationAndIdNot(
                                transaction.getUserId(),
                                transaction.getLocation(),
                                transaction.getId()
                        );

        if (!knownLocation) {

            riskScore += 15;

            reason.append(
                    "Unusual location detected. "
            );
        }


        // =================================
        // 8. KEEP SCORE BETWEEN 0 AND 100
        // =================================

        riskScore = Math.min(riskScore, 100);


        // =================================
        // 9. RULE-BASED RISK LEVEL
        // =================================

        String riskLevel;
        String decision;

        if (riskScore >= 60) {

            riskLevel = "HIGH";
            decision = "BLOCK";

        } else if (riskScore >= 30) {

            riskLevel = "MEDIUM";
            decision = "REVIEW";

        } else {

            riskLevel = "LOW";
            decision = "ALLOW";
        }


        // =================================
        // 10. SAVE RULE-BASED RESULT
        // =================================

//        transaction.setRiskScore(riskScore);
//        transaction.setRiskLevel(riskLevel);
//        transaction.setDecision(decision);

        transaction.setAiReason(
                reason.length() > 0
                        ? reason.toString()
                        : "No significant risk signals detected."
        );


        // =================================
        // 11. PRINT RULE-BASED RESULT
        // =================================

        System.out.println("=================================");
        System.out.println("        RISK ENGINE RESULT");
        System.out.println("=================================");
        System.out.println(
                "Transaction ID : " + transaction.getId()
        );
        System.out.println(
                "Risk Score     : " + riskScore
        );
        System.out.println(
                "Recent Txns    : " + recentTransactions
        );
        System.out.println(
                "Risk Level     : " + riskLevel
        );
        System.out.println(
                "Decision       : " + decision
        );
        System.out.println(
                "AI Reason      : " + transaction.getAiReason()
        );
        System.out.println("=================================");


        // =================================
        // 12. ML MODEL PREDICTION
        // =================================

        try {

            Map<String, Object> mlResult =
                    mlPredictionService.predict(transaction);

            double fraudProbability = 0.0;

            if (mlResult != null && mlResult.get("fraud_probability") != null) {
                fraudProbability =
                        ((Number) mlResult.get("fraud_probability")).doubleValue();
            }

            int mlScore = (int) Math.round(fraudProbability * 100);

// 60% Rule Engine + 40% Machine Learning
            int finalRiskScore =
                    (int) Math.round(
                            (riskScore * 0.60) +
                                    (mlScore * 0.40)
                    );

            finalRiskScore = Math.min(finalRiskScore, 100);

            String finalRiskLevel;
            String finalDecision;

            if (finalRiskScore >= 60) {

                finalRiskLevel = "HIGH";
                finalDecision = "BLOCK";

            } else if (finalRiskScore >= 30) {

                finalRiskLevel = "MEDIUM";
                finalDecision = "REVIEW";

            } else {

                finalRiskLevel = "LOW";
                finalDecision = "ALLOW";
            }

            transaction.setRiskScore(finalRiskScore);
            transaction.setRiskLevel(finalRiskLevel);
            transaction.setDecision(finalDecision);

            transaction.setAiReason(
                    transaction.getAiReason()
                            + "ML fraud probability: "
                            + String.format("%.2f", fraudProbability * 100)
                            + "%. "
            );

            System.out.println("=================================");
            System.out.println("        FINAL RISK RESULT");
            System.out.println("=================================");
            System.out.println("Transaction ID     : " + transaction.getId());
            System.out.println("Rule Risk Score    : " + riskScore);
            System.out.println("ML Fraud Score     : " + mlScore);
            System.out.println("Final Risk Score   : " + finalRiskScore);
            System.out.println("Final Risk Level   : " + finalRiskLevel);
            System.out.println("Final Decision     : " + finalDecision);
            System.out.println("AI Reason          : " + transaction.getAiReason());
            System.out.println("=================================");

            System.out.println("=================================");
            System.out.println("        ML MODEL RESULT");
            System.out.println("=================================");

            System.out.println(
                    "Fraud Probability : "
                            + mlResult.get("fraud_probability")
            );

            System.out.println(
                    "Prediction        : "
                            + mlResult.get("prediction")
            );

            System.out.println(
                    "Is Fraud          : "
                            + mlResult.get("is_fraud")
            );

            System.out.println("=================================");

        } catch (Exception e) {

            System.out.println("=================================");
            System.out.println("        ML MODEL ERROR");
            System.out.println("=================================");

            System.out.println(
                    "Could not connect to ML service."
            );

            System.out.println(
                    "Error : " + e.getMessage()
            );

            System.out.println("=================================");
        }
    }
}