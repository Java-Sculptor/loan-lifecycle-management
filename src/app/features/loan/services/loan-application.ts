
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface LoanApplicationRequest {
  customerId: number;
  loanDealId: number;
  requestedAmount: number;
  tenureMonths: number;
  bankName: string;
  bankAccountNumber: string;
  ifscCode: string;
  emiDay: number;
}

export interface LoanApplicationResult {
  appliedAt: string;
  customerId: number;
  customerName: string;
  documentVerificationStatus: string;
  interestRate: number;
  loanApplicationId: number;
  loanDealId: number;
  loanType: 'HOME_LOAN' | 'VEHICLE_LOAN';
  requestedAmount: number;
  status: string;
  tenureMonths: number;
  cibilScore?: number;
  bankName?: string | null;
  bankAccountNumber?: string | null;
  ifscCode?: string | null;
  emiDay?: number | null;
  rejectionReason?: string | null;
}

export interface EmiCalculationRequest {
  loanDealId: number;
  requestedAmount: number;
  tenureMonths: number;
}

export interface EmiCalculationResult {
  loanDealId: number;
  principalAmount: number;
  annualInterestRate: number;
  tenureMonths: number;
  monthlyEmi: number;
  totalPayment: number;
  totalInterest: number;
}

export interface CibilCalculationResult {
  customerId: number;
  cibilScore: number;
  status?: string;
  decision?: string;
  eligibility?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  error: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class LoanApplicationService {
  private readonly http = inject(HttpClient);

  private readonly apiUrl =
    `${environment.apiBaseUrl}/loan-applications`;

  private readonly cibilApiUrl =
    `${environment.apiBaseUrl}/cibil`;

  // Customer loan application
  createApplication(
    request: LoanApplicationRequest
  ): Observable<ApiResponse<LoanApplicationResult>> {
    return this.http.post<ApiResponse<LoanApplicationResult>>(
      this.apiUrl,
      request
    );
  }

  // Fetch applications belonging to a customer
  getApplicationsByCustomer(
    customerId: number
  ): Observable<ApiResponse<LoanApplicationResult[]>> {
    return this.http.get<ApiResponse<LoanApplicationResult[]>>(
      `${this.apiUrl}/customer/${customerId}`
    );
  }

  // Calculate CIBIL score automatically
  calculateCibilScore(
    customerId: number
  ): Observable<ApiResponse<CibilCalculationResult>> {
    return this.http.post<ApiResponse<CibilCalculationResult>>(
      `${this.cibilApiUrl}/calculate/${customerId}`,
      null
    );
  }

  // Calculate EMI through the backend
  calculateEmi(
    request: EmiCalculationRequest
  ): Observable<ApiResponse<EmiCalculationResult>> {
    return this.http.post<ApiResponse<EmiCalculationResult>>(
      `${this.apiUrl}/emi-calculation`,
      request
    );
  }

  // Credit Officer: fetch pending applications
  getPendingApplications():
    Observable<ApiResponse<LoanApplicationResult[]>> {
    return this.http.get<ApiResponse<LoanApplicationResult[]>>(
      `${this.apiUrl}/pending`
    );
  }

  // Credit Officer: mark documents as verified
  verifyDocuments(
    applicationId: number
  ): Observable<ApiResponse<LoanApplicationResult>> {
    return this.http.patch<ApiResponse<LoanApplicationResult>>(
      `${this.apiUrl}/${applicationId}/document-verification?status=VERIFIED`,
      null
    );
  }

  // Credit Officer: approve application
  approveApplication(
    applicationId: number
  ): Observable<ApiResponse<LoanApplicationResult>> {
    return this.http.patch<ApiResponse<LoanApplicationResult>>(
      `${this.apiUrl}/${applicationId}/approve`,
      null
    );
  }

  // Credit Officer: reject application with a reason
  rejectApplication(
    applicationId: number,
    rejectionReason: string
  ): Observable<ApiResponse<LoanApplicationResult>> {
    return this.http.patch<ApiResponse<LoanApplicationResult>>(
      `${this.apiUrl}/${applicationId}/reject`,
      { rejectionReason }
    );
  }
}
