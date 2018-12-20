import { Component, OnInit } from '@angular/core';
import { BroadcastService, MsalService } from '@azure/msal-angular';
import { UserDataService } from 'src/app/services/user-data.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-user-data',
    templateUrl: './user-data.component.html',
    styleUrls: ['./user-data.component.sass']
})
export class UserDataComponent implements OnInit {

    userGraph: any;
    subscription: Subscription;

    constructor(
        private userDataService: UserDataService,
        private msalService: MsalService,
        private broadcastService: BroadcastService) {

    }

    ngOnInit() {
        this.userDataService.getUserGraph().subscribe(userGraph =>
            this.userGraph = userGraph);

        this.subscription = this.broadcastService.subscribe("msal:acquireTokenSuccess", (payload) => {
            console.log("acquire user-data token success1 " + JSON.stringify(payload));
        });

        this.subscription = this.broadcastService.subscribe("msal:acquireTokenFailure", (payload) => {
            console.log("acquire user-data token failure " + JSON.stringify(payload))
            if (payload.indexOf("consent_required") !== -1 || payload.indexOf("interaction_required") != -1) {
                this.msalService.acquireTokenPopup(['user.read', 'profile']).then((token) => {
                    this.userDataService.getUserGraph().subscribe(userGraph => this.userGraph = userGraph);
                    console.log('acquire user-data token success2 ');
                }, (error) => {
                    console.log("Didnt get token from popup.")
                });
            }
        });
    }

    ngOnDestroy() {
        this.broadcastService.getMSALSubject().next(1);
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }

}
