package com.example.Loan_Project.ServiceImpl;

import com.example.Loan_Project.Entity.CibilEligibilityRule;
import com.example.Loan_Project.Entity.LoanApplication;
import com.example.Loan_Project.Entity.LoanDeal;
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
public class LoanEligibilityServiceImpl
        implements LoanEligibilityService {

    private final LoanApplicationRepository loanApplicationRepository;
    private final LoanEligibilityRepository loanEligibilityRepository;
    private final CibilEligibilityRuleRepository cibilEligibilityRuleRepository;

    @Override
    @Transactional
    public LoanEligibility checkEligibility(Long loanApplicationId) {

        // Step 1: Find the loan application
        LoanApplication application = loanApplicationRepository
                .findById(loanApplicationId)
                .orElseThrow(() ->
                        new RuntimeException("Loan application not found"));

        // Step 2: Prevent duplicate eligibility records
        if (loanEligibilityRepository
                .findByLoanApplicationLoanApplicationId(loanApplicationId)
                .isPresent()) {

            throw new RuntimeException(
                    "Eligibility already checked for this application");
        }

        // Step 3: Validate document verification
        DocumentVerificationStatus documentStatus =
                application.getDocumentVerificationStatus();

        if (documentStatus == null
                || documentStatus == DocumentVerificationStatus.PENDING) {

            throw new RuntimeException(
                    "Document verification is pending");
        }

        if (documentStatus == DocumentVerificationStatus.REJECTED) {

            throw new RuntimeException(
                    "Document verification rejected");
        }

        // Step 4: Get the CIBIL score
        Integer cibilScore = application.getCibilScore();

        if (cibilScore == null) {
            throw new RuntimeException(
                    "CIBIL score is not available");
        }

        // Step 5: Get the requested loan amount
        BigDecimal requestedAmount = application.getRequestedAmount();

        if (requestedAmount == null
                || requestedAmount.compareTo(BigDecimal.ZERO) <= 0) {

            throw new RuntimeException(
                    "Requested loan amount must be greater than zero");
        }

        // Step 6: Find the applicable CIBIL eligibility rule
        CibilEligibilityRule rule = cibilEligibilityRuleRepository
                .findMatchingRule(cibilScore)
                .orElseThrow(() ->
                        new RuntimeException(
                                "No CIBIL eligibility rule found for score: "
                                        + cibilScore));

        // Step 7: Get the selected loan deal
        LoanDeal loanDeal = application.getLoanDeal();

        if (loanDeal == null) {
            throw new RuntimeException(
                    "Loan deal is not assigned to the application");
        }

        // Step 8: Determine the effective eligible amount
        BigDecimal eligibleAmount = rule.getEligibleAmount();
        BigDecimal dealMaxAmount = loanDeal.getMaxLoanAmount();

        if (eligibleAmount == null || dealMaxAmount == null) {
            throw new RuntimeException(
                    "Eligible amount or loan deal maximum is not configured");
        }

        // Eligible amount cannot exceed the deal's maximum
        if (dealMaxAmount.compareTo(eligibleAmount) < 0) {
            eligibleAmount = dealMaxAmount;
        }

        // Step 9: Create the eligibility record
        LoanEligibility eligibility = new LoanEligibility();

        eligibility.setLoanApplication(application);
        eligibility.setCibilScore(cibilScore);
        eligibility.setCibilStatus(rule.getStatus());
        eligibility.setEligibleAmount(eligibleAmount);
        eligibility.setEvaluatedAt(LocalDateTime.now());

        // Step 10: Evaluate eligibility
        boolean isEligible = calculateEligibility(
                cibilScore,
                requestedAmount,
                eligibleAmount
        );

        eligibility.setEligible(isEligible);

        // Step 11: Update remarks and application status
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

        // Step 12: Save the updated application and eligibility result
        loanApplicationRepository.save(application);

        return loanEligibilityRepository.save(eligibility);
    }

    @Override
    @Transactional(readOnly = true)
    public LoanEligibility getEligibility(Long loanApplicationId) {

        return loanEligibilityRepository
                .findByLoanApplicationLoanApplicationId(loanApplicationId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Eligibility not found for this application"));
    }

    // Checks the CIBIL minimum and requested amount
    private boolean calculateEligibility(
            Integer cibilScore,
            BigDecimal requestedAmount,
            BigDecimal eligibleAmount) {

        // Scores below 650 are not eligible
        if (cibilScore < 650) {
            return false;
        }

        // Requested amount must not exceed the effective eligible amount
        return requestedAmount.compareTo(eligibleAmount) <= 0;
    }
}