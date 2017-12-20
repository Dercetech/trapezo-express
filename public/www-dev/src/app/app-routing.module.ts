import {RouterModule, Routes} from "@angular/router";
import {NgModule} from "@angular/core";

import {LoginComponent} from "../pages/public/login/login.component";
import {AuthAutoRedirectService} from "../framework/authentication/services/auth-auto-redirect.service";

const appRoutes: Routes = [

  // Default page: display login component unless an authentication token is present in local storage
  { path: '', component: LoginComponent,
    data: { },
    canActivate: [AuthAutoRedirectService]
  }

];

@NgModule({
  imports: [
    RouterModule.forRoot(appRoutes, {useHash: false})
  ],
  exports: [
    RouterModule    // configured router module
  ]
})

export class AppRoutingModule {

}
