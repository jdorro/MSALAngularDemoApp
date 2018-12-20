import { InMemoryDbService } from 'angular-in-memory-web-api';
import { Injectable } from '@angular/core';
import { Product } from '../components/product/product';

@Injectable({
    providedIn: 'root',
})
export class InMemoryDataService implements InMemoryDbService {
    createDb() {
        const products = [
            new Product(7, 'Memory Card', 500),
            new Product(8, 'Pen Drive', 750),
            new Product(9, 'Power Bank', 100)
        ];
        return { products };
    }


    // Overrides the genId method to ensure that a hero always has an id.
    // If the heroes array is empty,
    // the method below returns the initial number (11).
    // if the heroes array is not empty, the method below returns the highest
    // hero id + 1.
    genId(products: Product[]): number {
        return products.length > 0 ? Math.max(...products.map(product => product.productID)) + 1 : 11;
    }
}
