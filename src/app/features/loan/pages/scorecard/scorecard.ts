import { CommonModule } from '@angular/common';
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
  ScorecardResult,
  ScorecardService
} from '../../services/scorecard';

@Component({
  selector: 'app-scorecard',
  standalone: true,
  imports: [
    CommonModule,
    LoanSidebar,
    CreditOfficerLoanSidebar
  ],
  templateUrl: './scorecard.html',
  styleUrl: './scorecard.css'
})
export class Scorecard {
  private readonly scorecardService = inject(ScorecardService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly router = inject(Router);

  private activeRequest?: Subscription;
  private requestVersion = 0;

  get isOfficerView(): boolean {
    return this.router.url.startsWith('/officer/');
  }

  applicationIdInput = '';
  result: ScorecardResult | null = null;

  isLoading = false;
  errorMessage = '';
  successMessage = '';

  onApplicationIdChange(value: string): void {
    this.applicationIdInput = value;

    // Cancel any request associated with the previous ID.
    this.requestVersion++;
    this.activeRequest?.unsubscribe();
    this.activeRequest = undefined;

    // Never keep showing a scorecard for a different application.
    this.result = null;
    this.isLoading = false;
    this.errorMessage = '';
    this.successMessage = '';

    this.cdr.markForCheck();
  }

  generateScorecard(): void {
    const applicationId = this.getApplicationId();

    if (applicationId === null) {
      return;
    }

    this.cancelActiveRequest();

    const currentRequest = this.requestVersion;

    this.isLoading = true;
    this.result = null;
    this.errorMessage = '';
    this.successMessage = '';

    this.cdr.markForCheck();

    this.activeRequest = this.scorecardService
      .generateScorecard(applicationId)
      .subscribe({
        next: response => {
          if (currentRequest !== this.requestVersion) {
            return;
          }

          this.result = response.data;
          this.successMessage =
            response.message || 'Scorecard generated successfully.';

          this.isLoading = false;
          this.activeRequest = undefined;

          this.cdr.markForCheck();
        },
        error: error => {
          if (currentRequest !== this.requestVersion) {
            return;
          }

          console.error('Scorecard generation failed:', error);

          this.errorMessage =
            error?.error?.message ||
            error?.error?.error ||
            'Unable to generate the scorecard. Check the application ID and eligibility status. If a scorecard already exists, use View Existing Scorecard.';

          this.isLoading = false;
          this.activeRequest = undefined;

          this.cdr.markForCheck();
        }
      });
  }

  loadExistingScorecard(): void {
    const applicationId = this.getApplicationId();

    if (applicationId === null) {
      return;
    }

    this.cancelActiveRequest();

    const currentRequest = this.requestVersion;

    this.isLoading = true;
    this.result = null;
    this.errorMessage = '';
    this.successMessage = '';

    this.cdr.markForCheck();

    this.activeRequest = this.scorecardService
      .getScorecard(applicationId)
      .subscribe({
        next: response => {
          if (currentRequest !== this.requestVersion) {
            return;
          }

          this.result = response.data;
          this.successMessage =
            response.message || 'Existing scorecard loaded successfully.';

          this.isLoading = false;
          this.activeRequest = undefined;

          this.cdr.markForCheck();
        },
        error: error => {
          if (currentRequest !== this.requestVersion) {
            return;
          }

          console.error('Fetching scorecard failed:', error);

          this.errorMessage =
            error?.error?.message ||
            error?.error?.error ||
            'No existing scorecard was found for this application.';

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