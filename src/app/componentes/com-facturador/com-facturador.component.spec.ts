import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ComFacturadorComponent } from './com-facturador.component';

describe('ComFacturadorComponent', () => {
  let component: ComFacturadorComponent;
  let fixture: ComponentFixture<ComFacturadorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ComFacturadorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ComFacturadorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
