
import {
  ChangeDetectorRef,
  Component,
  OnInit,
  inject
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import { LoanSidebar } from '../../../../core/theme/loan-sidebar/loan-sidebar';
import {
  LoanDeal,
  LoanDealService
} from '../../services/loan-deal';

@Component({
  selector: 'app-loan-list',
  standalone: true,
  imports: [CommonModule, RouterLink, LoanSidebar],
  templateUrl: './loan-list.html',
  styleUrl: './loan-list.css'
})
export class LoanList implements OnInit {
  private readonly loanDealService = inject(LoanDealService);
  private readonly cdr = inject(ChangeDetectorRef);

  loanDeals: LoanDeal[] = [];
  isLoading = true;
  errorMessage = '';

  ngOnInit(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.loanDealService.getActiveLoanDeals().subscribe({
      next: deals => {
        this.loanDeals = deals;
        this.isLoading = false;

        this.cdr.markForCheck();
      },
      error: error => {
        console.error('Failed to load loan deals:', error);

        this.errorMessage = 'Unable to load loan deals. Please try again.';
        this.isLoading = false;

        this.cdr.markForCheck();
      }
    });
  }
}
