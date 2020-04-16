import { Component, OnInit, OnDestroy } from '@angular/core';
import { ComercioService } from 'src/app/shared/services/comercio.service';
import { UtilitariosService } from 'src/app/shared/services/utilitarios.service';
import { MatDialogConfig, MatDialog } from '@angular/material/dialog';
import { DialogOrdenDetalleComponent } from 'src/app/componentes/dialog-orden-detalle/dialog-orden-detalle.component';
import { PedidoComercioService } from 'src/app/shared/services/pedido-comercio.service';


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


  constructor(
    private comercioService: ComercioService,
    private pedidoComercioService: PedidoComercioService,
    private utilService: UtilitariosService,
    private dialog: MatDialog,
  ) { }

  ngOnInit(): void {
    this.xloadOrdenesPendientes();
  }

  ngOnDestroy(): void {
    clearInterval(this.timerRun);
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
    _dialogConfig.data = {
      laOrden: orden
    };

    this.dialog.open(DialogOrdenDetalleComponent, _dialogConfig);
  }

}
