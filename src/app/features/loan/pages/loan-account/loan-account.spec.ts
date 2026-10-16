import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoanAccount } from './loan-account';

describe('LoanAccount', () => {
  let component: LoanAccount;
  let fixture: ComponentFixture<LoanAccount>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoanAccount],
    }).compileComponents();

    fixture = TestBed.createComponent(LoanAccount);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
