package com.riskshield.ai.service;

import com.riskshield.ai.model.Transaction;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

@Service
public class KafkaProducerService {

    private static final String TOPIC = "transaction-events";

    private final KafkaTemplate<String, Object> kafkaTemplate;

    public KafkaProducerService(
            KafkaTemplate<String, Object> kafkaTemplate) {

        this.kafkaTemplate = kafkaTemplate;
    }

    public void sendTransaction(Transaction transaction) {

        kafkaTemplate.send(
                TOPIC,
                String.valueOf(transaction.getId()),
                transaction
        );
    }
}
