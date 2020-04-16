import { TestBed } from '@angular/core/testing';

import { FacturacionElectronicaService } from './facturacion-electronica.service';

describe('FacturacionElectronicaService', () => {
  let service: FacturacionElectronicaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FacturacionElectronicaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
