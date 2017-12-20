import {Inject, Injectable} from "@angular/core";
import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot} from "@angular/router";
import {Observable} from "rxjs/Observable";
import {AuthService} from "./auth-service";

@Injectable()
export class AuthGuardService implements CanActivate{

  constructor(private router: Router,
              @Inject(AuthService) private authService: AuthService){

  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {

    const roles = route.data["roles"] as Array<string>;

    return this.authService.isAuthenticated()
      .then( (authenticated: boolean) => {


        // Is user authenticated?
        if(authenticated){

          // Is there a role-based restriction?
          if(roles && roles.length > 0){

            const rolesPassed = this.authService.checkRoles(roles);

            if(rolesPassed){
              return true;
            }
            else{

              // Is it a non-activated account?
              if(!this.authService.checkRoles(['activated-user'])){
                this.router.navigate(['/', 'secure', 'must-activate']);
              }
              else{
                console.log('must implement "role missing" but unlikely in this app');
                this.router.navigate(['/']);
              }
            }
          }

          // No, just need authentication
          else return true;
        }
        else{
          console.log('use is not authenticated');
          this.router.navigate(['/']);
        }
    });
  }

}
