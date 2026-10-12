package com.example.Loan_Project.ServiceImpl;

import com.example.Loan_Project.Entity.LoanApplication;
import com.example.Loan_Project.Entity.LoanProcessing;
import com.example.Loan_Project.Service.SanctionLetterPdfService;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.font.PDFont;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.apache.pdfbox.pdmodel.font.Standard14Fonts;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.math.BigDecimal;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.text.NumberFormat;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Locale;

@Service
public class SanctionLetterPdfServiceImpl
        implements SanctionLetterPdfService {

    @Value("${app.documents.sanction-letter-dir:uploads/sanction-letters}")
    private String outputDirectory;

    private static final PDFont REGULAR =
            new PDType1Font(Standard14Fonts.FontName.HELVETICA);

    private static final PDFont BOLD =
            new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD);

    @Override
    public Path generate(
            LoanApplication application,
            LoanProcessing processing) throws IOException {

        Path directory = Paths.get(outputDirectory)
                .toAbsolutePath()
                .normalize();

        Files.createDirectories(directory);

        String fileName = processing.getSanctionLetterNumber()
                .replaceAll("[^A-Za-z0-9_-]", "") + ".pdf";

        Path pdfPath = directory.resolve(fileName).normalize();

        if (!pdfPath.startsWith(directory)) {
            throw new IOException("Invalid sanction letter file path");
        }

        String firstName = application.getCustomer().getFirstName();
        String lastName = application.getCustomer().getLastName();

        String customerName = (firstName == null ? "" : firstName)
                + " "
                + (lastName == null ? "" : lastName);

        String loanType = application.getLoanDeal()
                .getLoanType()
                .name()
                .replace('_', ' ');

        String issueDate = LocalDateTime.now()
                .format(DateTimeFormatter.ofPattern("dd MMM yyyy HH:mm"));

        try (PDDocument document = new PDDocument()) {

            PDPage page = new PDPage(PDRectangle.A4);
            document.addPage(page);

            try (PDPageContentStream content =
                         new PDPageContentStream(document, page)) {

                addText(content, "LOAN PROJECT", 50, 785, 15, true);
                addText(content, "LOAN SANCTION LETTER", 50, 745, 20, true);

                addText(content,
                        "Letter Number: " + processing.getSanctionLetterNumber(),
                        50, 710, 11, true);

                addText(content,
                        "Issue Date: " + issueDate,
                        50, 690, 10, false);

                addText(content, "Dear " + customerName.trim() + ",",
                        50, 645, 11, false);

                addText(content,
                        "We are pleased to inform you that your loan has been sanctioned.",
                        50, 620, 10, false);

                addText(content, "LOAN DETAILS", 50, 580, 13, true);

                addText(content,
                        "Application ID: " + application.getLoanApplicationId(),
                        50, 550, 11, false);

                addText(content,
                        "Loan Type: " + loanType,
                        50, 525, 11, false);

                addText(content,
                        "Sanctioned Amount: INR "
                                + formatAmount(processing.getSanctionedAmount()),
                        50, 500, 11, false);

                addText(content,
                        "Annual Interest Rate: "
                                + processing.getInterestRate() + "%",
                        50, 475, 11, false);

                addText(content,
                        "Loan Tenure: "
                                + processing.getTenureMonths() + " months",
                        50, 450, 11, false);

                addText(content,
                        "Monthly EMI: INR "
                                + formatAmount(processing.getMonthlyEmi()),
                        50, 425, 11, false);

                addText(content,
                        "Sanction Date: "
                                + processing.getSanctionedAt()
                                .format(DateTimeFormatter.ofPattern(
                                        "dd MMM yyyy HH:mm")),
                        50, 400, 11, false);

                addText(content, "IMPORTANT INFORMATION", 50, 350, 12, true);

                addText(content,
                        "1. The loan terms are those stated in this letter.",
                        50, 325, 10, false);

                addText(content,
                        "2. Disbursement is subject to applicable formalities.",
                        50, 305, 10, false);

                addText(content,
                        "3. EMI payments must follow the agreed repayment schedule.",
                        50, 285, 10, false);

                addText(content,
                        "4. Keep this letter for your records.",
                        50, 265, 10, false);

                addText(content,
                        "Regards,",
                        50, 215, 10, false);

                addText(content,
                        "Loan Project Team",
                        50, 195, 11, true);

                addText(content,
                        "This is a computer-generated sanction letter.",
                        50, 120, 9, false);
            }

            document.save(pdfPath.toFile());
        }

        return pdfPath;
    }

    private void addText(
            PDPageContentStream content,
            String text,
            float x,
            float y,
            int fontSize,
            boolean bold) throws IOException {

        content.beginText();
        content.setFont(bold ? BOLD : REGULAR, fontSize);
        content.newLineAtOffset(x, y);
        content.showText(toPdfSafeText(text));
        content.endText();
    }

    private String formatAmount(BigDecimal amount) {

        NumberFormat format =
                NumberFormat.getNumberInstance(Locale.forLanguageTag("en-IN"));

        format.setMinimumFractionDigits(2);
        format.setMaximumFractionDigits(2);

        return format.format(amount);
    }

    private String toPdfSafeText(String value) {

        return value == null
                ? ""
                : value.replaceAll("[^\\x20-\\x7E]", " ");
    }
}