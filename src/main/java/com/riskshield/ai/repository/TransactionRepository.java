package com.riskshield.ai.repository;

import com.riskshield.ai.model.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;

public interface TransactionRepository
        extends JpaRepository<Transaction, Long> {

    long countByUserIdAndCreatedAtAfter(
            Long userId,
            LocalDateTime dateTime
    );

    // Existing RiskEngine method
    @Query("""
            SELECT AVG(t.amount)
            FROM Transaction t
            WHERE t.userId = :userId
            """)
    Double findAverageAmountByUserId(
            @Param("userId") Long userId
    );

    // New 7-day average method
    @Query("""
            SELECT AVG(t.amount)
            FROM Transaction t
            WHERE t.userId = :userId
            AND t.createdAt >= :dateTime
            """)
    Double findAverageAmountByUserIdAndCreatedAtAfter(
            @Param("userId") Long userId,
            @Param("dateTime") LocalDateTime dateTime
    );

    boolean existsByUserIdAndDeviceIdAndIdNot(
            Long userId,
            String deviceId,
            Long id
    );

    boolean existsByUserIdAndLocationAndIdNot(
            Long userId,
            String location,
            Long id
    );
}