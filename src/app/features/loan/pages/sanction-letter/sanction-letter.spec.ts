import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SanctionLetter } from './sanction-letter';

describe('SanctionLetter', () => {
  let component: SanctionLetter;
  let fixture: ComponentFixture<SanctionLetter>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SanctionLetter],
    }).compileComponents();

    fixture = TestBed.createComponent(SanctionLetter);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
