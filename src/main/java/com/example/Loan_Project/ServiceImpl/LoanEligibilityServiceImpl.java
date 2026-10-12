package com.example.Loan_Project.ServiceImpl;

import com.example.Loan_Project.Entity.CibilEligibilityRule;
import com.example.Loan_Project.Entity.LoanApplication;
import com.example.Loan_Project.Entity.LoanEligibility;
import com.example.Loan_Project.Enum.DocumentVerificationStatus;
import com.example.Loan_Project.Enum.LoanApplicationStatus;
import com.example.Loan_Project.Repository.CibilEligibilityRuleRepository;
import com.example.Loan_Project.Repository.LoanApplicationRepository;
import com.example.Loan_Project.Repository.LoanEligibilityRepository;
import com.example.Loan_Project.Service.LoanEligibilityService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class LoanEligibilityServiceImpl implements LoanEligibilityService {

    private final LoanApplicationRepository loanApplicationRepository;
    private final LoanEligibilityRepository loanEligibilityRepository;
    private final CibilEligibilityRuleRepository cibilEligibilityRuleRepository;

    @Override
    @Transactional
    public LoanEligibility checkEligibility(Long loanApplicationId) {

        LoanApplication application = loanApplicationRepository
                .findById(loanApplicationId)
                .orElseThrow(() ->
                        new RuntimeException("Loan application not found"));

        if (loanEligibilityRepository
                .findByLoanApplicationLoanApplicationId(loanApplicationId)
                .isPresent()) {

            throw new RuntimeException(
                    "Eligibility already checked for this application");
        }

        if (application.getDocumentVerificationStatus() == null ||
                application.getDocumentVerificationStatus()
                        == DocumentVerificationStatus.PENDING) {

            throw new RuntimeException(
                    "Document verification is pending");
        }

        if (application.getDocumentVerificationStatus()
                == DocumentVerificationStatus.REJECTED) {

            throw new RuntimeException(
                    "Document verification rejected");
        }

        Integer cibilScore = application.getCibilScore();

        if (cibilScore == null) {
            throw new RuntimeException(
                    "CIBIL score is not available");
        }

        BigDecimal requestedAmount =
                application.getRequestedAmount();

        if (requestedAmount == null) {
            throw new RuntimeException(
                    "Requested loan amount is not available");
        }

        CibilEligibilityRule rule =
                cibilEligibilityRuleRepository
                        .findMatchingRule(cibilScore)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "No CIBIL eligibility rule found for score: "
                                                + cibilScore));

        LoanEligibility eligibility =
                new LoanEligibility();

        eligibility.setLoanApplication(application);
        eligibility.setCibilScore(cibilScore);
        eligibility.setCibilStatus(rule.getStatus());
        eligibility.setEligibleAmount(rule.getEligibleAmount());
        eligibility.setEvaluatedAt(LocalDateTime.now());

        boolean isEligible =
                calculateEligibility(
                        cibilScore,
                        requestedAmount,
                        rule);

        eligibility.setEligible(isEligible);

        if (isEligible) {

            eligibility.setRemarks(
                    "Customer is eligible for the requested loan amount");

            application.setStatus(
                    LoanApplicationStatus.ELIGIBLE);

        } else {

            eligibility.setRemarks(
                    "Customer is not eligible for the requested loan amount");

            application.setStatus(
                    LoanApplicationStatus.NOT_ELIGIBLE);
        }

        loanApplicationRepository.save(application);

        return loanEligibilityRepository.save(eligibility);
    }

    @Override
    public LoanEligibility getEligibility(Long loanApplicationId) {

        return loanEligibilityRepository
                .findByLoanApplicationLoanApplicationId(
                        loanApplicationId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Eligibility not found for this application"));
    }

    private boolean calculateEligibility(
            Integer cibilScore,
            BigDecimal requestedAmount,
            CibilEligibilityRule rule) {

        if (cibilScore < 650) {
            return false;
        }

        BigDecimal eligibleAmount =
                rule.getEligibleAmount();

        if (cibilScore >= 900) {
            return requestedAmount.compareTo(
                    eligibleAmount) > 0;
        }

        BigDecimal lowerLimit =
                getLowerLimit(cibilScore);

        return requestedAmount.compareTo(lowerLimit) >= 0
                && requestedAmount.compareTo(eligibleAmount) <= 0;
    }

    private BigDecimal getLowerLimit(Integer cibilScore) {

        if (cibilScore >= 800) {
            return new BigDecimal("7500000");
        }

        if (cibilScore >= 750) {
            return new BigDecimal("5000000");
        }

        if (cibilScore >= 700) {
            return new BigDecimal("2500000");
        }

        if (cibilScore >= 650) {
            return new BigDecimal("1000000");
        }

        return BigDecimal.ZERO;
    }
}