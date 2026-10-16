
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';

export interface LoanAccountDetails {
    processingId: number;
    loanApplicationId?: number;

    loanAccountNumber: string;
    loanAccountStatus: string;
    loanAccountCreatedAt?: string;

    sanctionedAmount: number;
    disbursedAmount: number;
    outstandingAmount: number;
    monthlyEmi: number;
    interestRate: number;
    tenureMonths: number;

    sanctionStatus: string;
    sanctionLetterNumber: string;
    sanctionLetterPath?: string;
    sanctionedAt?: string;

    disbursementStatus: string;
    disbursementReference: string;
    disbursedAt: string;

    sanctionEmailSent: boolean;
    sanctionEmailSentAt?: string | null;

    scorecardStatus?: string;
    processedAt?: string;
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
export class LoanAccountService {
    private readonly http = inject(HttpClient);

    private readonly apiUrl =
        `${environment.apiBaseUrl}/loan-processing`;

    getLoanAccountDetails(
        applicationId: number
    ): Observable<ApiResponse<LoanAccountDetails>> {
        return this.http.get<ApiResponse<LoanAccountDetails>>(
            `${this.apiUrl}/details/${applicationId}`
        );
    }
}
