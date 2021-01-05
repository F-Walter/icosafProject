import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import * as CryptoJS from 'crypto-js';
import { environment } from 'src/environments/environment';


@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private http: HttpClient) {
  }

  login(username: string, password: string): Observable<any> {
    
    var encrypted = CryptoJS.AES.encrypt(password, "my-secret");

    console.log(encrypted.toString());

    const URL: string = `http://${environment.serverHost}/Details/verifyPwd`;

    return this.http.post<any>(URL, { login: username, pwd: encrypted.toString() });
  }

  isLogged() {
    if (localStorage.getItem("session"))
      return true
    else
      return false
  }

}
