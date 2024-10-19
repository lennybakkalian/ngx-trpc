import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NgxTrpcComponent } from './ngx-trpc.component';

describe('NgxTrpcComponent', () => {
  let component: NgxTrpcComponent;
  let fixture: ComponentFixture<NgxTrpcComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NgxTrpcComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NgxTrpcComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
