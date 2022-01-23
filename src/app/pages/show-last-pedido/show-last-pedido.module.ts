import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ShowLastPedidoRounting } from './show-last-pedido-routing';
import { MainComponent } from './main/main.component';
import { ShowPedidoComponent } from './show-pedido/show-pedido.component';
import { MaterialModule } from 'src/app/core/material/material.module';



@NgModule({
  declarations: [MainComponent, ShowPedidoComponent],
  imports: [
    CommonModule,
    ShowLastPedidoRounting
  ]
})
export class ShowLastPedidoModule { }
