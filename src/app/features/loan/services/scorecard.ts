
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface ScorecardResult {
    scorecardId: number;
    cibilScore: number;
    employmentType: string;
    loanType: string;
    requestedAmount: number;
    eligibleAmount: number;
    status: string;
    remarks: string | null;
    generatedAt: string;
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
export class ScorecardService {
    private readonly http = inject(HttpClient);

    private readonly apiUrl = `${environment.apiBaseUrl}/scorecards`;

    generateScorecard(
        applicationId: number
    ): Observable<ApiResponse<ScorecardResult>> {
        return this.http.post<ApiResponse<ScorecardResult>>(
            `${this.apiUrl}/${applicationId}`,
            null
        );
    }

    getScorecard(
        applicationId: number
    ): Observable<ApiResponse<ScorecardResult>> {
        return this.http.get<ApiResponse<ScorecardResult>>(
            `${this.apiUrl}/${applicationId}`
        );
    }
}
