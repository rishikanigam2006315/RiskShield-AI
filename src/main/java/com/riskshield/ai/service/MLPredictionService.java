package com.riskshield.ai.service;

import com.riskshield.ai.model.Transaction;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Service
public class MLPredictionService {

    private final RestTemplate restTemplate;

    public MLPredictionService() {
        this.restTemplate = new RestTemplate();
    }

    public Map<String, Object> predict(Transaction transaction) {

        String url = "http://localhost:8000/predict";

        Map<String, Object> request = new HashMap<>();

        // ==============================
        // Numerical Features
        // ==============================

        request.put("Transaction_Amount", transaction.getAmount());

        request.put("Account_Balance",
                transaction.getAccountBalance() != null
                        ? transaction.getAccountBalance()
                        : 50000.0);

        request.put("IP_Address_Flag",
                transaction.getIpAddressFlag()
                );

        request.put("Previous_Fraudulent_Activity",
                transaction.getPreviousFraudulentActivity()
                );

        request.put("Daily_Transaction_Count",
                transaction.getDailyTransactionCount() != null
                        ? transaction.getDailyTransactionCount()
                        : 1);

        request.put(
                "Avg_Transaction_Amount_7d",
                transaction.getAverageTransactionAmount7d() != null
                        ? transaction.getAverageTransactionAmount7d()
                        : transaction.getAmount()
        );

        request.put(
                "Failed_Transaction_Count_7d",
                transaction.getFailedAttempts() != null
                        ? transaction.getFailedAttempts()
                        : 0
        );

        request.put("Card_Age",
                transaction.getCardAge()
                );

        request.put(
                "Transaction_Distance",
                transaction.getTransactionDistance() != null
                        ? transaction.getTransactionDistance()
                        : 10.0
        );

        request.put("Is_Weekend",
                transaction.getIsWeekend()
                );


        // ==============================
        // Categorical Features
        // ==============================

        request.put("Transaction_Type", "Online");

        request.put("Device_Type", "Mobile");

        request.put(
                "Location",
                transaction.getLocation()
        );

        request.put("Merchant_Category", "Online");

        request.put("Card_Type", "Credit");

        request.put("Authentication_Method", "OTP");


        // ==============================
        // Call ML Service
        // ==============================

        try {

            ResponseEntity<Map> response =
                    restTemplate.postForEntity(
                            url,
                            request,
                            Map.class
                    );

            if (response.getBody() != null) {
                return response.getBody();
            }

        } catch (Exception e) {

            System.out.println(
                    "ML Service Error: " + e.getMessage()
            );
        }


        // ==============================
        // Fallback Response
        // ==============================

        Map<String, Object> fallback =
                new HashMap<>();

        fallback.put("fraud_probability", 0.0);
        fallback.put("prediction", 0);
        fallback.put("is_fraud", false);

        return fallback;
    }
}