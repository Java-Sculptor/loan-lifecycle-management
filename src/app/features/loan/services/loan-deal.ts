import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface LoanDeal {
  loanDealId: number;
  loanType: 'HOME_LOAN' | 'VEHICLE_LOAN';
  interestRate: number;
  maxTenureMonths: number;
  maxLoanAmount: number;
  active: boolean;
  createdAt: string;
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
export class LoanDealService {
  private readonly http = inject(HttpClient);

  private readonly apiUrl =
    `${environment.apiBaseUrl}/loan-deals`;

  getActiveLoanDeals(): Observable<LoanDeal[]> {
    return this.http
      .get<ApiResponse<LoanDeal[]>>(`${this.apiUrl}/active`)
      .pipe(
        map(response => response.data)
      );
  }
}