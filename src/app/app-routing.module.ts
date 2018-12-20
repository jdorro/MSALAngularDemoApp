import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { MsalGuard } from '@azure/msal-angular';
import { ProductComponent } from './components/product/product.component';
import { ProductDetailComponent } from './components/product/product-detail/product-detail.component';
import { UserDataComponent } from './components/user-data/user-data.component';

const routes: Routes = [
    { path: 'home', component: HomeComponent },
    // { path: 'todoList', component: TodoListComponent, canActivate: [MsalGuard] },
    {
        path: 'product', component: ProductComponent, canActivate: [MsalGuard],
        children: [
            { path: 'detail/:id', component: ProductDetailComponent }
        ]
    },
    { path: 'userProfile', component: UserDataComponent, canActivate: [MsalGuard] },
    { path: '', redirectTo: 'home', pathMatch: 'full' },
    // { path: '**', component: ErrorComponent }
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule { }
