
import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  inject
} from '@angular/core';
import { Subscription } from 'rxjs';

import {
  CreditOfficerLoanSidebar
} from '../../../../core/theme/credit-officer-loan-sidebar/credit-officer-loan-sidebar';

import {
  SanctionLetterResult,
  SanctionLetterService
} from '../../../loan/services/sanction-letter';

import {
  LoanProcessingResult,
  LoanProcessingService
} from '../../../loan/services/loan-processing';

@Component({
  selector: 'app-credit-officer-loan-processing',
  standalone: true,
  imports: [CommonModule, CreditOfficerLoanSidebar],
  templateUrl: './loan-processing.html',
  styleUrl: './loan-processing.css'
})
export class CreditOfficerLoanProcessing {
  private readonly sanctionLetterService =
    inject(SanctionLetterService);

  private readonly loanProcessingService =
    inject(LoanProcessingService);

  private readonly cdr = inject(ChangeDetectorRef);

  private generateRequest?: Subscription;
  private downloadRequest?: Subscription;
  private processingRequest?: Subscription;
  private disbursementRequest?: Subscription;

  applicationIdInput = '';

  result: SanctionLetterResult | null = null;
  processingDetails: LoanProcessingResult | null = null;

  isGenerating = false;
  isDownloading = false;
  isLoadingProcessing = false;
  isDisbursing = false;

  errorMessage = '';
  successMessage = '';
  disbursementError = '';
  disbursementSuccess = '';

  get isAlreadyDisbursed(): boolean {
    return this.processingDetails?.disbursementStatus === 'DISBURSED';
  }

  onApplicationIdChange(value: string): void {
    this.applicationIdInput = value;

    // Clear stale results whenever the officer changes the application ID.
    this.generateRequest?.unsubscribe();
    this.downloadRequest?.unsubscribe();
    this.processingRequest?.unsubscribe();
    this.disbursementRequest?.unsubscribe();

    this.result = null;
    this.processingDetails = null;

    this.isGenerating = false;
    this.isDownloading = false;
    this.isLoadingProcessing = false;
    this.isDisbursing = false;

    this.errorMessage = '';
    this.successMessage = '';
    this.disbursementError = '';
    this.disbursementSuccess = '';

    this.cdr.markForCheck();
  }

  generateSanctionLetter(): void {
    const applicationId = this.getApplicationId();

    if (applicationId === null) {
      return;
    }

    this.generateRequest?.unsubscribe();

    this.isGenerating = true;
    this.errorMessage = '';
    this.successMessage = '';
    this.disbursementError = '';
    this.disbursementSuccess = '';
    this.result = null;
    this.processingDetails = null;

    this.cdr.markForCheck();

    this.generateRequest = this.sanctionLetterService
      .generateSanctionLetter(applicationId)
      .subscribe({
        next: response => {
          this.result = response.data;
          this.successMessage =
            response.message || 'Sanction letter processed successfully.';

          this.isGenerating = false;
          this.cdr.markForCheck();

          this.loadProcessingDetails(applicationId);
        },
        error: error => {
          console.error('Sanction letter generation failed:', error);

          this.errorMessage =
            error?.error?.message ||
            error?.error?.error ||
            'Unable to process the sanction letter. Check the application status.';

          this.isGenerating = false;
          this.cdr.markForCheck();
        }
      });
  }

  downloadSanctionLetter(): void {
    const applicationId =
      this.result?.loanApplicationId ??
      Number(this.applicationIdInput.trim());

    if (!Number.isInteger(applicationId) || applicationId <= 0) {
      this.errorMessage = 'Please enter a valid loan application ID.';
      this.cdr.markForCheck();
      return;
    }

    this.downloadRequest?.unsubscribe();

    this.isDownloading = true;
    this.errorMessage = '';
    this.cdr.markForCheck();

    this.downloadRequest = this.sanctionLetterService
      .downloadSanctionLetter(applicationId)
      .subscribe({
        next: blob => {
          const downloadUrl = URL.createObjectURL(blob);
          const link = document.createElement('a');

          link.href = downloadUrl;
          link.download =
            `${this.result?.sanctionLetterNumber || 'sanction-letter'}.pdf`;

          document.body.appendChild(link);
          link.click();
          link.remove();

          setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000);

          this.isDownloading = false;
          this.cdr.markForCheck();
        },
        error: error => {
          console.error('Sanction letter download failed:', error);

          this.errorMessage =
            'Unable to download the sanction letter. Ensure it has been generated.';

          this.isDownloading = false;
          this.cdr.markForCheck();
        }
      });
  }

  loadProcessingDetails(applicationId: number): void {
    this.processingRequest?.unsubscribe();

    this.isLoadingProcessing = true;
    this.cdr.markForCheck();

    this.processingRequest = this.loanProcessingService
      .getProcessingDetails(applicationId)
      .subscribe({
        next: response => {
          this.processingDetails = response.data;
          this.isLoadingProcessing = false;
          this.cdr.markForCheck();
        },
        error: error => {
          console.error('Could not load processing details:', error);

          this.processingDetails = null;
          this.isLoadingProcessing = false;
          this.cdr.markForCheck();
        }
      });
  }

  disburseLoan(): void {
    const applicationId = this.result?.loanApplicationId;

    if (!applicationId) {
      this.disbursementError =
        'Generate the sanction letter before disbursement.';
      return;
    }

    if (this.isAlreadyDisbursed) {
      this.disbursementError = 'This loan has already been disbursed.';
      return;
    }

    if (this.isDisbursing) {
      return;
    }

    if (!window.confirm(
      `Confirm disbursement for loan application ${applicationId}?`
    )) {
      return;
    }

    this.disbursementRequest?.unsubscribe();

    this.isDisbursing = true;
    this.disbursementError = '';
    this.disbursementSuccess = '';
    this.cdr.markForCheck();

    this.disbursementRequest = this.loanProcessingService
      .disburseLoan(applicationId)
      .subscribe({
        next: response => {
          this.processingDetails = response.data;
          this.disbursementSuccess =
            response.message || 'Loan disbursed successfully.';

          this.isDisbursing = false;
          this.cdr.markForCheck();
        },
        error: error => {
          console.error('Loan disbursement failed:', error);

          this.disbursementError =
            error?.error?.message ||
            error?.error?.error ||
            'Disbursement failed. Check the sanction letter and email status.';

          this.isDisbursing = false;
          this.cdr.markForCheck();
        }
      });
  }

  private getApplicationId(): number | null {
    const value = this.applicationIdInput.trim();
    const applicationId = Number(value);

    this.errorMessage = '';
    this.successMessage = '';

    if (
      value === '' ||
      !Number.isInteger(applicationId) ||
      applicationId <= 0
    ) {
      this.errorMessage = 'Please enter a valid loan application ID.';
      this.cdr.markForCheck();
      return null;
    }

    return applicationId;
  }
}
