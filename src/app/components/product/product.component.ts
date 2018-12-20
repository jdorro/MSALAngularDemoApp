import { Component, OnInit } from '@angular/core';
import { Product } from './product';
import { ProductService } from 'src/app/services/product.service';
import { BroadcastService } from '@azure/msal-angular';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-product',
    templateUrl: './product.component.html',
    styleUrls: ['./product.component.sass']
})
export class ProductComponent implements OnInit {

    products: Product[];
    private subscription: Subscription;

    constructor(
        private productService: ProductService,
        private broadcastService: BroadcastService,
        private router: Router) {
    }

    ngOnInit() {
        this.productService.getProducts().subscribe(products => this.products = products);

        this.subscription = this.broadcastService.subscribe("msal:acquireTokenSuccess", (payload) => { });

        this.subscription = this.broadcastService.subscribe("msal:acquireTokenFailure", (payload) => { });
    }

    onclick(productID: number) {
        this.productService.selectedProdcut = this.products.find(p => p.productID == productID);
        this.router.navigate(['product/detail/', productID]);
    }

    ngOnDestroy() {
        this.broadcastService.getMSALSubject().next(1);
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }
}
