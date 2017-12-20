import { Component, Inject, OnInit } from '@angular/core';
import {FormBuilder, Validators} from "@angular/forms";

import {AuthService} from "../../../framework/authentication/services/auth-service";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  loading:boolean = false;
  error:string = null;

  loginForm = this._formBuilder.group({
    username: ["groot", Validators.required],
    password: ["groot", Validators.required],
    //agreeWithTerms: ["", Validators.required]
  });

  constructor(private _formBuilder: FormBuilder,
              @Inject(AuthService) private authService:AuthService) { }

  ngOnInit() {
  }

  onRegisterUser(){

  }

  onPasswordLost(){

  }

  onAuthenticate(){
    this.loading = true;
    this.error = null;
    this.authService.login(this.loginForm.value.username, this.loginForm.value.password).first().subscribe( (result:boolean) => {
      this.loading = false;
      if(!result){
        this.error = 'wrong credentials';
      }
    },
      (err) => {
        this.loading = false;
        this.error = 'error during authentication';
      });
  }
}
