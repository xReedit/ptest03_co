import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ShowPedidoComponent } from './show-pedido.component';

describe('ShowPedidoComponent', () => {
  let component: ShowPedidoComponent;
  let fixture: ComponentFixture<ShowPedidoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ShowPedidoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ShowPedidoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
