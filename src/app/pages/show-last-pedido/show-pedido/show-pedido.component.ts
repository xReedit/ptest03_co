import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { DialogOrdenDetalleComponent } from 'src/app/componentes/dialog-orden-detalle/dialog-orden-detalle.component';
import { CrudHttpService } from 'src/app/shared/services/crud-http.service';
import { PedidoComercioService } from 'src/app/shared/services/pedido-comercio.service';
import { UtilitariosService } from 'src/app/shared/services/utilitarios.service';

@Component({
  selector: 'app-show-pedido',
  templateUrl: './show-pedido.component.html',
  styleUrls: ['./show-pedido.component.css']
})
export class ShowPedidoComponent implements OnInit {


  timepoMax = 10;
  timepoMedio = this.timepoMax / 2;
  labelMsj = 'Cargando Datos...';
  isPedidoExpirado = false;
  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private dialog: MatDialog,
    private crudService: CrudHttpService,
    private pedidoComercioService: PedidoComercioService,
    private utilService: UtilitariosService,
  ) { }

  ngOnInit(): void {
    this.activatedRoute.queryParams.subscribe((params: Params) => {
      const _dataGetUrl = JSON.parse(atob(params.p.toString()));
      _dataGetUrl.s = _dataGetUrl.s.split('.')[1]; // org.sede

      // hora expira
      const _hExpira = this.utilService.xTiempoTranscurrido_min(_dataGetUrl.h);
      console.log('¿_hExpira', _hExpira);
      if ( _hExpira > 60 ) {
        this.isPedidoExpirado = true;
        this.labelMsj = 'El tiempo para ver el pedido expiró.';

        // lleva al incio
        setTimeout(() => {
          this.router.navigate(['/']);
        }, 4000);

        return;
      }

      // guarda en storage time del pedido
      // por si regresa a incio relanzar el pedido
      localStorage.setItem('sys::time-lp', new Date().toISOString());
      localStorage.setItem('sys::url-lp', params.p.toString());

      this.loadOrden(_dataGetUrl);
    });
  }

  loadOrden(_dataGetUrl) {
    this.crudService.postFree(_dataGetUrl, 'comercio', 'get-last-pedido-url', false)
    .subscribe((res: any) => {
      console.log('pedido', res);

      if ( res?.data.length > 0 ) {
        this.darFormatoOrden(res.data);
      }
    });
  }

  private darFormatoOrden(listOrdenes: any): void {
    // console.log('aaa');
    listOrdenes.filter(x => !x.con_formato).map( (z: any) => {
      // if ( z.con_formato ) {return; }
      z.json_datos_delivery =  typeof z.json_datos_delivery === 'object' ? z.json_datos_delivery : JSON.parse(z.json_datos_delivery);
      z.estadoTitle = this.pedidoComercioService.getEstadoPedido(z.pwa_estado).estadoTitle;
      z.json_datos_delivery.p_subtotales = this.pedidoComercioService.darFormatoSubTotales(z.json_datos_delivery.p_subtotales, z.json_datos_delivery.p_header.arrDatosDelivery.costoTotalDelivery);
      z.visible = true;
      z.isTieneRepartidor = z.idrepartidor ? true : false;
      z.isClientePasaRecoger = z.json_datos_delivery.p_header.arrDatosDelivery.pasoRecoger;
      z.nom_repartidor = z.isClientePasaRecoger ? 'Cliente Recoge' : z.nom_repartidor;
      z.con_formato = true;
      z.flag_pedido_programado = z.flag_pedido_programado ? z.flag_pedido_programado : 0;

      const minStart = z.tiempo ? z.tiempo : 0;
      z.color = minStart >= this.timepoMax ? 'r' : minStart >= this.timepoMedio ? 'a' : 'v';
      z.color = z.flag_pedido_programado === 1 ? 'p' : z.color;
      return z;
    });


    this.openDialogOrden(listOrdenes[0]);

  }


  openDialogOrden(orden: any): void {
    const _dialogConfig = new MatDialogConfig();
    _dialogConfig.disableClose = true;
    _dialogConfig.hasBackdrop = true;
    _dialogConfig.width = '700px';
    _dialogConfig.panelClass = ['my-dialog-orden-detalle', 'my-dialog-scrool'];
    _dialogConfig.data = {
      laOrden: orden,
      isViewOnlyPedidoUrl: true
    };

    const dialogRef = this.dialog.open(DialogOrdenDetalleComponent, _dialogConfig);

    // dialogRef.afterClosed().subscribe((ordenClose: any) => {
    //   if ( ordenClose ) {
    //     // if (ordenClose.pwa_estado !== 'P') {
    //       this.quitarOrden(ordenClose);
    //     // }
    //     // actualiza resumen informativo
    //     this.resumenInformativo();
    //   }
    // });

  }

}
