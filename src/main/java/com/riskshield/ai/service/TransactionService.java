package com.riskshield.ai.service;

import com.riskshield.ai.model.Transaction;
import com.riskshield.ai.repository.TransactionRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final KafkaProducerService kafkaProducerService;

    public TransactionService(
            TransactionRepository transactionRepository,
            KafkaProducerService kafkaProducerService) {

        this.transactionRepository = transactionRepository;
        this.kafkaProducerService = kafkaProducerService;
    }

    public Transaction createTransaction(Transaction transaction) {

        LocalDateTime now = LocalDateTime.now();

        transaction.setCreatedAt(now);

        // Last 24 hours
        LocalDateTime oneDayAgo =
                now.minusDays(1);

        long dailyTransactionCount =
                transactionRepository.countByUserIdAndCreatedAtAfter(
                        transaction.getUserId(),
                        oneDayAgo
                );

        // Current transaction is not saved yet,
        // so add 1 for current transaction.
        transaction.setDailyTransactionCount(
                (int) dailyTransactionCount + 1
        );

        // Last 7 days
        LocalDateTime sevenDaysAgo =
                now.minusDays(7);

        Double averageAmount =
                transactionRepository
                        .findAverageAmountByUserIdAndCreatedAtAfter(
                                transaction.getUserId(),
                                sevenDaysAgo
                        );

        if (averageAmount == null) {
            averageAmount = transaction.getAmount();
        }

        transaction.setAverageTransactionAmount7d(
                averageAmount
        );

        // Save transaction
        Transaction savedTransaction =
                transactionRepository.save(transaction);

        // Send to Kafka
        kafkaProducerService.sendTransaction(savedTransaction);

        return savedTransaction;
    }

    public List<Transaction> getAllTransactions() {
        return transactionRepository.findAll();
    }
    public Transaction getTransactionById(Long id) {

        return transactionRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Transaction not found: " + id
                        )
                );
    }
}