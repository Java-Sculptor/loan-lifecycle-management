
import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { LoanSidebar } from '../../../../core/theme/loan-sidebar/loan-sidebar';
import { LoanApplicationResult, LoanApplicationService } from '../../services/loan-application';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-my-applications',
  standalone: true,
  imports: [CommonModule, RouterLink, LoanSidebar],
  templateUrl: './my-applications.html',
  styleUrl: './my-applications.css'
})
export class MyApplications implements OnInit {
  private readonly applicationService = inject(LoanApplicationService);
  private readonly cdr = inject(ChangeDetectorRef);

  // Temporary testing ID; replace with the authenticated customer's ID later.
  customerId = 1;

  applications: LoanApplicationResult[] = [];
  isLoading = false;
  errorMessage = '';

  ngOnInit(): void {
    this.loadApplications();
  }

  loadApplications(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.cdr.markForCheck();

    this.applicationService
      .getApplicationsByCustomer(this.customerId)
      .subscribe({
        next: response => {
          this.applications = response.data ?? [];
          this.isLoading = false;
          this.cdr.markForCheck();
        },
        error: error => {
          console.error('Failed to load loan applications:', error);

          this.errorMessage =
            error?.error?.message
            || 'Unable to load your applications. Please try again.';

          this.isLoading = false;
          this.cdr.markForCheck();
        }
      });
  }

  getStatusLabel(status: string | null | undefined): string {
    switch (status?.toUpperCase()) {
      case 'APPLIED':
        return 'Application Submitted';
      case 'APPROVED':
        return 'Approved by Credit Officer';
      case 'REJECTED':
        return 'Application Rejected';
      case 'ELIGIBLE':
        return 'Eligible';
      case 'NOT_ELIGIBLE':
        return 'Not Eligible';
      case 'SANCTIONED':
        return 'Loan Sanctioned';
      case 'DISBURSED':
        return 'Loan Disbursed';
      default:
        return status || 'Unknown';
    }
  }

  getStatusClass(status: string | null | undefined): string {
    switch (status?.toUpperCase()) {
      case 'APPROVED':
      case 'ELIGIBLE':
      case 'SANCTIONED':
      case 'DISBURSED':
        return 'status-success';

      case 'REJECTED':
      case 'NOT_ELIGIBLE':
        return 'status-danger';

      case 'APPLIED':
        return 'status-pending';

      default:
        return 'status-neutral';
    }
  }

  getProgressStep(status: string | null | undefined): number {
    switch (status?.toUpperCase()) {
      case 'APPLIED':
        return 1;
      case 'APPROVED':
        return 2;
      case 'ELIGIBLE':
        return 3;
      case 'SANCTIONED':
        return 4;
      case 'DISBURSED':
        return 5;
      default:
        return 0;
    }
  }

  isRejected(status: string | null | undefined): boolean {
    return ['REJECTED', 'NOT_ELIGIBLE'].includes(
      status?.toUpperCase() ?? ''
    );
  }
}
