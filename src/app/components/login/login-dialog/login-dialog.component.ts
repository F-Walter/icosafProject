/**
 * Login
 */
import { Component, OnInit, Input } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { FormGroup, FormControl } from '@angular/forms';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-login-dialog',
  templateUrl: './login-dialog.component.html',
  styleUrls: ['./login-dialog.component.css']
})
export class LoginDialogComponent implements OnInit {


  loginForm: FormGroup
  public dialogRef: MatDialogRef<LoginDialogComponent>
  hide = true;

  constructor(private authService: AuthService) {
    this.loginForm = new FormGroup({
      email: new FormControl(''),
      password: new FormControl(''),
    });
  }



  ngOnInit(): void {
  }


  onNoClick(): void {
    this.dialogRef.close();
  }




  submit() {
    if (this.loginForm.valid) {
      this.save();
    }
  }
  @Input() error: string | null;

  save() {
    this.authService.login(this.loginForm.value.email, this.loginForm.value.password).subscribe(response => {

      console.log(response);

      // if (response) {
      //   var sess = {};
      //   sess["email"] = this.loginForm.value.email;
      //   localStorage.setItem("session", JSON.stringify(sess));
      // }
      // this.dialogRef.close();

    }, error => {
      this.error = error.error;
    })


  }

  close() {
    this.dialogRef.close();

  }


}

/*@Component({
  selector: 'dialog-overview-example-dialog',
  templateUrl: 'dialog-overview-example-dialog.html',
})
export class DialogOverviewExampleDialog {

  constructor(
    public dialogRef: MatDialogRef<DialogOverviewExampleDialog>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData) {}

  onNoClick(): void {
    this.dialogRef.close();
  }

}
*/