import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MainComponent } from './main/main.component';
import { UsuariosComponent } from './usuarios/usuarios.component';
import { ParametrosComponent } from './parametros/parametros.component';



@NgModule({
  declarations: [MainComponent, UsuariosComponent, ParametrosComponent],
  imports: [
    CommonModule
  ]
})
export class ComercioConfiguracionModule { }
