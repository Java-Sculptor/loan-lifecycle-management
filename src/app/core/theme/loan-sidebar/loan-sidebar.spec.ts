import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoanSidebar } from './loan-sidebar';

describe('LoanSidebar', () => {
  let component: LoanSidebar;
  let fixture: ComponentFixture<LoanSidebar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoanSidebar],
    }).compileComponents();

    fixture = TestBed.createComponent(LoanSidebar);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
