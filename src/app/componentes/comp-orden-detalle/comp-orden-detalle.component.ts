import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { PedidoComercioService } from 'src/app/shared/services/pedido-comercio.service';
import { PedidoModel } from 'src/app/modelos/pedido.model';
import { ComercioService } from 'src/app/shared/services/comercio.service';
import { ListenStatusService } from 'src/app/shared/services/listen-status.service';
import { DialogDesicionComponent } from '../dialog-desicion/dialog-desicion.component';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';

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
  loaderFacturacion = false;
  loaderFlagRepartidor = false;

  showFacturar = false; // cambia cunado da click en facturar
  isShowControlFacturador = false;

  isRepartidorPaga = true; // si el repartidor va a pagar o ya el pedido esta pagado
  nomRepartidor = null;
  descripcionComoPagaRepartidor = '';
  descripcionComoClienteRecoge = ''; // si el cliente recoge
  descripcionDetalleFacturacion = '';
  _tabIndex = 0; // 0 todo el pedido 1 facturacion 2 registro de pago

  // si tiene habilitado facturacion
  isFacturacionActivo = false;
  isComercioPropioRepartidor = false;

  listRepartidoresPropios: any;
  repartidorSelected;

  constructor(
    private pedidoComercioService: PedidoComercioService,
    private comercioService: ComercioService,
    private listenService: ListenStatusService,
    private dialog: MatDialog,
  ) { }

  ngOnInit(): void {

    console.log('orden detalle', this.orden);
    this.getEstadoPedido();
    // this.isTieneRepartidor = this.orden.repartidor ? true : false;

    // si es diferente de tarjeta entonces el repartidor si paga
    this.comercioService.getSedeInfo();
    this.isRepartidorPaga = this.orden.json_datos_delivery.p_header.arrDatosDelivery.metodoPago.idtipo_pago !== 2;
    this.descripcionComoPagaRepartidor = this.isRepartidorPaga ? 'El Repartidor tiene que pagar el pedido' : 'Pedido pagado. Repartidor NO paga.';
    this.descripcionComoClienteRecoge = this.isRepartidorPaga ? `Y paga el pedido con: ${this.orden.json_datos_delivery.p_header.arrDatosDelivery.metodoPago.descripcion}.` : 'Pedido pagado. Cliente NO paga.';
    this.descripcionDetalleFacturacion = this.orden.json_datos_delivery.p_header.arrDatosDelivery.tipoComprobante.dni ? this.orden.json_datos_delivery.p_header.arrDatosDelivery.tipoComprobante.dni : 'Publico en general';
    this.descripcionDetalleFacturacion = this.descripcionDetalleFacturacion + ' ' + (this.orden.json_datos_delivery.p_header.arrDatosDelivery.tipoComprobante?.otro_dato || '');
    this.isFacturacionActivo = this.comercioService.sedeInfo.facturacion_e_activo === 1;

    this.nomRepartidor = this.orden.idrepartidor ? this.orden.nom_repartidor + ' ' + this.orden.ap_repartidor : null;
    this.repartidorSelected = this.orden.idrepartidor;
    this.isComercioPropioRepartidor = this.comercioService.sedeInfo.pwa_delivery_servicio_propio === 1;

    // si tiene repartidores propios
    if ( this.isComercioPropioRepartidor ) {
      this.getRepartidoresComercio();
    }
    // this.xCargarDatosAEstructuraImpresion(this.orden.json_datos_delivery.p_body);

  }

  private getRepartidoresComercio(): void {
    this.comercioService.loadRepartidoresComercio()
      .subscribe(res => {
        this.listRepartidoresPropios = res;
      });
  }

  private getEstadoPedido(): void {
    const getEstado = this.pedidoComercioService.getEstadoPedido(this.orden.pwa_estado);
    // this.btnActionTitule = getEstado.btnTitulo;
    this.btnActionTitule = getEstado.btnTitulo === 'Entregar al repartidor' && this.orden.isClientePasaRecoger ? 'Entregar al cliente' : getEstado.btnTitulo;
    this.orden.pwa_estado = getEstado.estado;
    this.orden.estadoTitle = getEstado.estadoTitle;
  }

  setEstadoOrden(): void {
    this.loaderEstado = true;
    const getEstado = this.pedidoComercioService.setEstadoPedido(this.orden.idpedido, this.orden.pwa_estado);
    this.btnActionTitule = getEstado.btnTitulo === 'Entregar al repartidor' && this.orden.isClientePasaRecoger ? 'Entregar al cliente' : getEstado.btnTitulo;
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
        // si no tiene repartidores propios
        // y si no recoge el cliente
        if ( !this.isComercioPropioRepartidor || this.orden.isClientePasaRecoger) {
          this._tabIndex = 2; // a registrar PAGO
        }
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
    this.loaderFacturacion = true;
    setTimeout(() => {
      this.loaderFacturacion = false;
    }, 1500);
  }


  saveRepartidor($event): void {
    const indexR = $event.value;
    const _repartidor = this.listRepartidoresPropios.filter(r => r.idrepartidor === indexR)[0];
    this.orden.idrepartidor = _repartidor.idrepartidor;
    this.orden.nom_repartidor = _repartidor.nombre;
    this.orden.ap_repartidor = _repartidor.apellido;
    this.orden.telefono_repartidor = _repartidor.telefono;

    this.listenService.setPedidoModificado(this.orden);
    this.pedidoComercioService.setRepartidorToPedido(indexR, this.orden);

  }


  solicitarRepartopapaya() {
    const _dialogConfig = new MatDialogConfig();
    _dialogConfig.disableClose = true;
    _dialogConfig.hasBackdrop = true;
    _dialogConfig.data = {
      idMjs: 3,
      costoEntrega: this.orden.json_datos_delivery.p_header.arrDatosDelivery.costoTotalDelivery
    };


    this.loaderFlagRepartidor  = true;
    const dialogRef = this.dialog.open(DialogDesicionComponent, _dialogConfig);
    dialogRef.afterClosed().subscribe((result: any) => {
      if ( result ) {
        this.orden.flag_solicita_repartidor_papaya = 1;
        this.pedidoComercioService.setFlagSolicitaRepartidorRed(this.orden.idpedido)
        .subscribe( res => {

          this.orden.json_datos_delivery.p_subtotales = this.pedidoComercioService.darFormatoSubTotales(this.orden.json_datos_delivery.p_subtotales, this.orden.json_datos_delivery.p_header.arrDatosDelivery.costoTotalDelivery, true);

          this.loaderFlagRepartidor  = false;
          this.cerrarDetalles(true);
        });
        // const dataReparitdor = {
        //   idrepartidor: repartidor.idrepartidor
        // };

        // this.crudService.postFree(dataReparitdor, 'comercio', 'borrar-mi-repartidor', true)
        // .subscribe(res => {
        //     this.loadRepartidores();
        // });
      }
      this.loaderFlagRepartidor  = false;
    });
  }


  cerrarDetalles(val: boolean) {
    if ( val ) {
      this.closeWindow.emit(val);
    }
  }

}
