import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
    providedIn: 'root'
})
export class UserDataService {

    constructor(private http: HttpClient) { }

    getUserGraph(): Observable<any> {
        return this.http.get<any>('https://graph.microsoft.com/v1.0/me');
    }
}
