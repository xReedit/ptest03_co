import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RegistroComercioComponent } from './registro-comercio.component';

describe('RegistroComercioComponent', () => {
  let component: RegistroComercioComponent;
  let fixture: ComponentFixture<RegistroComercioComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RegistroComercioComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RegistroComercioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
