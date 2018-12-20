import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';


import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './components/home/home.component';
import { ProductComponent } from './components/product/product.component';
import { ProductDetailComponent } from './components/product/product-detail/product-detail.component';
import { LogLevel } from 'msal';
import { MsalModule } from '@azure/msal-angular';
import { UserDataComponent } from './components/user-data/user-data.component';
import { TodoListComponent } from './components/todo-list/todo-list.component';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { HttpClientInMemoryWebApiModule } from 'angular-in-memory-web-api';
import { InMemoryDataService } from './services/in-memory-data.service';
import { MsalInterceptorTmp } from './temp-msal.interceptor';



export const protectedResourceMap: [string, string[]][] = [
    ['https://localhost:44344/api/values/', ['api://39ea0629-0c83-4056-82a4-65e9d2d5443f/Claims.Any']],
    ['https://graph.microsoft.com/v1.0/me/', ['user.read', 'profile']],
    ['', ['']]
];

export function loggerCallback(logLevel, message, piiEnabled) {
    console.log('client logging' + message);
}

@NgModule({
    declarations: [
        AppComponent,
        HomeComponent,
        ProductComponent,
        ProductDetailComponent,
        UserDataComponent,
        TodoListComponent
    ],
    imports: [
        BrowserModule,
        AppRoutingModule,
        HttpClientModule,
        HttpClientInMemoryWebApiModule.forRoot(InMemoryDataService, {dataEncapsulation: false }),  // must be after HttpClientModule
        MsalModule.forRoot({
            clientID: '36cc0c10-21c7-4b26-a9ef-e5ca99e14426',
            authority: 'https://login.microsoftonline.com/countyofventuraca.onmicrosoft.com/',
            validateAuthority: true,
            redirectUri: 'https://localhost:4300/home',
            cacheLocation: 'sessionStorage',
            postLogoutRedirectUri: 'https://localhost:4300/home/',
            navigateToLoginRequestUrl: true,
            popUp: false,
            consentScopes: ['user.read', 'profile', 'api://39ea0629-0c83-4056-82a4-65e9d2d5443f/Claims.Any'],
            unprotectedResources: ['https://www.microsoft.com/en-us/'],
            protectedResourceMap: protectedResourceMap,
            logger: loggerCallback,
            correlationId: '1234',
            level: LogLevel.Info,
            piiLoggingEnabled: true
        }
        ),
    ],
    providers: [
        {provide: HTTP_INTERCEPTORS, useClass: MsalInterceptorTmp, multi: true}

    ],
    bootstrap: [AppComponent]
})
export class AppModule { }
