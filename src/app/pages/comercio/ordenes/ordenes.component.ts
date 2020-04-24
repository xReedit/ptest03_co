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

import { TipoConsumoModel } from 'src/app/modelos/tipoconsumo.model';
import { SeccionModel } from 'src/app/modelos/seccion.model';
import { ActivatedRoute } from '@angular/router';
import { PedidoRepartidorService } from 'src/app/shared/services/pedido-repartidor.service';
import { ListenStatusService } from 'src/app/shared/services/listen-status.service';

// import * as Isotope from 'isotope-layout';
// // declare var Isotope: any;

@Component({
  selector: 'app-ordenes',
  templateUrl: './ordenes.component.html',
  styleUrls: ['./ordenes.component.css']
})
export class OrdenesComponent implements OnInit, OnDestroy {
  listOrdenes: any;
  listResumenAll: any; // listado de resumen de todos los pedidos
  cantidadOrdenes = 0; // cantidad de pedidos en vista
  timerRun: any;
  timepoMax = 10;
  timepoMedio = this.timepoMax / 2;

  showPanelRigth = false;

  showVistaLista = true;

  @ViewChild(NgxMasonryComponent) masonry: NgxMasonryComponent;
  private destroy$: Subject<boolean> = new Subject<boolean>();


  // botones del toolbar
  listBtnToolbar = [];

  isComercioPropioRepartidor = false;

  constructor(
    private comercioService: ComercioService,
    private pedidoComercioService: PedidoComercioService,
    private pedidoRepartidorService: PedidoRepartidorService,
    private utilService: UtilitariosService,
    private dialog: MatDialog,
    private socketService: SocketService,
    private activatedRoute: ActivatedRoute,
    private listenService: ListenStatusService
  ) { }

  ngOnInit(): void {

    this.activatedRoute.params.subscribe(params => {
      const id = params['id'];
      this.showVistaLista = id === 'lista';
      });

    this.xloadOrdenesPendientes(`'P', 'A'`);
    this.listenSocket();
    this.comercioService.getSedeInfo();
    this.isComercioPropioRepartidor = this.comercioService.sedeInfo.pwa_delivery_servicio_propio === 1;


    this.listBtnToolbar.push({descripcion: 'Pendientes', checked: true, filtro: `'P', 'A'`});
    this.listBtnToolbar.push({descripcion: ' Listos ', checked: false, filtro: `'D'`});
    this.listBtnToolbar.push({descripcion: ' Entregados ', checked: false, filtro: `'R', 'E'` });
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

          this.listenService.setNotificaNuevoPedido(getOrden);

          this.pedidoRepartidorService.playAudioNewPedido();
          this.masonry.reloadItems();
          this.masonry.layout();
        });
    });


    this.socketService.onGetPedidoAceptadoByReparidor()
    .pipe(takeUntil(this.destroy$))
    .subscribe((data: any) => {
      // buscar en la lista al pedido

      const _pedidoFind = this.findListaOrdenById(data.idpedido);
      _pedidoFind.nom_repartidor = data.nombre;
      _pedidoFind.ap_repartidor = data.apellido;
      _pedidoFind.idrepartidor = data.idrepartidor;
      _pedidoFind.isTieneRepartidor = true;
      _pedidoFind.telefono_repartidor = data.telefono;

      console.log('pedido aceptado', data);
    });
  }

  private xloadOrdenesPendientes(fitro: string): void {
    this.comercioService.loadOrdenesPendientes(fitro)
    .subscribe((res: any) => {
      console.log(res);
      this.listOrdenes = res;

      this.cantidadOrdenes = this.listOrdenes.length;

      this.darFormatoOrden();

      this.initTimerOrdenes();
    });
  }

  private darFormatoOrden(): void {
    this.listOrdenes.map( (z: any) => {
      z.json_datos_delivery = JSON.parse(z.json_datos_delivery);
      z.estadoTitle = this.pedidoComercioService.getEstadoPedido(z.pwa_estado).estadoTitle;
      z.json_datos_delivery.p_subtotales = this.pedidoComercioService.darFormatoSubTotales(z.json_datos_delivery.p_subtotales);
      z.visible = true;
      z.isTieneRepartidor = z.idrepartidor ? true : false;
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

  filterList(opcion: any) {
    this.listBtnToolbar.map(x => x.checked = false);
    opcion.checked = true;
    this.filtrarOrdenes(opcion);
  }

  private filtrarOrdenes(opcion: any) {
    console.log('opcion.filtro', opcion.filtro);
    this.xloadOrdenesPendientes(opcion.filtro);
  }

  resumenOrdenesPendientes() {
    this.listResumenAll = [];
    this.listOrdenes.map(o => {
      o.json_datos_delivery.p_body.tipoconsumo.map((c: TipoConsumoModel) => {
        c.secciones.map((s: SeccionModel) => {
          let _secResumen = <SeccionModel>this.listResumenAll.filter((r: SeccionModel) => r.idseccion === s.idseccion)[0];
          if ( !_secResumen ) {
            _secResumen = JSON.parse(JSON.stringify(s));
            _secResumen.items = [];
            this.listResumenAll.push(_secResumen);
          }
          s.items.map(i => {
            let _itemResumen = _secResumen.items.filter(ri => ri.iditem === i.iditem)[0];
            if ( _itemResumen ) {
              _itemResumen.cantidad_seleccionada += i.cantidad_seleccionada;
            } else {
              _itemResumen = JSON.parse(JSON.stringify(i));
              _secResumen.items.push(_itemResumen);
            }
          });
        });
      });
    });

    this.showPanelRigth = true;
    console.log('listResumen', this.listResumenAll);
  }

  // buscar orden en lista
  findListaOrdenById(idpedido: number): any {
    return this.listOrdenes.filter(o => o.idpedido === idpedido).map(x => x);
  }

}
