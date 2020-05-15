import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogAddRepartidorComponent } from './dialog-add-repartidor.component';

describe('DialogAddRepartidorComponent', () => {
  let component: DialogAddRepartidorComponent;
  let fixture: ComponentFixture<DialogAddRepartidorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DialogAddRepartidorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DialogAddRepartidorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
