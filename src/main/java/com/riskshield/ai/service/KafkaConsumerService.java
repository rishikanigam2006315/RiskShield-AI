package com.riskshield.ai.service;

import com.riskshield.ai.model.Transaction;
import com.riskshield.ai.repository.TransactionRepository;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

@Service
public class KafkaConsumerService {

    private final RiskEngineService riskEngineService;
    private final TransactionRepository transactionRepository;

    public KafkaConsumerService(
            RiskEngineService riskEngineService,
            TransactionRepository transactionRepository) {

        this.riskEngineService = riskEngineService;
        this.transactionRepository = transactionRepository;
    }

    @KafkaListener(
            topics = "transaction-events",
            groupId = "risk-engine-group"
    )
    public void consumeTransaction(Transaction transaction) {

        System.out.println("=================================");
        System.out.println("TRANSACTION RECEIVED FROM KAFKA");
        System.out.println("Transaction ID : " + transaction.getId());
        System.out.println("User ID        : " + transaction.getUserId());
        System.out.println("Amount         : " + transaction.getAmount());
        System.out.println("Location       : " + transaction.getLocation());
        System.out.println("Device ID      : " + transaction.getDeviceId());
        System.out.println("=================================");

        // Calculate risk
        riskEngineService.evaluate(transaction);

        // Save updated risk information
        transactionRepository.save(transaction);

        System.out.println("Risk result saved to database.");
    }
}