import { TestBed } from '@angular/core/testing';
import { Scorecard } from './scorecard';

describe('Scorecard', () => {
  let service: Scorecard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Scorecard);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
