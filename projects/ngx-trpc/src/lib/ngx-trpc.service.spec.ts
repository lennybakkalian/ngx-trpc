import { TestBed } from '@angular/core/testing';

import { NgxTrpcService } from './ngx-trpc.service';

describe('NgxTrpcService', () => {
  let service: NgxTrpcService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NgxTrpcService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
