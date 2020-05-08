import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ComercioService } from 'src/app/shared/services/comercio.service';
import { MetodoPagoModel } from 'src/app/modelos/metodo.pago.model';
import { CrudHttpService } from 'src/app/shared/services/crud-http.service';
import { PedidoComercioService } from 'src/app/shared/services/pedido-comercio.service';
import { ListenStatusService } from 'src/app/shared/services/listen-status.service';

@Component({
  selector: 'app-com-registrar-pago',
  templateUrl: './com-registrar-pago.component.html',
  styleUrls: ['./com-registrar-pago.component.css']
})
export class ComRegistrarPagoComponent implements OnInit {

  @Input() orden: any;
  @Output() closeWindow = new EventEmitter<boolean>(false); // manda cerrar el dialog

  metodoPagoCliente: MetodoPagoModel;
  importeTotal: string;
  idTipoPagoSelected = null;


  listTipoPago: any;
  isRegistrarCuenta = true;
  loader = false;
  constructor(
    private comercioService: ComercioService,
    private crudService: CrudHttpService,
    private pedidoComercioService: PedidoComercioService,
    private listenService: ListenStatusService
  ) { }

  ngOnInit(): void {
    this.listTipoPago = this.comercioService.getSedeInfo().datos_tipo_pago;

    this.metodoPagoCliente = this.orden.json_datos_delivery.p_header.arrDatosDelivery.metodoPago;
    this.importeTotal = this.orden.total;
    this.isRegistrarCuenta = this.metodoPagoCliente.idtipo_pago === 2 ? false : true; // si paga con tarjeta si -> ya pago el cliente
  }

  registrarPago() {
    if ( this.isRegistrarCuenta ) {

      this.loader = true;

      this.metodoPagoCliente.importe = this.importeTotal; // importe del pedido

      const _dataSend = {
        idpedido: this.orden.idpedido,
        idcliente: this.orden.idcliente,
        idtipo_pago: this.idTipoPagoSelected,
        importe_total: this.importeTotal,
        obj_sutotales: this.orden.json_datos_delivery.p_subtotales
      };

      this.crudService.postFree(_dataSend, 'comercio', 'set-registrar-pago-pedido-comercio')
      .subscribe(res => {
        // console.log('registrarPago', res);

        const _dataPedido = {
          idpedido: this.orden.idpedido,
          estado: this.orden.isClientePasaRecoger ? 'E' : 'R'
        };

        this.crudService.postFree(_dataPedido, 'comercio', 'set-estado-pedido')
        .subscribe(resp => console.log(resp));

        setTimeout(() => {
          this.loader = false;

          // actualizar y detener tiempo en pedido // si el cliente recogio el pedido
          if ( this.orden.isClientePasaRecoger ) {
            this.orden.pwa_delivery_status = 4;
            this.orden.estadoTitle = this.pedidoComercioService.getEstadoPedido('E').estadoTitle;
            this.orden.quitar = true;

            this.listenService.setPedidoModificado(null);
            this.listenService.setPedidoModificado(this.orden);

          }

          this.orden.quitar = true;
          this.closeWindow.emit(true); // cerrar ventana
        }, 500);
      });

    }
  }

}
