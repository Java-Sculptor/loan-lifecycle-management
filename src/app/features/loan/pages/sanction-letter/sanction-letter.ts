
import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  inject
} from '@angular/core';
import { Subscription } from 'rxjs';

import {
  LoanSidebar
} from '../../../../core/theme/loan-sidebar/loan-sidebar';

import {
  LoanProcessingResult,
  LoanProcessingService
} from '../../services/loan-processing';

import {
  SanctionLetterService
} from '../../services/sanction-letter';

@Component({
  selector: 'app-sanction-letter',
  standalone: true,
  imports: [CommonModule, LoanSidebar],
  templateUrl: './sanction-letter.html',
  styleUrl: './sanction-letter.css'
})
export class SanctionLetter {
  private readonly loanProcessingService =
    inject(LoanProcessingService);

  private readonly sanctionLetterService =
    inject(SanctionLetterService);

  private readonly cdr = inject(ChangeDetectorRef);

  private processingRequest?: Subscription;
  private downloadRequest?: Subscription;

  applicationIdInput = '';

  processingDetails: LoanProcessingResult | null = null;

  isLoading = false;
  isDownloading = false;

  errorMessage = '';
  successMessage = '';

  onApplicationIdChange(value: string): void {
    this.applicationIdInput = value;

    this.processingRequest?.unsubscribe();
    this.downloadRequest?.unsubscribe();

    this.processingDetails = null;
    this.isLoading = false;
    this.isDownloading = false;

    this.errorMessage = '';
    this.successMessage = '';

    this.cdr.markForCheck();
  }

  loadLoanStatus(): void {
    const applicationId = this.getApplicationId();

    if (applicationId === null) {
      return;
    }

    this.processingRequest?.unsubscribe();

    this.isLoading = true;
    this.processingDetails = null;
    this.errorMessage = '';
    this.successMessage = '';

    this.cdr.markForCheck();

    this.processingRequest = this.loanProcessingService
      .getProcessingDetails(applicationId)
      .subscribe({
        next: response => {
          this.processingDetails = response.data;
          this.isLoading = false;
          this.successMessage = 'Loan processing details loaded successfully.';

          this.cdr.markForCheck();
        },
        error: error => {
          console.error('Failed to load loan status:', error);

          this.processingDetails = null;
          this.isLoading = false;

          this.errorMessage =
            error?.error?.message ||
            'Loan processing details could not be found for this application.';

          this.cdr.markForCheck();
        }
      });
  }

  downloadSanctionLetter(): void {
    const applicationId = this.getApplicationId();

    if (applicationId === null) {
      return;
    }

    this.downloadRequest?.unsubscribe();

    this.isDownloading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.cdr.markForCheck();

    this.downloadRequest = this.sanctionLetterService
      .downloadSanctionLetter(applicationId)
      .subscribe({
        next: blob => {
          const downloadUrl = URL.createObjectURL(blob);
          const link = document.createElement('a');

          link.href = downloadUrl;
          link.download = `sanction-letter-${applicationId}.pdf`;

          document.body.appendChild(link);
          link.click();
          link.remove();

          setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000);

          this.isDownloading = false;
          this.successMessage = 'Sanction letter PDF downloaded successfully.';

          this.cdr.markForCheck();
        },
        error: error => {
          console.error('Sanction letter download failed:', error);

          this.isDownloading = false;

          this.errorMessage =
            error?.error?.message ||
            'Unable to download the sanction letter. Please check whether it has been generated.';

          this.cdr.markForCheck();
        }
      });
  }

  private getApplicationId(): number | null {
    const value = this.applicationIdInput.trim();
    const applicationId = Number(value);

    this.errorMessage = '';

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
