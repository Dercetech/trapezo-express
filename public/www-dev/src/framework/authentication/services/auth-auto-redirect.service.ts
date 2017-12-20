import {Inject, Injectable} from "@angular/core";
import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot} from "@angular/router";
import {Observable} from "rxjs/Observable";
import {AuthService} from "./auth-service";

@Injectable()
export class AuthAutoRedirectService implements CanActivate{

  constructor(private router: Router,
              @Inject(AuthService) private authService: AuthService){}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
      if (this.authService.isAuthenticated()) {
        this.router.navigate(['/', 'secure']);
        return false;
      }
      else return true;
  }
}
