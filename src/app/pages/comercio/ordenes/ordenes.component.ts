import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { ComercioService } from 'src/app/shared/services/comercio.service';
import { UtilitariosService } from 'src/app/shared/services/utilitarios.service';
import { MatDialogConfig, MatDialog } from '@angular/material/dialog';
import { DialogOrdenDetalleComponent } from 'src/app/componentes/dialog-orden-detalle/dialog-orden-detalle.component';
import { PedidoComercioService } from 'src/app/shared/services/pedido-comercio.service';
import { NgxMasonryComponent, NgxMasonryOptions  } from 'ngx-masonry';
import { SocketService } from 'src/app/shared/services/socket.service';
import { takeUntil } from 'rxjs/internal/operators/takeUntil';
import { Subject } from 'rxjs/internal/Subject';
import { style, animate } from '@angular/animations';
// import * as Isotope from 'isotope-layout';
// // declare var Isotope: any;

@Component({
  selector: 'app-ordenes',
  templateUrl: './ordenes.component.html',
  styleUrls: ['./ordenes.component.css']
})
export class OrdenesComponent implements OnInit, OnDestroy {
  listOrdenes: any;
  timerRun: any;
  timepoMax = 10;
  timepoMedio = this.timepoMax / 2;

  @ViewChild(NgxMasonryComponent) masonry: NgxMasonryComponent;
  private destroy$: Subject<boolean> = new Subject<boolean>();

  // public myOptions: NgxMasonryOptions = {
  //   horizontalOrder: true
  // };
      animations = {};

  constructor(
    private comercioService: ComercioService,
    private pedidoComercioService: PedidoComercioService,
    private utilService: UtilitariosService,
    private dialog: MatDialog,
    private socketService: SocketService
  ) { }

  ngOnInit(): void {
    this.xloadOrdenesPendientes();
    this.listenSocket();
  }

  ngOnDestroy(): void {
    clearInterval(this.timerRun);
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

  private listenSocket(): void {
    // escuchar nuevo nuevo pedido
    this.socketService.onGetNuevoPedido()
    .pipe(takeUntil(this.destroy$))
    .subscribe((res: any) => {
      console.log('nuevo pedido', res);
      this.comercioService.loadOrdenenById(res.idpedido)
        .subscribe((getOrden: any) => {
          getOrden.new = true;
          this.listOrdenes.push(getOrden);
          this.masonry.layout();
        });
    });
  }

  private xloadOrdenesPendientes(): void {
    this.comercioService.loadOrdenesPendientes()
    .subscribe((res: any) => {
      console.log(res);
      this.listOrdenes = res;

      this.darFormatoOrden();

      this.initTimerOrdenes();
    });
  }

  private darFormatoOrden(): void {
    this.listOrdenes.map( (z: any) => {
      z.json_datos_delivery = JSON.parse(z.json_datos_delivery);
      z.estadoTitle = this.pedidoComercioService.getEstadoPedido(z.pwa_estado).estadoTitle;
      z.json_datos_delivery.p_subtotales = this.pedidoComercioService.darFormatoSubTotales(z.json_datos_delivery.p_subtotales);
      return z;
    });
  }

  private initTimerOrdenes(): void {
    this.timerRun = setInterval(() => {this.calcTimer(); }, 1000);
  }

  private calcTimer(): void {
    let minStart = 0;
    this.listOrdenes.map(x => {
      x.tiempo = this.utilService.xTiempoTranscurridos_2(x.hora);
      minStart = x.tiempo.split(':')[0];
      x.color = minStart >= this.timepoMax ? 'r' : minStart >= this.timepoMedio ? 'a' : 'v';
    });
  }

  openDialogOrden(orden: any): void {
    const _dialogConfig = new MatDialogConfig();
    _dialogConfig.disableClose = true;
    _dialogConfig.hasBackdrop = true;
    _dialogConfig.width = '700px';
    _dialogConfig.panelClass = ['my-dialog-orden-detalle', 'my-dialog-scrool'];
    _dialogConfig.data = {
      laOrden: orden
    };

    const dialogRef = this.dialog.open(DialogOrdenDetalleComponent, _dialogConfig);

    dialogRef.afterClosed().subscribe((ordenClose: any) => {
      if ( ordenClose ) {
        // if (ordenClose.pwa_estado !== 'P') {
          this.quitarOrden(ordenClose);
        // }
      }
    });

  }

  private quitarOrden(ordenQuitar: any): void {
    // ordenQuitar.quitar = true;
    setTimeout(() => {
      this.listOrdenes = this.listOrdenes.filter(x => !x.quitar);

      console.log(this.listOrdenes);
      this.masonry.reloadItems();
      this.masonry.layout();
    }, 500);
  }

}
