import { TestBed } from '@angular/core/testing';
import { LoanEligibility } from './loan-eligibility';

describe('LoanEligibility', () => {
  let service: LoanEligibility;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LoanEligibility);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
