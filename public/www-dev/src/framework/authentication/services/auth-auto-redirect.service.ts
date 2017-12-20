import {Inject, Injectable} from "@angular/core";
import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot} from "@angular/router";
import {Observable} from "rxjs/Observable";
import {AuthService} from "./auth-service";

@Injectable()
export class AuthAutoRedirectService implements CanActivate{

  constructor(private router: Router,
              @Inject(AuthService) private authService: AuthService){}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {

    return this.authService.isAuthenticated()
      .then( (authenticated: boolean) => {
        if(authenticated){
          this.router.navigate(['/', 'secure']);
        }
        else{
          return true;
        }
    });
  }

}
