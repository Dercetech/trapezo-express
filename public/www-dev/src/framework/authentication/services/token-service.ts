import {Inject, Injectable} from "@angular/core";
import {Router} from "@angular/router";
import {HttpClient, HttpResponse} from "@angular/common/http";

import {BehaviorSubject} from "rxjs/BehaviorSubject";
import {Observable} from "rxjs/Observable";
import {Observer} from "rxjs/Observer";
import 'rxjs/add/operator/first';

import {AppConfig} from "../../../app/config/config.interface";
import {APP_CONFIG} from "../../../app/config/config.constants";

@Injectable()
export class TokenService {

  constructor() {
  }

  getToken():string{
    return localStorage.getItem('token');
  }

  setToken(token:string):void{
    localStorage.setItem('token', token);
  }

  unsetToken():void{
    localStorage.removeItem('token');
  }

  getTokenClaims(token:string = this.getToken()) {
    if(!token) return null;
    try{
      const b64Claims = token.split('.')[1];
      if(b64Claims){
        let tokenClaims = atob(b64Claims);
        return JSON.parse(tokenClaims);
      }
      else return {};
    }
    catch(err){
      return {};
    }
  }

  getRoles(token:string = this.getToken()){
    if(!token) return [];
    var tokenClaims = this.getTokenClaims(token);
    return tokenClaims ? tokenClaims.roles : [];
  }

  checkRoles(roles, token = this.getToken()){

    if(!token) return false;

    const tokenRoles = this.getRoles(token);

    // Encapsulate string role in an array
    if(Object.prototype.toString.call(roles) !== '[object Array]') {
      roles = [roles];
    }

    // Check every requested role is provided
    return roles.every( (role:string) => (tokenRoles.indexOf(role) !== -1) );
  }
}
