import {Inject, Injectable} from "@angular/core";
import {Router} from "@angular/router";
import {HttpClient, HttpResponse} from "@angular/common/http";

import {BehaviorSubject} from "rxjs/BehaviorSubject";
import {Observable} from "rxjs/Observable";
import {Observer} from "rxjs/Observer";
import 'rxjs/add/operator/first';

import {AppConfig} from "../../../app/config/config.interface";
import {APP_CONFIG} from "../../../app/config/config.constants";

import {TokenService} from "./token-service";

@Injectable()
export class AuthService {

  // Observables
  authChanged$: BehaviorSubject<any> = new BehaviorSubject(null);

  private loggedIn = false;
  private currentUser = null;

  constructor(private router: Router,
              private httpClient: HttpClient,
              @Inject(APP_CONFIG) private config: AppConfig,
              @Inject(TokenService) private tokenService:TokenService){

    // Try authenticating using the cached token
    this.authenticateUsingToken(this.tokenService.getToken());
  }

  private authenticateUsingToken(token:string):void{
    if(!token) return;
    this.tokenService.setToken(token);
    try{
      const decodedTokenClaims:any = this.tokenService.getTokenClaims();
      this.currentUser = decodedTokenClaims.user;
      this.loggedIn = true;
      this.router.navigate(['/', 'secure']);
      setTimeout( () => this.authChanged$.next('auth'), 10);
      setTimeout( () => this.router.navigate(['/', 'secure']), 15);
    }
    catch(err){
      console.log(err);
    }
  }

  isAuthenticated(){
    return this.loggedIn;
  }

  getAuthenticatedUser(){
    return this.currentUser;
  }

  login(username:string, password:string):Observable<boolean>{
    this.loggedIn = false;
    return new Observable( (observer:Observer<boolean>) => {

      const body = {user: username, pwd: password};
      const url = this.config.API.AUTHENTICATE;

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
        (err) => (err.status === 401) ? observer.next(false) : observer.error({}),
        () => observer.complete() );
    });
  }

  logout(){
    this.loggedIn = false;
    this.authChanged$.next('signout');
    this.router.navigate(['/']);
  }
}
