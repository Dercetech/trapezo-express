import {Inject, Injectable} from "@angular/core";
import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot} from "@angular/router";
import {Observable} from "rxjs/Observable";
import {AuthService} from "./auth-service";
import {TokenService} from "./token-service";

@Injectable()
export class AuthGuardService implements CanActivate{

  constructor(private router: Router,
              @Inject(AuthService) private authService: AuthService,
              @Inject(TokenService) private tokenService: TokenService){

  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {

    const roles = route.data["roles"] as Array<string>;

    if(this.authService.isAuthenticated()){

      // Is there a role-based restriction?
      if(roles && roles.length > 0){

        const rolesPassed = this.tokenService.checkRoles(roles);

        if(rolesPassed){
          return true;
        }
        else{
          console.warn('User is missing grants for this route. Disable UI items according to his grants.');
          return false;
        }
      }

      // No role requested, just need authentication.
      else return true;
    }

    else{
      this.router.navigate(['/']);
    }
  }
}
