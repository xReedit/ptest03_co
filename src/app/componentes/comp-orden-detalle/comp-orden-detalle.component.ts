import { Component, OnInit, Input } from '@angular/core';
import { PedidoComercioService } from 'src/app/shared/services/pedido-comercio.service';
import { PedidoModel } from 'src/app/modelos/pedido.model';
import { ComercioService } from 'src/app/shared/services/comercio.service';

@Component({
  selector: 'app-comp-orden-detalle',
  templateUrl: './comp-orden-detalle.component.html',
  styleUrls: ['./comp-orden-detalle.component.css']
})
export class CompOrdenDetalleComponent implements OnInit {

  @Input() orden: any;

  isTieneRepartidor = false;
  isRepartidoresPropios = false;
  btnActionTitule = 'Aceptar Pedido';
  loaderEstado = false;

  showFacturar = false; // cambia cunado da click en facturar
  isShowControlFacturador = false;

  isRepartidorPaga = true; // si el repartidor va a pagar o ya el pedido esta pagado
  descripcionComoPagaRepartidor = '';
  _tabIndex = 0; // 0 todo el pedido 1 facturacion 2 registro de pago
  constructor(
    private pedidoComercioService: PedidoComercioService,
    private comercioService: ComercioService
  ) { }

  ngOnInit(): void {

    console.log('orden detalle', this.orden);
    this.getEstadoPedido();
    // this.isTieneRepartidor = this.orden.repartidor ? true : false;

    // si es diferente de tarjeta entonces el repartidor si paga
    this.isRepartidorPaga = this.orden.json_datos_delivery.p_header.arrDatosDelivery.metodoPago.idtipo_pago !== 2;
    this.descripcionComoPagaRepartidor = this.isRepartidorPaga ? 'El Repartidor tiene que pagar el pedido' : 'Pedido pagado. Repartidor NO paga.';

    // this.xCargarDatosAEstructuraImpresion(this.orden.json_datos_delivery.p_body);

  }

  private getEstadoPedido(): void {
    const getEstado = this.pedidoComercioService.getEstadoPedido(this.orden.pwa_estado);
    this.btnActionTitule = getEstado.btnTitulo;
    this.orden.pwa_estado = getEstado.estado;
    this.orden.estadoTitle = getEstado.estadoTitle;
  }

  setEstadoOrden(): void {
    this.loaderEstado = true;
    const getEstado = this.pedidoComercioService.setEstadoPedido(this.orden.idpedido, this.orden.pwa_estado);
    this.btnActionTitule = getEstado.btnTitulo;
    this.orden.pwa_estado = getEstado.idpedido;
    this.orden.estadoTitle = getEstado.estadoTitle;

    setTimeout(() => {
      this.loaderEstado = false;
    }, 1000);
  }

  onChangeFacturador($event) {
    this.isShowControlFacturador = $event;
    this._tabIndex = this.isShowControlFacturador ? 1 : 0;
    this.showFacturar = false;
  }

  goFacturar() {
    this.showFacturar = true;
  }

  // clickTab($event: any) {
  //   console.log('$event.index', $event.index);
  //   this._tabIndex = $event.index;
  // }


  // xCargarDatosAEstructuraImpresion (pedido: PedidoModel): any {
  //   // var _arrEstructura = xm_log_get('estructura_pedido'); // get estructura_pedido
  //   let _arrRpt = [];

  //   // enumero los id desde segun el idtipoconsumo
  //   // _arrEstructura.forEach(element => {
  //   //     _arrRpt[element.idtipo_consumo]=element
  //   // });

  //   pedido.tipoconsumo.map((element: any) => {
  //     _arrRpt[0] = element;
  //     _arrRpt[0].des = 'Orden';
  //     _arrRpt[0].titulo = 'Orden';
  //   });

  //   const _SubItems = [];
  //   pedido.tipoconsumo.map(x => {
  //     x.secciones.map(s => s.items.map(i => _SubItems.push(i)));
  //   });

  //   const idtipoconsumo = _arrRpt[0].idtipo_consumo;

  //   // _arrRpt=_arrEstructura.slice();
  //   _arrRpt = JSON.parse(JSON.stringify(_arrRpt).replace(/descripcion/g, 'des'));

  //   _SubItems.map((element: any, i: number) => {
  //     if ( !element.visible ) {return; }
  //     element.id = element.iditem;
  //     element.des_seccion = element.seccion;
  //     element.punitario = element.precio_unitario;
  //     element.cantidad = element.cantidad_seleccionada;
  //     element.idtipo_consumo = 0;
  //     // element.visible = 1;
  //     _arrRpt[0][i] = element;
  //   });

  //   return _arrRpt;
  //   // console.log('_arrRpt', _arrRpt);

  // }
}
