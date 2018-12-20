import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BroadcastService, MsalService } from '@azure/msal-angular';
import { from } from 'rxjs';
import { Observable } from 'rxjs/Observable';

// TODO: Remove when MSAL library supports Angular 6, and use MsalInterceptor instead

@Injectable()
export class MsalInterceptorTmp implements HttpInterceptor {

    constructor(private auth: MsalService, private broadcastService: BroadcastService) { }

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        const scopes = this.auth.getScopesForEndpoint(req.url);
        this.auth.verbose('Url: ' + req.url + ' maps to scopes: ' + scopes);
        if (scopes === null) {
            return next.handle(req);
        }
        const tokenStored = this.auth.getCachedTokenInternal(scopes);
        if (tokenStored && tokenStored.token) {
            req = req.clone({
                setHeaders: {
                    Authorization: `Bearer ${tokenStored.token}`,
                }
            });
            return next.handle(req).do( _ => { }, err => {
                if (err instanceof HttpErrorResponse && err.status === 401) {
                    const scopesl = this.auth.getScopesForEndpoint(req.url);
                    const tokenStoredl = this.auth.getCachedTokenInternal(scopesl);
                    if (tokenStoredl && tokenStoredl.token) {
                        this.auth.clearCacheForScope(tokenStoredl.token);
                    }
                    this.broadcastService.broadcast('msal:notAuthorized', { err, scopesl });
                }
            });
        } else {
            return from(this.auth.acquireTokenSilent(scopes).then(token => {
                const JWT = `Bearer ${token}`;
                return req.clone({
                    setHeaders: {
                        Authorization: JWT,
                    },
                });
            })).mergeMap(reql => next.handle(reql).do( _ => { }, err => {
                if (err instanceof HttpErrorResponse && err.status === 401) {
                    const scopesl = this.auth.getScopesForEndpoint(reql.url);
                    const tokenStoredl = this.auth.getCachedTokenInternal(scopesl);
                    if (tokenStoredl && tokenStoredl.token) {
                        this.auth.clearCacheForScope(tokenStoredl.token);
                    }
                    this.broadcastService.broadcast('msal:notAuthorized', { err, scopesl });
                }
            })); // calling next.handle means we are passing control to next interceptor in chain
        }
    }
}
