package com.example.Loan_Project.Controller;

import com.example.Loan_Project.Entity.LoanProcessing;
import com.example.Loan_Project.Service.LoanProcessingService;
import com.example.Loan_Project.Service.SanctionLetterService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.example.Loan_Project.DTO.SanctionLetterResponse;
import com.example.Loan_Project.Service.SanctionLetterService;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import java.io.IOException;
import java.nio.file.Path;
@RestController
@RequestMapping("/loan-processing")
public class LoanProcessingController {

    private final LoanProcessingService loanProcessingService;
    private final SanctionLetterService sanctionLetterService;

    public LoanProcessingController(
            LoanProcessingService loanProcessingService,
            SanctionLetterService sanctionLetterService) {

        this.loanProcessingService = loanProcessingService;
        this.sanctionLetterService = sanctionLetterService;
    }

    @PostMapping("/sanction/{loanApplicationId}")
    public ResponseEntity<LoanProcessing> createSanction(
            @PathVariable Long loanApplicationId) {

        return ResponseEntity.ok(
                loanProcessingService.createSanction(loanApplicationId)
        );
    }

    @PostMapping("/disbursement/{loanApplicationId}")
    public ResponseEntity<LoanProcessing> disburseLoan(
            @PathVariable Long loanApplicationId) {

        return ResponseEntity.ok(
                loanProcessingService.disburseLoan(loanApplicationId)
        );
    }

    @GetMapping("/details/{loanApplicationId}")
    public ResponseEntity<LoanProcessing> getProcessingDetails(
            @PathVariable Long loanApplicationId) {

        return ResponseEntity.ok(
                loanProcessingService.getProcessingDetails(loanApplicationId)
        );
    }
    @PostMapping("/sanction-letter/{loanApplicationId}")
    public ResponseEntity<SanctionLetterResponse> generateSanctionLetter(
            @PathVariable Long loanApplicationId) {

        return ResponseEntity.ok(
                sanctionLetterService.generateSanctionLetter(
                        loanApplicationId
                )
        );
    }

    @GetMapping("/sanction-letter/{loanApplicationId}/download")
    public ResponseEntity<Resource> downloadSanctionLetter(
            @PathVariable Long loanApplicationId) throws IOException {

        Path path = sanctionLetterService.getSanctionLetterPath(
                loanApplicationId
        );

        Resource resource = new FileSystemResource(path);

        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(
                        HttpHeaders.CONTENT_DISPOSITION,
                        ContentDisposition.attachment()
                                .filename(path.getFileName().toString())
                                .build()
                                .toString()
                )
                .body(resource);
    }
}