package com.riskshield.ai.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "transactions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Transaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private Long userId;
    private Double amount;
    private String location;
    private String deviceId;
    private Integer failedAttempts;
    private Double accountBalance;
    private Integer dailyTransactionCount;
    private Double averageTransactionAmount7d;
    private Double transactionDistance;
    private Integer ipAddressFlag;
    private Integer previousFraudulentActivity;
    private Integer cardAge;
    private Integer isWeekend;
    private LocalDateTime createdAt;
    private Integer riskScore;
    private String riskLevel;
    private String decision;
    private String aiReason;
}
