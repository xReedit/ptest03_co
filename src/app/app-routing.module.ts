import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LayoutMainComponent } from './core/layout-main/layout-main.component';
import { AuthGuard } from './shared/guards/auth.guard';
import { ClienteProfileGuard } from './shared/guards/cliente-profile-guards';
import { LocationStrategy, PathLocationStrategy } from '@angular/common';

const routes: Routes = [
    {
      path: '',
      loadChildren: () => import('./pages/inicio/inicio.module').then(m => m.InicioModule),
      data: { 'tituloModulo': 'Inicio' }
    },
    {
      path: 'comercio',
      loadChildren: () => import('./pages/comercio/comercio.module').then(m => m.ComercioModule),
      canActivate: [AuthGuard],
      data: { 'tituloModulo': 'Comercio' }
    },
    {
      path: 'order-last',
      loadChildren: () => import('./pages/show-last-pedido/show-last-pedido.module').then(m => m.ShowLastPedidoModule),
      data: { 'tituloModulo': 'Order Last' }
    }
];

@NgModule({
  imports: [RouterModule.forRoot(
    routes
    , {
      useHash: true,
      // scrollPositionRestoration: 'enabled',
      // anchorScrolling: 'enabled',
      // paramsInheritanceStrategy: 'always'
    }
    )],
  exports: [RouterModule],
  providers: [
    AuthGuard,
    // 22012022 eliminar el #
    {provide: LocationStrategy, useClass: PathLocationStrategy}
  ]
})
export class AppRoutingModule { }
