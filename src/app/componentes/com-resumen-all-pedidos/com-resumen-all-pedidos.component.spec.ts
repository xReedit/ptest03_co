import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ComResumenAllPedidosComponent } from './com-resumen-all-pedidos.component';

describe('ComResumenAllPedidosComponent', () => {
  let component: ComResumenAllPedidosComponent;
  let fixture: ComponentFixture<ComResumenAllPedidosComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ComResumenAllPedidosComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ComResumenAllPedidosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
