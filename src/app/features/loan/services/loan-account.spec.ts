import { TestBed } from '@angular/core/testing';
import { LoanAccount } from './loan-account';

describe('LoanAccount', () => {
  let service: LoanAccount;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LoanAccount);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
