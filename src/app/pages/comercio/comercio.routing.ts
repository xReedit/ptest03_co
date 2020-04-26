import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MainComponent } from './main/main.component';
import { OrdenesComponent } from './ordenes/ordenes.component';
import { SeguimientoComponent } from './seguimiento/seguimiento.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { OrdenesEnMapaComponent } from './ordenes-en-mapa/ordenes-en-mapa.component';


const routes: Routes = [{
    path: '', component: MainComponent,
    data: { titulo: 'Inicio' },
    children: [
        {
            path: '', redirectTo: 'ordenes/lista'
        },
        {
            path: 'ordenes/:id',
            component: OrdenesComponent,
            data: { titulo: 'Ordenes' }
        },
        {
            path: 'seguimiento',
            component: SeguimientoComponent,
            data: { titulo: 'Seguimiento' }
        },
        {
            path: 'dashboard',
            component: DashboardComponent,
            data: { titulo: 'Dashboard' }
        }

    ]
}];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class ComercioRoutingModule { }
