import { TestBed } from '@angular/core/testing';
import { SanctionLetter } from './sanction-letter';

describe('SanctionLetter', () => {
  let service: SanctionLetter;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SanctionLetter);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
