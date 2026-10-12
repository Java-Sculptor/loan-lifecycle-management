package com.example.Loan_Project.Entity;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "loan_eligibility")
@Data
public class LoanEligibility {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long eligibilityId;

    @OneToOne
    @JoinColumn(
            name = "loan_application_id",
            nullable = false,
            unique = true
    )
    private LoanApplication loanApplication;

    @Column(nullable = false)
    private Integer cibilScore;

    @Column(nullable = false)
    private String cibilStatus;

    @Column(nullable = false)
    private BigDecimal eligibleAmount;

    @Column(nullable = false)
    private Boolean eligible;

    private String remarks;

    @Column(nullable = false)
    private LocalDateTime evaluatedAt;
}