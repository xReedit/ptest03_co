import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ComRegistrarPagoComponent } from './com-registrar-pago.component';

describe('ComRegistrarPagoComponent', () => {
  let component: ComRegistrarPagoComponent;
  let fixture: ComponentFixture<ComRegistrarPagoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ComRegistrarPagoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ComRegistrarPagoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
