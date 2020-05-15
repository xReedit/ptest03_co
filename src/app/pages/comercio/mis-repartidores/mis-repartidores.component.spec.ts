import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MisRepartidoresComponent } from './mis-repartidores.component';

describe('MisRepartidoresComponent', () => {
  let component: MisRepartidoresComponent;
  let fixture: ComponentFixture<MisRepartidoresComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MisRepartidoresComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MisRepartidoresComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
