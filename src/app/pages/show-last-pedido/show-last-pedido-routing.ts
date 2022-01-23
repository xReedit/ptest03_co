import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MainComponent } from './main/main.component';
import { ShowPedidoComponent } from './show-pedido/show-pedido.component';

const routes: Routes = [{
    path: '', component: MainComponent,
    data: { titulo: 'Pedido' },
    children: [
        // {
        //     path: '', redirectTo: 'show'
        // },
        {
            path: '',
            component: ShowPedidoComponent,
            data: { titulo: 'Pedido' }
        }
    ]
}];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class ShowLastPedidoRounting { }
