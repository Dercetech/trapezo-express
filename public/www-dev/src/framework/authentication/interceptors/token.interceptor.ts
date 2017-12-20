import {Inject, Injectable, Injector} from "@angular/core";
import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse } from "@angular/common/http";
import {ActivatedRoute, Router} from "@angular/router";

import {Observable} from "rxjs/Observable";
import "rxjs/add/operator/do";

import {TokenService} from "../services/token-service";

@Injectable()
export class TokenInterceptor implements HttpInterceptor {

  constructor(private router:Router,
              private activatedRoute:ActivatedRoute,
              // @Inject(TokenService) private tokenService:TokenService, // will cause cyclic dependency error
              private injector:Injector) {
  }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    const tokenService = this.injector.get(TokenService);
    const token = tokenService.getToken();

    // Append token to outbound request
    if(token){
      request = request.clone({
        setHeaders: { 'x-access-token' : token }
      });
    }

    return next.handle(request).do(
      (event: HttpEvent<any>) => {
        if (event instanceof HttpResponse) {
          const response:HttpResponse<any> = (<HttpResponse<any>> event);

          // Auto-renewal of token
          const authorizationHeader = response.headers.get('Authorization');
          if(authorizationHeader){
            tokenService.setToken(authorizationHeader);
          }
        }
      },
      (err: any) => {
        if (err instanceof HttpErrorResponse){
          if (err.status === 401) {
            this.router.navigate(['/']);
          }
        }
      });
  }
}
