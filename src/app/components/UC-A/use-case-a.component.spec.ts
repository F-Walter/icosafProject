<<<<<<< HEAD
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UseCaseAComponent } from './use-case-a.component';

describe('UseCaseAComponent', () => {
  let component: UseCaseAComponent;
  let fixture: ComponentFixture<UseCaseAComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UseCaseAComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UseCaseAComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
=======
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UseCaseAComponent } from './use-case-a.component';

describe('UseCaseAComponent', () => {
  let component: UseCaseAComponent;
  let fixture: ComponentFixture<UseCaseAComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UseCaseAComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UseCaseAComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
>>>>>>> 29f32125a9a7f117ffdaa7c7e7e7692d49913c3a
