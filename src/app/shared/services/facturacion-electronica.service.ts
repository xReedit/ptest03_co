import { Injectable } from '@angular/core';
import { ComercioService } from './comercio.service';
import { CrudHttpService } from './crud-http.service';
import { Observable } from 'rxjs/internal/Observable';
import { TipoComprobanteModel } from 'src/app/modelos/tipo.comprobante.model';
import { PedidoModel } from 'src/app/modelos/pedido.model';
import { NumerosALetrasService } from './numeros-a-letras.service';


@Injectable({
  providedIn: 'root'
})
export class FacturacionElectronicaService {

  constructor(
    private comercioService: ComercioService,
    private crudService: CrudHttpService,
    private numeroLetraService: NumerosALetrasService
  ) { }

  // get tipo de comprobante
  getTipoComprobantes() {
    return new Observable(observer => {
    this.crudService.getAll('comercio', 'get-tipo-comprobantes', false, false, true)
      .subscribe((res: any) => {
        observer.next(res.data);
      });
    });
  }

  // guardar cliente nuevo
  guardarClienteNuevo(datosCliente: any) {
    return new Observable(observer => {
    const _dataSend = {cliente: datosCliente};
    this.crudService.postFree(_dataSend, 'consulta', 'registrar-cliente-nuevo')
      .subscribe((res: any) => {
        observer.next(res.data);
      });
    });
  }

  // prepara los items a formato facturacion (es decir todos las secciones lo colaca en una)
  // si el delivery es propio o tienes otro cobros por servicio o taper para llevar
  // entonces esos item se adicionan al pedido como 'ADICIONALES' : 'SERVICIOS
  xCargarDatosAEstructuraImpresion (pedido: PedidoModel, _substotales: any): any {
    let _arrRpt = [];

    pedido.tipoconsumo.map((element: any) => {
      _arrRpt[0] = element;
      _arrRpt[0].des = 'Orden';
      _arrRpt[0].titulo = 'Orden';
      _arrRpt[0].items = [];
    });

    const _SubItems = [];
    pedido.tipoconsumo.map(x => {
      x.secciones.map(s => s.items.map(i => _SubItems.push(i)));
    });

    // const idtipoconsumo = _arrRpt[0].idtipo_consumo;

    // _arrRpt=_arrEstructura.slice();
    _arrRpt = JSON.parse(JSON.stringify(_arrRpt).replace(/descripcion/g, 'des'));
    _arrRpt[0].secciones = null;

    _SubItems.map((element: any, i: number) => {
      if ( !element.visible ) {return; }
      element.id = element.iditem;
      element.des_seccion = element.seccion;
      element.punitario = element.precio_unitario;
      element.cantidad = element.cantidad_seleccionada;
      element.idtipo_consumo = 0;
      // element.visible = 1;
      // _arrRpt[0][i] = element
      _arrRpt[0].items.push(element);
    });


    // agreagar adicionales si los hay y los suma a subtotal
    let cantAddSubtotal = 0;
    _substotales.map(x => {
        if (x.id === undefined) { return; } // id remplaza a tachado es decir no se aceptan subtotales
        if (x.id === 0) { return; } // es el sub total cunado viene de papaya express
        if (x.tachado === true) { return; }
        if (x.esImpuesto === 1) { return; }

        const seccion = x.id.toString().indexOf('a') >= 0 ? 'ADICIONALES' : 'SERVICIOS';
        // const cantidad = x.cantidad ? x.cantidad : 1;
        const _pUnitario = x.punitario ? parseFloat(x.punitario) : parseFloat(x.importe); // para calcular la cantidad cuando es por item // si este cobro es por pedido entonces el punitario es igual al total
        const cantidad = parseFloat(x.importe) / _pUnitario;
        const index = _arrRpt[0].items.length + 1; // en facturacion electronica el id debe ser numero

        cantAddSubtotal = parseFloat(x.importe); // para aumentar al subtotal xArraySubTotales

        _arrRpt[0].items.push({
          id: index.toString(),
          cantidad: cantidad,
          des: x.descripcion.toUpperCase(),
          punitario: _pUnitario,
          precio_total: x.importe,
          seccion: seccion
        });
    });

    // actualiza subtotal
    if ( cantAddSubtotal !== 0 ) {
      cantAddSubtotal = parseFloat(_substotales[0].importe) + cantAddSubtotal;
      _substotales[0].importe = cantAddSubtotal;
    }

    return _arrRpt;
    // console.log('_arrRpt', _arrRpt);

  }

  cocinarFactura(_idpedido: number, _items: any, _substotales: any, _comprobante: TipoComprobanteModel, _cliente: any) {

    // datos de la sede
    const _infoSede = this.comercioService.getSedeInfo();

    // convertir el total en letras
    const rowTotal = _substotales[_substotales.length - 1 ];
    const importeLetras = this.numeroLetraService.NumeroALetras(rowTotal.importe);
    rowTotal.importe_letras = importeLetras;

    const dataSend = {
      items: _items,
      subtotales: _substotales,
      comprobante: _comprobante,
      cliente: _cliente,
      sede: _infoSede
    };

    this.crudService.postFree(dataSend, 'service', 'facturacion-e')
      .subscribe(res => {
        // console.log(res);

        const dataPedido = { idpedido: _idpedido };
        this.crudService.postFree(dataPedido, 'comercio', 'set-pwa-facturado').subscribe((resp: any) => {});
      });

  }

}
