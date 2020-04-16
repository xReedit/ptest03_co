import { Component, OnInit, Input } from '@angular/core';
import { ComercioService } from 'src/app/shared/services/comercio.service';
import { MetodoPagoModel } from 'src/app/modelos/metodo.pago.model';
import { CrudHttpService } from 'src/app/shared/services/crud-http.service';

@Component({
  selector: 'app-com-registrar-pago',
  templateUrl: './com-registrar-pago.component.html',
  styleUrls: ['./com-registrar-pago.component.css']
})
export class ComRegistrarPagoComponent implements OnInit {

  @Input() orden: any;
  metodoPagoCliente: MetodoPagoModel;
  importeTotal: string;
  idTipoPagoSelected = null;


  listTipoPago: any;
  isRegistrarCuenta = true;
  loader = false;
  constructor(
    private comercioService: ComercioService,
    private crudService: CrudHttpService
  ) { }

  ngOnInit(): void {
    this.listTipoPago = this.comercioService.getSedeInfo().datos_tipo_pago;

    this.metodoPagoCliente = this.orden.json_datos_delivery.p_header.arrDatosDelivery.metodoPago;
    this.importeTotal = this.orden.total;
    this.isRegistrarCuenta = this.metodoPagoCliente.idtipo_pago === 2 ? false : true; // si ya pago el cliente
  }

  registrarPago() {
    if ( this.isRegistrarCuenta ) {

      this.loader = true;

      const _dataSend = {
        idpedido: this.orden.idpedido,
        idcliente: this.orden.idcliente,
        idtipo_pago: this.idTipoPagoSelected,
        importe_total: this.importeTotal,
        obj_sutotales: this.orden.json_datos_delivery.p_subtotales
      };

      this.crudService.postFree(_dataSend, 'comercio', 'set-registrar-pago-pedido-comercio')
      .subscribe(res => {
        console.log('registrarPago', res);

        const _dataPedido = {
          idpedido: this.orden.idpedido,
          estado: 'R'
        };

        this.crudService.postFree(_dataPedido, 'comercio', 'set-estado-pedido')
        .subscribe(resp => console.log(resp));

        setTimeout(() => {
          this.loader = false;
        }, 500);
      });

    }
  }

}
