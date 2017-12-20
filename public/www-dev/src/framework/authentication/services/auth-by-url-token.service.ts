import {Inject, Injectable} from "@angular/core";
import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot} from "@angular/router";
import {Observable} from "rxjs/Observable";
import {AuthService} from "./auth-service";

@Injectable()
export class AuthAutoByURLTokenService implements CanActivate{

  constructor(private router: Router,
              @Inject(AuthService) private authService: AuthService){

  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {

    console.log('was token provided?');

    // Is token provided?
    if(1){
      return true;
    }
    else{
      return false;
    }
  }

}
