
import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject } from '@angular/core';

import { LoanSidebar } from '../../../../core/theme/loan-sidebar/loan-sidebar';
import {
  LoanAccountDetails,
  LoanAccountService
} from '../../services/loan-account';

@Component({
  selector: 'app-loan-account',
  standalone: true,
  imports: [CommonModule, LoanSidebar],
  templateUrl: './loan-account.html',
  styleUrl: './loan-account.css'
})
export class LoanAccount {
  private readonly loanAccountService = inject(LoanAccountService);
  private readonly cdr = inject(ChangeDetectorRef);

  applicationIdInput = '';
  account: LoanAccountDetails | null = null;

  isLoading = false;
  errorMessage = '';
  successMessage = '';

  onApplicationIdChange(value: string): void {
    this.applicationIdInput = value;

    if (value.trim() === '') {
      this.account = null;
      this.errorMessage = '';
      this.successMessage = '';
      this.isLoading = false;
      this.cdr.markForCheck();
    }
  }

  loadLoanAccount(): void {
    const applicationId = this.getApplicationId();

    if (applicationId === null) {
      return;
    }

    this.isLoading = true;
    this.account = null;
    this.errorMessage = '';
    this.successMessage = '';
    this.cdr.markForCheck();

    this.loanAccountService.getLoanAccountDetails(applicationId).subscribe({
      next: response => {
        this.account = response.data;
        this.successMessage = response.message || 'Loan account details fetched successfully.';
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: error => {
        console.error('Loan account retrieval failed:', error);

        this.errorMessage =
          error?.error?.message ||
          error?.error?.error ||
          'Unable to fetch loan account details. Check the application ID and disbursement status.';

        this.isLoading = false;
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
