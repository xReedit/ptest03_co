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
  listResumenInformativo: any; // informacion que se muestra en la parte de abajo del mapa
  listRepartidoresInformativo: any = []; // informacion que se muestra en la parte de abajo del mapa
  listMetodoPagoInformativo: any = []; // informacion que se muestra en la parte de abajo del mapa // si el comercio esta afiliado a la red de repartidores
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
  private optionChekListSelected: any; // opcion seleccionada del toolbar

  isComercioPropioRepartidor = false;


  // tablas
  displayedColumns: string[] = ['n', 'pedido', 'direccion', 'repartidor', 'tiempo', 'importe'];
  displayedColumnsRepartidor: string[] = ['repartidor', 'importe'];
  displayedColumnsMetodoPago: string[] = ['Metodo', 'importe'];


  // flag para cerrar card lista
  cardListaToggle = false;

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

          // actualiza resumen informativo
          this.resumenInformativo();
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
      // geoposition
      if ( data.position_now ) {
        _pedidoFind.position_now_repartidor = data.position_now;
      }

      console.log('pedido aceptado', data);

      // para que actualize en mapa
      this.listenService.setNotificaNuevoPedido(_pedidoFind);
      // actualiza resumen informativo
      this.resumenInformativo();
    });

    // fin del pedido onRepartidorNotificaFinPedido
    this.socketService.onRepartidorNotificaFinPedido()
    .pipe(takeUntil(this.destroy$))
    .subscribe((pedido: any) => {
      console.log('onRepartidorNotificaFinPedido', pedido);

      // detener tiempo pedido
      const _pedidoFind = this.findListaOrdenById(pedido.idpedido);
      if ( !_pedidoFind ) {return; }
      _pedidoFind.pwa_delivery_status = 4;
      _pedidoFind.estadoTitle = this.pedidoComercioService.getEstadoPedido('E').estadoTitle;
      _pedidoFind.quitar = true;

      // establecer estados para visualizacion de opciones
      this.listenService.setPedidoModificado(null);
      this.listenService.setPedidoModificado(pedido);
      // actualiza resumen informativo

      this.quitarOrden(_pedidoFind);
      this.resumenInformativo();
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

      this.resumenInformativo();
    });
  }

  private darFormatoOrden(): void {
    this.listOrdenes.map( (z: any) => {
      z.json_datos_delivery = JSON.parse(z.json_datos_delivery);
      z.estadoTitle = this.pedidoComercioService.getEstadoPedido(z.pwa_estado).estadoTitle;
      z.json_datos_delivery.p_subtotales = this.pedidoComercioService.darFormatoSubTotales(z.json_datos_delivery.p_subtotales);
      z.visible = true;
      z.isTieneRepartidor = z.idrepartidor ? true : false;

      const minStart = z.tiempo ? z.tiempo : 0;
      z.color = minStart >= this.timepoMax ? 'r' : minStart >= this.timepoMedio ? 'a' : 'v';
      return z;
    });

  }

  private initTimerOrdenes(): void {
    this.timerRun = setInterval(() => {this.calcTimer(); }, 1000);
  }

  private calcTimer(): void {
    let minStart = 0;
    this.listOrdenes.map(x => {
      if ( x.pwa_delivery_status.toString() === '4')  { x.labelMinTiempo = 'Min'; return; }
      x.labelMinTiempo = '';
      x.tiempo = this.utilService.xTiempoTranscurridos_2(x.hora);
      minStart = x.tiempo.split(':')[1]; // minutos
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
        // actualiza resumen informativo
        this.resumenInformativo();
      }
    });

  }

  private quitarOrden(ordenQuitar: any): void {
    // ordenQuitar.quitar = true;
    if ( this.optionChekListSelected.descripcion ===  'Entregados' ) {return; }
    setTimeout(() => {
      this.listOrdenes = this.listOrdenes.filter(x => !x.quitar);

      // console.log(this.listOrdenes);
      this.masonry.reloadItems();
      this.masonry.layout();
    }, 500);
  }

  filterList(opcion: any) {
    this.listBtnToolbar.map(x => x.checked = false);
    opcion.checked = true;
    this.optionChekListSelected = opcion;
    this.filtrarOrdenes(opcion);
  }

  private filtrarOrdenes(opcion: any) {
    console.log('opcion.filtro', opcion.filtro);
    this.xloadOrdenesPendientes(opcion.filtro);
  }

  resumenOrdenesPendientes() {
    this.listResumenAll = [];
    this.listOrdenes.map((o: any) => {
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
              _itemResumen.precio_total += i.precio_total;
            } else {
              _itemResumen = JSON.parse(JSON.stringify(i));
              _secResumen.items.push(_itemResumen);
            }
          });
        });
      });
    });

    this.showPanelRigth = true;
    // console.log('listResumen', this.listResumenAll);
  }

  // resumen de los pedidos
  private resumenInformativo() {
    let rowAdd: any = {};
    let rowAddRepartidor: any = {};
    let rowAddMetodoPago: any = {}; // metodos de pago resumen

    this.listResumenInformativo = [];
    this.listRepartidoresInformativo = [];
    this.listMetodoPagoInformativo = [];
    this.listOrdenes.map((o: any, i: number) => {
      rowAdd = {
        n: i + 1,
        idpedido: o.idpedido,
        correlativo_dia: o.correlativo_dia,
        cliente: o.json_datos_delivery.p_header.arrDatosDelivery.nombre,
        direccion: o.json_datos_delivery.p_header.arrDatosDelivery.direccionEnvioSelected.direccion,
        ciudad: o.json_datos_delivery.p_header.arrDatosDelivery.direccionEnvioSelected.ciudad || '',
        fecha: o.fecha,
        hora: o.hora,
        tiempo: o.tiempo ? o.tiempo + ' Min' : '',
        repartidor: o.nom_repartidor,
        estado: o.estadoTitle,
        color: o.color,
        metodoPago: o.json_datos_delivery.p_header.arrDatosDelivery.metodoPago,
        importe: o.total === '0' ? o.total_r : o.total
      };
      this.listResumenInformativo.push(rowAdd);

      // if ( this.isComercioPropioRepartidor ) {
      // esta lista se usa tambien para mostrar repartidores y su ubicacion que no son propios
      // se muestra la ubicacion toda vez que el pedido no este cerrado (entregado al cliente)
        rowAddRepartidor = {
          idrepartidor: o.idrepartidor,
          idpedido: o.idpedido,
          num_pedidos: 1,
          nom_repartidor: o.nom_repartidor,
          ap_repartidor: o.ap_repartidor,
          metodoPago: [{
            num_pedidos: 1,
            idtipo_pago: o.json_datos_delivery.p_header.arrDatosDelivery.metodoPago.idtipo_pago,
            descripcion: o.json_datos_delivery.p_header.arrDatosDelivery.metodoPago.descripcion,
            importe: o.total === '0' ? parseFloat(o.total_r) : parseFloat(o.total)
          }],
          importe: o.total === '0' ? parseFloat(o.total_r) : parseFloat(o.total)
        };

        this.resumenInformativoRepartidores(rowAddRepartidor);

      // }


      if ( !this.isComercioPropioRepartidor && o.metodoPagoRegistro ) {
        rowAddMetodoPago = {
          num_pedidos: 1,
          idtipo_pago: o.metodoPagoRegistro[0].idtipo_pago,
          descripcion: o.metodoPagoRegistro[0].descripcion,
          importe: o.total === '0' ? parseFloat(o.total_r) : parseFloat(o.total)
        };

        this.resumenInformativoMetodosPago(rowAddMetodoPago);
      }

    });

    // console.log('this.listResumenInformativo', this.listResumenInformativo);
  }

  // si y solo si el comercio tiene repartidores propios
  private resumenInformativoRepartidores(row: any) {
    // buscamos repartidor en lista
    const _elRepartidor = this.listRepartidoresInformativo.filter(r => r.idrepartidor === row.idrepartidor)[0];
    if ( _elRepartidor ) {

      _elRepartidor.num_pedidos += 1;
      _elRepartidor.importe += row.importe;

      // metodo de pago
      const _metodo = _elRepartidor.metodoPago.filter(m => m.idtipo_pago === row.metodoPago[0].idtipo_pago)[0];
      if ( _metodo ) {
        _metodo.num_pedidos += 1;
        _metodo.importe +=  row.metodoPago[0].importe;
      } else {
        _elRepartidor.metodoPago.push(row.metodoPago[0]);
      }

    } else {
      this.listRepartidoresInformativo.push(row);
    }

    // console.log('this.listRepartidoresInformativo', this.listRepartidoresInformativo);
  }


  private resumenInformativoMetodosPago(row: any) {
    // buscamos el metodo pago
    const _elMetodod = this.listMetodoPagoInformativo.filter(r => r.idtipo_pago === row.idtipo_pago)[0];
    if ( _elMetodod ) {

      _elMetodod.num_pedidos += 1;
      _elMetodod.importe += row.importe;

      // metodo de pago
      // const _metodo = _elMetodod.metodoPago.filter(m => m.idtipo_pago === row.metodoPago[0].idtipo_pago)[0];
      // if ( _metodo ) {
      //   _metodo.num_pedidos += 1;
      //   _metodo.importe +=  row.metodoPago[0].importe;
      // } else {
      //   _elMetodod.metodoPago.push(row);
      // }

    } else {
      this.listMetodoPagoInformativo.push(row);
    }


    console.log('this.listMetodoPagoInformativo', this.listMetodoPagoInformativo);
  }

  openDialogOrdenFromInformativo(row: any) {
    console.log('row', row);
    this.openDialogOrden(this.findListaOrdenById(row.idpedido));
  }

  // buscar orden en lista
  findListaOrdenById(idpedido: number): any {
    return this.listOrdenes.filter(o => o.idpedido === idpedido)[0];
  }

}
