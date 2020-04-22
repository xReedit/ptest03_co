import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OrdenesEnMapaComponent } from './ordenes-en-mapa.component';

describe('OrdenesEnMapaComponent', () => {
  let component: OrdenesEnMapaComponent;
  let fixture: ComponentFixture<OrdenesEnMapaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OrdenesEnMapaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OrdenesEnMapaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
