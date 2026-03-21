import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { DestinationsComponent } from './destinations';

describe('DestinationsComponent', () => {
  let component: DestinationsComponent;
  let fixture: ComponentFixture<DestinationsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DestinationsComponent],
      providers: [provideRouter([])]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DestinationsComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
