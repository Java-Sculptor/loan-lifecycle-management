
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  ChangeDetectorRef,
  Component,
  inject
} from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

import {
  LoanSidebar
} from '../../../../core/theme/loan-sidebar/loan-sidebar';

import {
  CreditOfficerLoanSidebar
} from '../../../../core/theme/credit-officer-loan-sidebar/credit-officer-loan-sidebar';

import {
  LoanEligibilityResult,
  LoanEligibilityService
} from '../../services/loan-eligibility';

@Component({
  selector: 'app-loan-eligibility',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LoanSidebar,
    CreditOfficerLoanSidebar
  ],
  templateUrl: './loan-eligibility.html',
  styleUrl: './loan-eligibility.css'
})
export class LoanEligibility {
  private readonly eligibilityService = inject(LoanEligibilityService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly router = inject(Router);

  private activeRequest?: Subscription;
  private requestVersion = 0;

  get isOfficerView(): boolean {
    return this.router.url.startsWith('/officer/');
  }

  applicationIdInput = '';
  result: LoanEligibilityResult | null = null;

  isLoading = false;
  errorMessage = '';
  successMessage = '';

  onApplicationIdChange(value: string): void {
    this.applicationIdInput = value;

    this.requestVersion++;
    this.activeRequest?.unsubscribe();
    this.activeRequest = undefined;

    this.result = null;
    this.isLoading = false;
    this.errorMessage = '';
    this.successMessage = '';

    this.cdr.markForCheck();
  }

  checkEligibility(): void {
    const applicationId = this.getApplicationId();

    if (applicationId === null) {
      return;
    }

    this.cancelActiveRequest();

    const currentRequest = this.requestVersion;

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';
    this.result = null;

    this.cdr.markForCheck();

    this.activeRequest = this.eligibilityService
      .checkEligibility(applicationId)
      .subscribe({
        next: response => {
          if (currentRequest !== this.requestVersion) {
            return;
          }

          this.result = response.data;
          this.successMessage =
            response.message || 'Loan eligibility evaluated successfully.';

          this.isLoading = false;
          this.activeRequest = undefined;

          this.cdr.markForCheck();
        },
        error: error => {
          if (currentRequest !== this.requestVersion) {
            return;
          }

          console.error('Eligibility check failed:', error);

          this.errorMessage =
            error?.error?.message ||
            error?.error?.error ||
            'Unable to check eligibility. Please verify the application ID.';

          this.isLoading = false;
          this.activeRequest = undefined;

          this.cdr.markForCheck();
        }
      });
  }

  loadExistingEligibility(): void {
    const applicationId = this.getApplicationId();

    if (applicationId === null) {
      return;
    }

    this.cancelActiveRequest();

    const currentRequest = this.requestVersion;

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';
    this.result = null;

    this.cdr.markForCheck();

    this.activeRequest = this.eligibilityService
      .getEligibility(applicationId)
      .subscribe({
        next: response => {
          if (currentRequest !== this.requestVersion) {
            return;
          }

          if (response.data.loanApplicationId !== applicationId) {
            this.result = null;
            this.errorMessage =
              'The returned eligibility result does not match the application ID.';
          } else {
            this.result = response.data;
            this.successMessage =
              response.message ||
              'Existing eligibility result loaded successfully.';
          }

          this.isLoading = false;
          this.activeRequest = undefined;

          this.cdr.markForCheck();
        },
        error: error => {
          if (currentRequest !== this.requestVersion) {
            return;
          }

          console.error('Could not fetch eligibility:', error);

          this.errorMessage =
            error?.error?.message ||
            error?.error?.error ||
            'No existing eligibility result was found for this application.';

          this.isLoading = false;
          this.activeRequest = undefined;

          this.cdr.markForCheck();
        }
      });
  }

  private cancelActiveRequest(): void {
    this.requestVersion++;
    this.activeRequest?.unsubscribe();
    this.activeRequest = undefined;
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
