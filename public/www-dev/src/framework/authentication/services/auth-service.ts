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
export class AuthService {

  // Observables
  authChanged$: BehaviorSubject<any> = new BehaviorSubject(null);

  private loggedIn = false;
  private currentUser = null;
  private token = null;

  private _ready$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  readonly ready$: Observable<boolean> = this._ready$.asObservable();

  constructor(private router: Router,
              private httpClient: HttpClient,
              @Inject(APP_CONFIG) private config: AppConfig){

    if(this.restoreToken()){
      this.loggedIn = true;
      const claims = this.decodeToken(this.token);
      this.currentUser = claims.user;
      this.authChanged$.next('auth');
    }

    this._ready$.next(true);
  }

  //////////////////////////////////////////////////////////
  // Token-related logic - prod: move to separate service //

  private unsetToken(){
    this.token = false;
    localStorage.removeItem('token');
  }

  private storeToken(token:string){
    localStorage.setItem('token', token);
  }

  private restoreToken():boolean{
    const token = localStorage.getItem('token');
    if(this.validateToken(token)){
      this.token = token;
      return true;
    }
    else return false;
  }

  private validateToken(token:string):boolean{
    return token !== null;
  }

  decodeToken(token){
    if(!token) return null;
    const b64Claims = token.split('.')[1];
    if(b64Claims){
      let tokenClaims = atob(b64Claims);
      return JSON.parse(tokenClaims);
    }
    else return {};
  }

  getRoles(token){
    if(!token) return [];
    var tokenClaims = this.decodeToken(token);
    return tokenClaims ? tokenClaims.roles : [];
  }

  isValidated(){
    return this.checkRoles(['activated-user']);
  }

  checkRoles(roles, token = this.getToken()){

    if(!token) token = this.restoreToken();
    if(!token) return false;

    const tokenRoles = this.getRoles(token);

    // Encapsulate string role in an array
    if(Object.prototype.toString.call(roles) !== '[object Array]') {
      roles = [roles];
    }

    // Check every requested role is provided
    return roles.every(function(role){
      return tokenRoles.indexOf(role) !== -1;
    });
  }

  getToken(){
    return this.token;
  }

  // Token-related logic - prod: move to separate service //
  /////////////////////////////////////////////////////////

  authenticateUsingToken(token:string){
    this.setToken(token);
    try{
      const decodedTokenClaims:any = JSON.parse(atob(token.split('.')[1]));
      this.currentUser = decodedTokenClaims.user;
      this.loggedIn = true;
      this.router.navigate(['/', 'secure']);
      setTimeout( () => this.authChanged$.next('auth'), 1000);
      setTimeout( () => this.router.navigate(['/', 'secure']), 1500);

    }
    catch(err){
      console.log(err);
    }
  }

  setToken(token:string){
    this.token = token;
    this.storeToken(token);
  }

  login(username:string, password:string):Observable<boolean>{
    this.loggedIn = false;
    return new Observable( (observer:Observer<boolean>) => {
      
      const body = {user: username, pwd: password};
      const url = this.config.API_ENDPOINT_AUTH;

      this.httpClient.post(url, body, {
        responseType: 'text',
        observe: "response"
      }).first().subscribe(
        (response:HttpResponse<string>) => {

          // Let the token interceptor set the token for you as auto-renewal will be done seamlessly by the server
          // this.token = response.headers.get('Authorization');
          // this.storeToken(this.token);

          this.currentUser = username;
          this.loggedIn = true;
          this.authChanged$.next('auth');
          observer.next(true);
        },
        (err) => observer.next(false),
        () => {},
      );
    });
  }

  logout(){
    this.loggedIn = false;
    this.unsetToken();
    this.authChanged$.next('signout');
    this.router.navigate(['/']);
  }

  isAuthenticated(){
    const promise = new Promise( (resolve, reject) => {
      setTimeout(() => resolve(this.loggedIn), 1);
    });

    return promise;
  }

  getAuthenticatedUser(){
    return this.currentUser;
  }
}
