package com.example.Loan_Project.ServiceImpl;

import com.example.Loan_Project.DTO.LoanApplicationRequest;
import com.example.Loan_Project.Entity.Customer;
import com.example.Loan_Project.Entity.LoanApplication;
import com.example.Loan_Project.Entity.LoanDeal;
import com.example.Loan_Project.Enum.DocumentVerificationStatus;
import com.example.Loan_Project.Enum.LoanApplicationStatus;
import com.example.Loan_Project.Repository.CustomerRepository;
import com.example.Loan_Project.Repository.LoanApplicationRepository;
import com.example.Loan_Project.Repository.LoanDealRepository;
import com.example.Loan_Project.Service.LoanApplicationService;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class LoanApplicationServiceImpl implements LoanApplicationService {

    private final LoanApplicationRepository loanApplicationRepository;
    private final CustomerRepository customerRepository;
    private final LoanDealRepository loanDealRepository;
    private final ModelMapper modelMapper;

    public LoanApplicationServiceImpl(
            LoanApplicationRepository loanApplicationRepository,
            CustomerRepository customerRepository,
            LoanDealRepository loanDealRepository,
            ModelMapper modelMapper) {

        this.loanApplicationRepository = loanApplicationRepository;
        this.customerRepository = customerRepository;
        this.loanDealRepository = loanDealRepository;
        this.modelMapper = modelMapper;
    }

    @Override
    public LoanApplication applyForLoan(LoanApplicationRequest request) {

        Customer customer = customerRepository.findById(request.getCustomerId())
                .orElseThrow(() ->
                        new RuntimeException("Customer not found"));

        LoanDeal loanDeal = loanDealRepository.findById(request.getLoanDealId())
                .orElseThrow(() ->
                        new RuntimeException("Loan deal not found"));

        if (!Boolean.TRUE.equals(loanDeal.getActive())) {
            throw new RuntimeException("Loan deal is not active");
        }

        LoanApplication application =
                modelMapper.map(request, LoanApplication.class);

        application.setCustomer(customer);
        application.setLoanDeal(loanDeal);
        application.setStatus(LoanApplicationStatus.APPLIED);

        application.setDocumentVerificationStatus(
                DocumentVerificationStatus.PENDING
        );

        application.setAppliedAt(LocalDateTime.now());

        return loanApplicationRepository.save(application);
    }

    @Override
    public LoanApplication getApplicationById(Long applicationId) {

        return loanApplicationRepository.findById(applicationId)
                .orElseThrow(() ->
                        new RuntimeException("Loan application not found"));
    }

    @Override
    public List<LoanApplication> getApplicationsByCustomer(Long customerId) {

        return loanApplicationRepository
                .findByCustomerCustomerId(customerId);
    }

    @Override
    public List<LoanApplication> getAllApplications() {

        return loanApplicationRepository.findAll();
    }

    @Override
    public LoanApplication updateDocumentVerificationStatus(
            Long applicationId,
            DocumentVerificationStatus status) {

        LoanApplication application =
                loanApplicationRepository.findById(applicationId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Loan application not found"
                                ));

        application.setDocumentVerificationStatus(status);

        return loanApplicationRepository.save(application);
    }
}