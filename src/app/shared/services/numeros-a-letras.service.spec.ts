import { TestBed } from '@angular/core/testing';

import { NumerosALetrasService } from './numeros-a-letras.service';

describe('NumerosALetrasService', () => {
  let service: NumerosALetrasService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NumerosALetrasService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
