import { Component, Inject, OnInit } from '@angular/core';
import {FormBuilder, Validators} from "@angular/forms";

import {AuthService} from "../../../framework/authentication/services/auth-service";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  loginForm = this._formBuilder.group({
    email: ["", Validators.required],
    password: ["", Validators.required],
    //agreeWithTerms: ["", Validators.required]
  });

  constructor(private _formBuilder: FormBuilder,
              @Inject(AuthService) private authService:AuthService) { }

  ngOnInit() {
  }

}
