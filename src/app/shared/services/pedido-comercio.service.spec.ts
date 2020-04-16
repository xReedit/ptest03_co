import { TestBed } from '@angular/core/testing';

import { PedidoComercioService } from './pedido-comercio.service';

describe('PedidoComercioService', () => {
  let service: PedidoComercioService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PedidoComercioService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
