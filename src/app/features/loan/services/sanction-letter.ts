
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';

export interface SanctionLetterResult {
    loanApplicationId: number;
    sanctionLetterNumber: string;
    downloadUrl: string;
    notificationCreated: boolean;
    emailSent: boolean;
    message: string;
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
export class SanctionLetterService {
    private readonly http = inject(HttpClient);

    private readonly apiUrl =
        `${environment.apiBaseUrl}/loan-processing`;

    generateSanctionLetter(
        applicationId: number
    ): Observable<ApiResponse<SanctionLetterResult>> {
        return this.http.post<ApiResponse<SanctionLetterResult>>(
            `${this.apiUrl}/sanction-letter/${applicationId}`,
            null
        );
    }

    downloadSanctionLetter(applicationId: number): Observable<Blob> {
        return this.http.get(
            `${this.apiUrl}/sanction-letter/${applicationId}/download`,
            { responseType: 'blob' }
        );
    }
}
