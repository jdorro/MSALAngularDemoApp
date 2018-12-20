import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Product } from '../components/product/product'
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class ProductService {

    selectedProdcut: Product;

    constructor(private http: HttpClient) { }

    public getProducts(): Observable<Product[]> {
        return this.http.get<Product[]>('api/products');
    }
}
