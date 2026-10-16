import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoanEligibility } from './loan-eligibility';

describe('LoanEligibility', () => {
  let component: LoanEligibility;
  let fixture: ComponentFixture<LoanEligibility>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoanEligibility],
    }).compileComponents();

    fixture = TestBed.createComponent(LoanEligibility);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
