package com.example.Loan_Project.Entity;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;

@Entity
@Table(name = "cibil_eligibility_rules")
@Data
public class CibilEligibilityRule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Integer minCibilScore;

    private Integer maxCibilScore;

    @Column(nullable = false)
    private String status;

    @Column(nullable = false)
    private BigDecimal eligibleAmount;

    @Column(nullable = false)
    private Boolean active = true;
}