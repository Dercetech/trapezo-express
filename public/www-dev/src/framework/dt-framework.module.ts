import {ModuleWithProviders, NgModule} from "@angular/core";
import {HTTP_INTERCEPTORS} from "@angular/common/http";

import {TokenInterceptor} from "./authentication/interceptors/token.interceptor";
import {TokenService} from "./authentication/services/token-service";
import {AuthService} from "./authentication/services/auth-service";
import {AuthGuardService} from "./authentication/services/auth-guard.service";
import {AuthAutoRedirectService} from "./authentication/services/auth-auto-redirect.service";


@NgModule({

})

export class DtFrameworkModule{
  static forRoot():ModuleWithProviders{
    return{
      ngModule:DtFrameworkModule,
      providers:[

        // Token auth interceptor
        {
          provide: HTTP_INTERCEPTORS,
          useClass: TokenInterceptor,
          multi: true
        },

        // Authentication & redirects
        AuthService, TokenService, AuthGuardService, AuthAutoRedirectService,
      ]
    }
  }
}
