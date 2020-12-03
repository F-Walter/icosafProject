<<<<<<< HEAD
import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-problem-image',
  templateUrl: './problem-image.component.html',
  styleUrls: ['./problem-image.component.css']
})
export class ProblemImageComponent implements OnInit {

  slides: Slide[]

  constructor(private dialogRef: MatDialogRef<ProblemImageComponent>,
    @Inject(MAT_DIALOG_DATA) data) {

    this.slides = []

    if (data.images)
    this.slides = [...data.images]
    
  }

  ngOnInit(): void {
  }

  closeDialog(){
    this.dialogRef.close()
  }
}

export interface Slide {
  image: string
}

=======
import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-problem-image',
  templateUrl: './problem-image.component.html',
  styleUrls: ['./problem-image.component.css']
})
export class ProblemImageComponent implements OnInit {

  slides: Slide[]

  constructor(private dialogRef: MatDialogRef<ProblemImageComponent>,
    @Inject(MAT_DIALOG_DATA) data) {

    this.slides = []

    if (data.images)
    this.slides = [...data.images]
    
  }

  ngOnInit(): void {
  }

  closeDialog(){
    this.dialogRef.close()
  }
}

export interface Slide {
  image: string
}

>>>>>>> 29f32125a9a7f117ffdaa7c7e7e7692d49913c3a
