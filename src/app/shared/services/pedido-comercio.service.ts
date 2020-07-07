import { Injectable } from '@angular/core';
import { CrudHttpService } from './crud-http.service';
import { ComercioService } from './comercio.service';
import { SedeInfoModel } from 'src/app/modelos/sede.info.model';
import { Observable } from 'rxjs/internal/Observable';
import { SocketService } from './socket.service';
import { PedidoRepartidorModel } from 'src/app/modelos/pedido.repartidor.model';



@Injectable({
  providedIn: 'root'
})
export class PedidoComercioService {


  // interface IestadoPedido {
  //   estado: string;
  //   estadoTitle: string;
  //   btnTitulo: string;
  //   showBtnFacturacion: boolean;
  //   showSelectRepartidor: boolean;
  // }

  isPropioRepartidores = false;
  isComercioAfiliado = true;
  isComercioFacturacionE = true;
  infoComercio: SedeInfoModel;

  _estadoPedido: any = {};

  constructor(
    private comercioService: ComercioService,
    private crudService: CrudHttpService,
    private socketService: SocketService
  ) {

    this.infoComercio = this.comercioService.getSedeInfo();
    this.isPropioRepartidores = this.infoComercio.pwa_delivery_servicio_propio === 0 ? false : true;
    this.isComercioAfiliado = this.infoComercio.pwa_comercio_afiliado === 0 ? false : true;
    this.isComercioFacturacionE = this.infoComercio.facturacion_e_activo === 0 ? false : true;
  }


  // boton buscar repartidor o select repartidor
  // boton facturar -- si esta afiliado y si esta con facturacion
  showMoreButtoms() {

  }

  setEstadoPedido(idpedido: number, pwa_estado: string): any {

    const getEstado = this.getEstadoPedido(pwa_estado, true);

    const _dataSend = {
      idpedido: idpedido,
      estado: getEstado.estado
    };

    this.crudService.postFree(_dataSend, 'comercio', 'set-estado-pedido')
      .subscribe(res => {
        console.log('.');
      });

    return getEstado;
  }


  // comercio con repartidores propios solicita repartidor para este pedido
  setFlagSolicitaRepartidorRed(idpedido: number): any {
    return new Observable(observer => {
      const _dataSend = {
        idpedido: idpedido,
      };

      this.crudService.postFree(_dataSend, 'comercio', 'set-flag-solicita-repartidor-papaya')
        .subscribe(res => {
          this.socketService.emit('set-solicitar-repartidor-papaya', null);
          observer.next(res);
        });
    });
  }

  getEstadoPedido(pwa_estado: string, isSave = false): any {
    let estadoPedido = '';
    let btnTitulo = '';
    let estadoTitle = 'Pendiente';

    this._estadoPedido.showBtnFacturacion = false;
    switch (pwa_estado) {
      case 'P':
        estadoPedido = isSave ? 'A' : 'P'; // aceptado
        btnTitulo = isSave ? 'Listo, Preparado.' : 'Aceptar Pedido';
        estadoTitle = isSave ? 'Aceptado' : 'Pendiente';
        break;
      case 'A':
        estadoPedido = isSave ? 'D' : 'A'; // despachado listo para entregar / preparado
        btnTitulo = isSave ? 'Entregar al repartidor' : 'Listo, Preparado.';
        this._estadoPedido.showBtnFacturacion = isSave;
        estadoTitle = isSave ? 'Listo' : 'Aceptado';
        break;
      case 'D':
        estadoPedido = isSave ? 'R' : 'D'; // con el repartidor (entregado al repartidor)
        btnTitulo = isSave ? '' : 'Entregar al repartidor';
        estadoTitle = isSave ? 'Listo' : 'Listo';
        this._estadoPedido.showBtnFacturacion = !isSave;
        break;
      case 'R':
        estadoPedido = 'E'; // entregado con el cliente
        btnTitulo = '';
        estadoTitle = isSave ? 'Listo' : 'Listo';
        break;
      case 'E':
        estadoPedido = 'E'; // entregado con el cliente
        btnTitulo = '';
        estadoTitle = 'Entregado';
        break;
    }

    this._estadoPedido.estado = estadoPedido;
    this._estadoPedido.estadoTitle = estadoTitle;
    this._estadoPedido.btnTitulo = btnTitulo;


    return this._estadoPedido;
  }


  // traer repartidores del comercio
  getRepartidores() {
    return new Observable(observer => {
      this.crudService.getAll('comercio', 'get-comercio-repartidor', false, false, true)
      .subscribe((res: any) => {
        observer.next(res.data);
      });
    });
  }


  // quitamos servicio delivery y propina del subtotal
  // flagSolicitaRepartidor = cuando comercio con repartidor propio solicita repartidor de la red papaya express
  darFormatoSubTotales(arrTotales: any = null, costoEntrega: number = 0, flagSolicitaRepartidor: boolean = false) {
    // console.log('aaa');

    // si tiene sus propios repartidores no da formato no quita nada
    if ( this.comercioService.sedeInfo.pwa_delivery_servicio_propio === 1 && !flagSolicitaRepartidor ) { return arrTotales; }


    // agregar o restar el importe del costo de entrega SI el comercio paga el costo de entrega pwa_delivery_comercio_paga_entrega
    if ( this.comercioService.sedeInfo.pwa_delivery_comercio_paga_entrega === 1 || flagSolicitaRepartidor) {
      // ingresamos en la penultima postion del arrTotales
      const postionInsert = arrTotales.length - 1;
      const _row = {
        descripcion: 'Costo de Entrega',
        esImpuesto: 0,
        id: -4,
        importe: - costoEntrega,
        quitar: false,
        tachado: false,
        visible: false,
        visible_cpe: false
      };
      arrTotales.splice(postionInsert, 0, _row);

      // console.log('costo de entrega insertado', arrTotales);
    }

    // console.log(arrTotales);
    const rowTotal = arrTotales[arrTotales.length - 1];

    // si repartidores propio muestra comisiciones y propina
    if ( this.comercioService.sedeInfo.pwa_delivery_servicio_propio === 1) {

      rowTotal.importe = arrTotales.filter(x => x.descripcion !== 'TOTAL').map(x => parseFloat(x.importe)).reduce((a, b) => a + b, 0);
      return arrTotales;

    } else {
      // -2 = servicio deliver -3 = propina
      rowTotal.importe = arrTotales.filter(x => x.id !== -2 && x.id !== -3 && x.descripcion !== 'TOTAL').map(x => parseFloat(x.importe)).reduce((a, b) => a + b, 0);
      return arrTotales.filter(x => x.id !== -2 && x.id !== -3);
    }
  }


  setRepartidorToPedido(_idrepartidor: number, _pedido: any): void {
    const _dataSend = { idrepartidor: _idrepartidor, idpedido: _pedido.idpedido };
    this.socketService.emit('set-repartidor-pedido-asigna-comercio', _pedido);

    this.crudService.postFree(_dataSend, 'comercio', 'set-repartidor-to-pedido')
    .subscribe(res => {
      console.log('.');
    });
  }


}
