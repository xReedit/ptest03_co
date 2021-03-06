import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MainComponent } from './main/main.component';
import { ComercioRoutingModule } from './comercio.routing';
import { CoreModule } from 'src/app/core/core.module';
import { ComponentesModule } from 'src/app/componentes/componentes.module';
import { MaterialModule } from 'src/app/core/material/material.module';

import { RecepcionComponent } from './recepcion/recepcion.component';
import { SeguimientoComponent } from './seguimiento/seguimiento.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { OrdenesComponent } from './ordenes/ordenes.component';

import { NgxMasonryModule } from 'ngx-masonry';
import { OrdenesEnMapaComponent } from './ordenes-en-mapa/ordenes-en-mapa.component';
import { CuadreCajaComponent } from './cuadre-caja/cuadre-caja.component';
import { MisRepartidoresComponent } from './mis-repartidores/mis-repartidores.component';

@NgModule({
  declarations: [
    MainComponent, RecepcionComponent, SeguimientoComponent, DashboardComponent, OrdenesComponent, OrdenesEnMapaComponent, CuadreCajaComponent, MisRepartidoresComponent],
  imports: [
    CommonModule,
    ComercioRoutingModule,
    CoreModule,
    ComponentesModule,
    MaterialModule,
    NgxMasonryModule
  ]
})
export class ComercioModule { }
