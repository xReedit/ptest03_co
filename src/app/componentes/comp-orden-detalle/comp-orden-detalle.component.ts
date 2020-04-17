import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
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
  @Output() closeWindow = new EventEmitter<boolean>(false); // manda cerrar el dialog

  isTieneRepartidor = false;
  isRepartidoresPropios = false;
  btnActionTitule = 'Aceptar Pedido';
  loaderEstado = false;

  showFacturar = false; // cambia cunado da click en facturar
  isShowControlFacturador = false;

  isRepartidorPaga = true; // si el repartidor va a pagar o ya el pedido esta pagado
  descripcionComoPagaRepartidor = '';
  _tabIndex = 0; // 0 todo el pedido 1 facturacion 2 registro de pago

  // si tiene habilitado facturacion
  isFacturacionActivo = false;

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
    this.isFacturacionActivo = this.comercioService.getSedeInfo().facturacion_e_activo === 1;

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
    this.orden.pwa_estado = getEstado.estado;
    this.orden.estadoTitle = getEstado.estadoTitle;

    setTimeout(() => {
      this.loaderEstado = false;
      this.goFinalizarPedido();
    }, 1000);
  }

  // cuando esta en "entregar al repartidor"
  // pasa de frente a registrar pago del repartidor
  // si quiere facturar siempre va estar activo el boton facturar
  private goFinalizarPedido() {
    switch (this.orden.pwa_estado) {
      case 'R':
        this._tabIndex = 2; // a registrar
        break;
      case 'A':
        this.closeWindow.emit(true); // manda cerrar dialog
        break;
      case 'D':
        this.orden.quitar = true;
        this.closeWindow.emit(true); // manda cerrar dialog
        break;
    }
  }

  onChangeFacturador($event) {
    this.isShowControlFacturador = $event;
    this._tabIndex = this.isShowControlFacturador ? 1 : 0;
    this.showFacturar = false;
  }

  goFacturar() {
    this.showFacturar = true;
  }


  cerrarDetalles(val: boolean) {
    if ( val ) {
      this.closeWindow.emit(val);
    }
  }

}
