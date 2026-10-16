
import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  DestroyRef,
  OnInit,
  inject
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { merge } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

import { LoanSidebar } from '../../../../core/theme/loan-sidebar/loan-sidebar';
import { LoanDeal, LoanDealService } from '../../services/loan-deal';
import {
  LoanApplicationResult,
  LoanApplicationService
} from '../../services/loan-application';

interface EmiCalculationResult {
  loanDealId: number;
  principalAmount: number;
  annualInterestRate: number;
  tenureMonths: number;
  monthlyEmi: number;
  totalPayment: number;
  totalInterest: number;
}

interface CibilCalculationResult {
  customerId: number;
  cibilScore: number;
  status?: string;
  decision?: string;
  eligibility?: string;
}

@Component({
  selector: 'app-apply-loan',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    LoanSidebar
  ],
  templateUrl: './apply-loan.html',
  styleUrl: './apply-loan.css'
})
export class ApplyLoan implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly dealService = inject(LoanDealService);
  private readonly applicationService = inject(LoanApplicationService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);

  loanDeals: LoanDeal[] = [];

  isLoading = true;
  isSubmitting = false;
  isLoadingCibil = false;
  isCalculatingEmi = false;

  errorMessage = '';
  successMessage = '';
  cibilError = '';
  emiError = '';

  cibilScore: number | null = null;
  emiPreview: EmiCalculationResult | null = null;

  createdApplication: LoanApplicationResult | null = null;

  form = this.fb.nonNullable.group({
    customerId: [1, [Validators.required, Validators.min(1)]],
    loanDealId: [1, [Validators.required, Validators.min(1)]],

    requestedAmount: [
      100000,
      [Validators.required, Validators.min(1)]
    ],

    tenureMonths: [
      12,
      [Validators.required, Validators.min(1)]
    ],

    bankName: ['', [Validators.required, Validators.maxLength(100)]],

    bankAccountNumber: [
      '',
      [
        Validators.required,
        Validators.pattern(/^[0-9]{9,18}$/)
      ]
    ],

    ifscCode: [
      '',
      [
        Validators.required,
        Validators.pattern(/^[A-Za-z]{4}0[A-Za-z0-9]{6}$/)
      ]
    ],

    emiDay: [
      5,
      [Validators.required, Validators.min(1), Validators.max(31)]
    ]
  });

  get selectedDeal(): LoanDeal | undefined {
    return this.loanDeals.find(
      deal => deal.loanDealId === this.form.controls.loanDealId.value
    );
  }

  ngOnInit(): void {
    this.setupPreviewRefresh();

    this.form.controls.customerId.valueChanges
      .pipe(
        debounceTime(400),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(() => {
        this.loadCibilScore();
      });

    this.dealService.getActiveLoanDeals().subscribe({
      next: deals => {
        this.loanDeals = deals;

        const requestedDealId = Number(
          this.route.snapshot.queryParamMap.get('dealId')
        );

        const selected =
          deals.find(deal => deal.loanDealId === requestedDealId)
          ?? deals[0];

        if (selected) {
          this.form.controls.loanDealId.setValue(
            selected.loanDealId,
            { emitEvent: false }
          );

          this.loadEmiPreview();
        }

        this.isLoading = false;
        this.cdr.markForCheck();

        this.loadCibilScore();
      },
      error: error => {
        console.error('Could not load loan deals:', error);
        this.errorMessage = 'Unable to load loan deals.';
        this.isLoading = false;
        this.cdr.markForCheck();
      }
    });
  }

  private setupPreviewRefresh(): void {
    merge(
      this.form.controls.loanDealId.valueChanges,
      this.form.controls.requestedAmount.valueChanges,
      this.form.controls.tenureMonths.valueChanges
    )
      .pipe(
        debounceTime(350),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(() => this.loadEmiPreview());
  }

  loadCibilScore(): void {
    const customerId = this.form.controls.customerId.value;

    if (!Number.isInteger(customerId) || customerId < 1) {
      this.cibilScore = null;
      this.cibilError = 'Enter a valid customer ID.';
      this.cdr.markForCheck();
      return;
    }

    this.isLoadingCibil = true;
    this.cibilError = '';
    this.cibilScore = null;
    this.cdr.markForCheck();

    this.applicationService.calculateCibilScore(customerId).subscribe({
      next: response => {
        const result = response.data as CibilCalculationResult;

        if (result?.cibilScore == null) {
          this.cibilError = 'The backend did not return a CIBIL score.';
        } else {
          this.cibilScore = result.cibilScore;
        }

        this.isLoadingCibil = false;
        this.cdr.markForCheck();
      },
      error: error => {
        console.error('CIBIL calculation failed:', error);

        this.cibilError =
          error?.error?.message
          || error?.error?.error
          || 'Unable to fetch the CIBIL score. Please try again.';

        this.isLoadingCibil = false;
        this.cdr.markForCheck();
      }
    });
  }

  loadEmiPreview(): void {
    const deal = this.selectedDeal;
    const requestedAmount = this.form.controls.requestedAmount.value;
    const tenureMonths = this.form.controls.tenureMonths.value;

    this.emiPreview = null;
    this.emiError = '';

    if (
      !deal
      || !Number.isFinite(requestedAmount)
      || requestedAmount <= 0
      || !Number.isInteger(tenureMonths)
      || tenureMonths <= 0
    ) {
      this.cdr.markForCheck();
      return;
    }

    if (requestedAmount > Number(deal.maxLoanAmount)) {
      this.emiError = 'Requested amount exceeds the maximum loan amount.';
      this.cdr.markForCheck();
      return;
    }

    if (tenureMonths > deal.maxTenureMonths) {
      this.emiError = 'Tenure exceeds the maximum allowed for this loan.';
      this.cdr.markForCheck();
      return;
    }

    this.isCalculatingEmi = true;
    this.cdr.markForCheck();

    this.applicationService.calculateEmi({
      loanDealId: deal.loanDealId,
      requestedAmount,
      tenureMonths
    }).subscribe({
      next: response => {
        this.emiPreview =
          response.data as EmiCalculationResult;

        this.isCalculatingEmi = false;
        this.cdr.markForCheck();
      },
      error: error => {
        console.error('EMI calculation failed:', error);

        this.emiError =
          error?.error?.message
          || error?.error?.error
          || 'Unable to calculate EMI. Please try again.';

        this.isCalculatingEmi = false;
        this.cdr.markForCheck();
      }
    });
  }

  submitApplication(): void {
    this.errorMessage = '';
    this.successMessage = '';
    this.createdApplication = null;

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.errorMessage = 'Please enter valid application details.';
      return;
    }

    const deal = this.selectedDeal;
    const request = this.form.getRawValue();

    if (!deal) {
      this.errorMessage = 'Please select a valid loan deal.';
      return;
    }

    if (request.requestedAmount > Number(deal.maxLoanAmount)) {
      this.errorMessage =
        'Requested amount exceeds the maximum loan amount.';
      return;
    }

    if (request.tenureMonths > deal.maxTenureMonths) {
      this.errorMessage =
        'Tenure exceeds the maximum allowed for this loan.';
      return;
    }

    if (this.emiPreview === null) {
      this.errorMessage =
        'Please wait for the EMI preview to be calculated.';
      return;
    }

    this.isSubmitting = true;
    this.cdr.markForCheck();

    // CIBIL is deliberately not sent in this request.
    // The backend fetches and saves it automatically.
    this.applicationService.createApplication({
      customerId: request.customerId,
      loanDealId: request.loanDealId,
      requestedAmount: request.requestedAmount,
      tenureMonths: request.tenureMonths,
      bankName: request.bankName.trim(),
      bankAccountNumber: request.bankAccountNumber,
      ifscCode: request.ifscCode.trim().toUpperCase(),
      emiDay: request.emiDay
    }).subscribe({
      next: response => {
        this.createdApplication = response.data;
        this.successMessage = response.message
          || 'Loan application created successfully.';

        this.isSubmitting = false;
        this.cdr.markForCheck();
      },
      error: error => {
        console.error('Application submission failed:', error);

        this.errorMessage =
          error?.error?.message
          || error?.error?.error
          || 'Application failed. Please check your details.';

        this.isSubmitting = false;
        this.cdr.markForCheck();
      }
    });
  }
}
