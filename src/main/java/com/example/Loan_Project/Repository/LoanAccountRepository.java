package com.example.Loan_Project.Repository;

import com.example.Loan_Project.Entity.LoanAccount;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface LoanAccountRepository extends JpaRepository<LoanAccount, Long> {

    Optional<LoanAccount> findByLoanApplication_LoanApplicationId(Long loanApplicationId);

    Optional<LoanAccount> findByLoanAccountNo(String loanAccountNo);

    List<LoanAccount> findByCustomer_CustomerIdOrderByActivatedAtDesc(Long customerId);
}