import {ModuleWithProviders, NgModule} from "@angular/core";
import {HTTP_INTERCEPTORS} from "@angular/common/http";

import {TokenInterceptor} from "./authentication/interceptors/token.interceptor";
import {AuthService} from "./authentication/services/auth-service";
import {AuthGuardService} from "./authentication/services/auth-guard.service";
import {AuthAutoRedirectService} from "./authentication/services/auth-auto-redirect.service";

import {AuthAutoByURLTokenService} from "./authentication/services/auth-by-url-token.service";

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
        AuthService, AuthGuardService, AuthAutoByURLTokenService, AuthAutoRedirectService,
      ]
    }
  }
}
