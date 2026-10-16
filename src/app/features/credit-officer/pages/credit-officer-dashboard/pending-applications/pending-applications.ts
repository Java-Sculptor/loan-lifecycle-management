
import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  OnInit,
  inject
} from '@angular/core';
import { FormsModule } from '@angular/forms';

import { CreditOfficerLoanSidebar } from '../../../../../core/theme/credit-officer-loan-sidebar/credit-officer-loan-sidebar';
import {
  LoanApplicationResult,
  LoanApplicationService
} from '../../../../loan/services/loan-application';

@Component({
  selector: 'app-pending-applications',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CreditOfficerLoanSidebar
  ],
  templateUrl: './pending-applications.html',
  styleUrl: './pending-applications.css'
})
export class PendingApplications implements OnInit {
  private readonly applicationService = inject(LoanApplicationService);
  private readonly cdr = inject(ChangeDetectorRef);

  pendingApplications: LoanApplicationResult[] = [];

  isLoading = false;
  actingApplicationId: number | null = null;

  errorMessage = '';
  successMessage = '';

  selectedApplication: LoanApplicationResult | null = null;

  rejectionApplicationId: number | null = null;
  rejectionReason = '';

  ngOnInit(): void {
    this.loadPendingApplications();
  }

  loadPendingApplications(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.cdr.markForCheck();

    this.applicationService.getPendingApplications().subscribe({
      next: response => {
        this.pendingApplications = response.data ?? [];
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: error => {
        console.error('Failed to load pending applications:', error);

        this.errorMessage =
          error?.error?.message
          || error?.error?.error
          || 'Unable to load pending applications. Please try again.';

        this.isLoading = false;
        this.cdr.markForCheck();
      }
    });
  }

  viewApplication(application: LoanApplicationResult): void {
    this.selectedApplication = application;
    this.errorMessage = '';
    this.cdr.markForCheck();
  }

  closeApplicationDetails(): void {
    this.selectedApplication = null;
    this.cdr.markForCheck();
  }

  verifyDocuments(application: LoanApplicationResult): void {
    if (application.documentVerificationStatus === 'VERIFIED') {
      this.errorMessage = 'Documents are already verified.';
      return;
    }

    if (application.documentVerificationStatus === 'REJECTED') {
      this.errorMessage = 'Rejected documents cannot be marked as verified.';
      return;
    }

    this.runApplicationAction(
      application.loanApplicationId,
      () => this.applicationService.verifyDocuments(
        application.loanApplicationId
      ),
      'Documents verified successfully.'
    );
  }

  approveApplication(application: LoanApplicationResult): void {
    if (application.documentVerificationStatus !== 'VERIFIED') {
      this.errorMessage =
        'Verify the customer documents before approving this application.';
      return;
    }

    this.runApplicationAction(
      application.loanApplicationId,
      () => this.applicationService.approveApplication(
        application.loanApplicationId
      ),
      'Loan application approved successfully.'
    );
  }

  openRejectionForm(application: LoanApplicationResult): void {
    this.selectedApplication = application;
    this.rejectionApplicationId = application.loanApplicationId;
    this.rejectionReason = '';
    this.errorMessage = '';
    this.cdr.markForCheck();
  }

  cancelRejection(): void {
    this.rejectionApplicationId = null;
    this.rejectionReason = '';
    this.cdr.markForCheck();
  }

  confirmRejection(): void {
    const applicationId = this.rejectionApplicationId;
    const reason = this.rejectionReason.trim();

    if (applicationId === null) {
      this.errorMessage = 'Select an application to reject.';
      return;
    }

    if (!reason) {
      this.errorMessage = 'A rejection reason is required.';
      return;
    }

    if (reason.length > 1000) {
      this.errorMessage =
        'The rejection reason cannot exceed 1000 characters.';
      return;
    }

    this.runApplicationAction(
      applicationId,
      () => this.applicationService.rejectApplication(
        applicationId,
        reason
      ),
      'Loan application rejected successfully.'
    );
  }

  getStatusLabel(status: string | null | undefined): string {
    switch (status?.toUpperCase()) {
      case 'APPLIED':
        return 'Pending Review';
      case 'APPROVED':
        return 'Approved';
      case 'REJECTED':
        return 'Rejected';
      case 'ELIGIBLE':
        return 'Eligible';
      case 'NOT_ELIGIBLE':
        return 'Not Eligible';
      case 'SANCTIONED':
        return 'Sanctioned';
      case 'DISBURSED':
        return 'Disbursed';
      default:
        return status || 'Unknown';
    }
  }

  private runApplicationAction(
    applicationId: number,
    action: () => import('rxjs').Observable<unknown>,
    successMessage: string
  ): void {
    this.actingApplicationId = applicationId;
    this.errorMessage = '';
    this.successMessage = '';
    this.cdr.markForCheck();

    action().subscribe({
      next: () => {
        this.successMessage = successMessage;
        this.actingApplicationId = null;
        this.rejectionApplicationId = null;
        this.rejectionReason = '';
        this.selectedApplication = null;

        // Refresh the queue after verification, approval, or rejection.
        this.loadPendingApplications();
      },
      error: error => {
        console.error('Credit Officer action failed:', error);

        this.errorMessage =
          error?.error?.message
          || error?.error?.error
          || 'The requested action could not be completed.';

        this.actingApplicationId = null;
        this.cdr.markForCheck();
      }
    });
  }
}
