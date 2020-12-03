<<<<<<< HEAD
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProblemModalComponent } from './problem-modal.component';

describe('ProblemModalComponent', () => {
  let component: ProblemModalComponent;
  let fixture: ComponentFixture<ProblemModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProblemModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProblemModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
=======
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProblemModalComponent } from './problem-modal.component';

describe('ProblemModalComponent', () => {
  let component: ProblemModalComponent;
  let fixture: ComponentFixture<ProblemModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProblemModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProblemModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
>>>>>>> 29f32125a9a7f117ffdaa7c7e7e7692d49913c3a
