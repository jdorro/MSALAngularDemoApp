import { Component, Input, OnInit } from '@angular/core';
import { Product } from '../product';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService } from 'src/app/services/product.service';

@Component({
    selector: 'app-product-detail',
    templateUrl: './product-detail.component.html',
    styleUrls: ['./product-detail.component.sass']
})
export class ProductDetailComponent implements OnInit {

    product: Product;
    id = 0;
    paramsSubscription;

    constructor(
        private activatedRoute: ActivatedRoute,
        private router: Router,
        private productService: ProductService) {
    }

    onBack(): void {
        this.router.navigate(['product']);
    }

    ngOnInit() {
        this.paramsSubscription = this.activatedRoute.params.subscribe(params => {
            this.id = params['id'];
        });
        this.product = this.productService.selectedProdcut;
    }

    // ngOnChanges() {
    //     this.product = this.productService.selectedProdcut;
    // }

    ngDoCheck() {
        this.product = this.productService.selectedProdcut;
    }

    ngOnDestroy() {
        this.paramsSubscription.unsubscribe();
    }
}
