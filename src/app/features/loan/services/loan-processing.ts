
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface LoanProcessingResult {
    processingId?: number;
    loanAccountNumber?: string | null;
    loanAccountStatus?: string | null;
    disbursementStatus?: string | null;
    disbursementReference?: string | null;
    disbursedAmount?: number | null;
    disbursedAt?: string | null;
    monthlyEmi?: number | null;
    outstandingAmount?: number | null;
    sanctionStatus?: string | null;
    sanctionLetterNumber?: string | null;
    sanctionEmailSent?: boolean | null;
}

export interface LoanProcessingApiResponse {
    success: boolean;
    message: string;
    data: LoanProcessingResult;
    error: string | null;
}

@Injectable({
    providedIn: 'root'
})
export class LoanProcessingService {
    private readonly http = inject(HttpClient);

    private readonly apiUrl =
        `${environment.apiBaseUrl}/loan-processing`;

    disburseLoan(
        applicationId: number
    ): Observable<LoanProcessingApiResponse> {
        return this.http.post<LoanProcessingApiResponse>(
            `${this.apiUrl}/disbursement/${applicationId}`,
            null
        );
    }

    getProcessingDetails(
        applicationId: number
    ): Observable<LoanProcessingApiResponse> {
        return this.http.get<LoanProcessingApiResponse>(
            `${this.apiUrl}/details/${applicationId}`
        );
    }
}
