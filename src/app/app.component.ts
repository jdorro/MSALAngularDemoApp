import { Component } from '@angular/core';
import { BroadcastService, MsalService } from '@azure/msal-angular';
import { Subscription } from 'rxjs';
import { User } from 'msal';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.sass']
})
export class AppComponent {

    title = 'Msal Angular Demo';
    loggedIn: boolean;
    user: User;
    roles: string[];
    isIframe: boolean;
    private subscription: Subscription;

    constructor(
        private broadcastService: BroadcastService,
        private msalService: MsalService) {

        //  This is to avoid reload during acquireTokenSilent() because of hidden iframe
        this.isIframe = window !== window.parent && !window.opener;

        if (this.msalService.getUser()) {
            this.loggedIn = true;
        }
        else {
            this.loggedIn = false;
        }
    }

    login() {
        this.msalService.loginRedirect(["user.read", "profile", "api://39ea0629-0c83-4056-82a4-65e9d2d5443f/Claims.Any"]);
    }

    logout() {
        this.msalService.logout();
    }

    ngOnInit() {

        this.broadcastService.subscribe("msal:loginFailure", (payload) => {
            console.log("login failure " + JSON.stringify(payload));
            this.loggedIn = false;

        });

        this.broadcastService.subscribe("msal:loginSuccess", (payload) => {
            console.log("login success " + JSON.stringify(payload));
            this.user = this.msalService.getUser();

            if (this.msalService.getUser().idToken.hasOwnProperty('roles')) {
                this.roles = this.msalService.getUser().idToken['roles'];
                console.log('Token Claims: ' + this.roles);
            }

            this.loggedIn = true;
        });
    }

    ngOnDestroy() {
        this.broadcastService.getMSALSubject().next(1);
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }
}
