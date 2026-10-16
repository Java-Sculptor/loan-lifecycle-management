
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface LoanEligibilityResult {
    eligibilityId: number;
    cibilScore: number;
    cibilStatus: string;
    eligibleAmount: number;
    eligible: boolean;
    remarks: string;
    evaluatedAt: string;

    loanApplicationId: number;
    requestedAmount: number;
    tenureMonths: number;

    applicationStatus: string;
    documentVerificationStatus: string;

    customerId: number;
    customerName: string;
    customerEmail: string;

    loanType: string;
    interestRate: number;
}

interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
    error: string | null;
}

@Injectable({
    providedIn: 'root'
})
export class LoanEligibilityService {
    private readonly http = inject(HttpClient);

    private readonly apiUrl =
        `${environment.apiBaseUrl}/loan-eligibility`;

    checkEligibility(
        applicationId: number
    ): Observable<ApiResponse<LoanEligibilityResult>> {
        return this.http.post<ApiResponse<LoanEligibilityResult>>(
            `${this.apiUrl}/${applicationId}`,
            null
        );
    }

    getEligibility(
        applicationId: number
    ): Observable<ApiResponse<LoanEligibilityResult>> {
        return this.http.get<ApiResponse<LoanEligibilityResult>>(
            `${this.apiUrl}/${applicationId}`
        );
    }
}
