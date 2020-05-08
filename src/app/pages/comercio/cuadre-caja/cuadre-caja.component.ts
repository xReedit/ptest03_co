import { Component, OnInit, ViewChild } from '@angular/core';
import { ComercioService } from 'src/app/shared/services/comercio.service';
// import * as cf from 'crossfilter2';

// import { Crossfilter, Dimension } from 'crossfilter2';
// import * as crossfilter from 'crossfilter2';
import crossfilter from 'crossfilter2';
import { TipoConsumoModel } from 'src/app/modelos/tipoconsumo.model';
import { SeccionModel } from 'src/app/modelos/seccion.model';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'app-cuadre-caja',
  templateUrl: './cuadre-caja.component.html',
  styleUrls: ['./cuadre-caja.component.css']
})
export class CuadreCajaComponent implements OnInit {
  numTotalPedidos: number;
  importeTotalEnCaja: number;
  timepoPromedioEntrega: number;
  tiempoMinEntrega: number;
  tiempoMaxEntrega: number;

  dataCierre: any;
  dataFilter: any;
  listResumenAll: any;
  dataResumenAll = new MatTableDataSource<any>(this.listResumenAll);
  dataPedidosAll = new MatTableDataSource<any>();
  listPedidoXRepartidor: any;

  dataPedidoPagadoTarjeta: any = [];
  pedidosXEstado: any;
  dataPedidoXTipoPago: any;

  // tablas
  displayedColumnsReparidores: string[] = ['repartidor', 'num_pedidos', 'importe', 'metodo'];
  displayedColumnsPagoTarjeta: string[] = ['cliente', 'tarjeta', 'importe'];
  displayedColumnsTopProducto: string[] = ['n', 'producto', 'seccion', 'precio', 'cantidad', 'importe'];
  displayedColumnsAllPedidos: string[] = ['n', 'pedido', 'cliente', 'repartidor', 'metodo_pago', 'importe'];

  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
  @ViewChild('paginatorPedido', {static: true}) paginatorPedido: MatPaginator;

  constructor(
    private comercioService: ComercioService
  ) { }

  ngOnInit(): void {

    this.loadData();

    this.dataResumenAll.paginator = this.paginator;

  }

  private loadData(): void {
    this.comercioService.loadDataCierreCaja()
    .subscribe((res: any) => {
      console.log(res);
      this.dataCierre = res.map((x: any, index: number) => {
          x.json_datos_delivery = JSON.parse(x.json_datos_delivery);
          x.n = index + 1;
          return x;
        });
      this.numTotalPedidos = this.dataCierre.length;

      // tabla todos los pedidos
      this.dataPedidosAll.data = this.dataCierre;
      this.dataPedidosAll.paginator = this.paginatorPedido;

      // crossfilter
      this.dataFilter = crossfilter(this.dataCierre);

      this.peditosXEstado();
      this.pedidoXTipoPago();
      this.pedidoXRepartidor();
      this.topProductos();
      this.tiempoAtencion();
    });
  }

  private tiempoAtencion() {
    const ddTiempoAtencion = this.dataFilter.dimension((x: any) => parseFloat(x.tiempo_atencion));
    const tiempoAtencion = ddTiempoAtencion.group().all();

    this.timepoPromedioEntrega = tiempoAtencion.map(x => x.key).reduce((a, b) => a + b, 0);
    this.timepoPromedioEntrega = Math.round(this.timepoPromedioEntrega / tiempoAtencion.length);

    tiempoAtencion.sort((a, b) => a.key - b.key);
    this.tiempoMinEntrega = tiempoAtencion[0].key;
    this.tiempoMaxEntrega = tiempoAtencion[tiempoAtencion.length - 1].key;

    console.log('tiempoAtencion', tiempoAtencion);
  }

  private topProductos() {
    this.listResumenAll = [];
    this.dataCierre.map((o: any) => {
      o.json_datos_delivery.p_body.tipoconsumo.map((c: TipoConsumoModel) => {
        c.secciones.map((s: SeccionModel) => {
          // const _secResumen = <SeccionModel>this.listResumenAll.filter((r: SeccionModel) => r.idseccion === s.idseccion)[0];
          // if ( !_secResumen ) {
          //   _secResumen = JSON.parse(JSON.stringify(s));
          //   _secResumen.items = [];
          //   this.listResumenAll.push(_secResumen);
          // }
          s.items.map(i => {
            let _itemResumen = this.listResumenAll.filter(ri => ri.iditem === i.iditem)[0];
            if ( _itemResumen ) {
              _itemResumen.cantidad_seleccionada += i.cantidad_seleccionada;
              _itemResumen.precio_total += i.precio_total;
            } else {
              _itemResumen = JSON.parse(JSON.stringify(i));
              // _secResumen.items.push(_itemResumen);
              this.listResumenAll.push(_itemResumen);
            }
          });
        });
      });
    });

    this.listResumenAll = this.listResumenAll
      .sort((a, b) => b.cantidad_seleccionada - a.cantidad_seleccionada)
      .map((x: any, index: number) => { x.n = index + 1; return x;  });
    console.log('listResumenAll', this.listResumenAll);


    // this.dataResumenAll = this.listResumenAll;
    this.dataResumenAll.data = this.listResumenAll;
    this.dataResumenAll.paginator = this.paginator;
  }

  private pedidoXRepartidor() {
    const ddPedidoXRepartidor = this.dataFilter.dimension((x: any) => x.idrepartidor);
    this.listPedidoXRepartidor = ddPedidoXRepartidor.group().reduce(

      // add
      (p: any, v: any, nf) => {
      if ( v.idrepartidor ) {
        p.count += 1;
        p.nom_repartidor = v.nom_repartidor + ' ' + v.ap_repartidor;
        p.calificacion = v.calificacion;
        p.telefono = v.telefono_repartidor;

        // metodo de pago
        const importeRow = v.total === '0' ? parseFloat(v.total_r) : parseFloat(v.total);
        this.arrMetodosPagoReparidor(v.json_datos_delivery.p_header.arrDatosDelivery.metodoPago, p.metodoPago, importeRow);
        p.importe += importeRow;
        return p;
      }
     },

     // remove
     (p: any, v: any, nf) => {
      if ( v.idrepartidor ) {
        p.count -= 1;
        p.nom_repartidor = v.nom_repartidor + ' ' + v.ap_repartidor;
        p.calificacion = v.calificacion;
        p.telefono = v.telefono_repartidor;

        // metodo de pago
        const importeRow = v.total === '0' ? parseFloat(v.total_r) : parseFloat(v.total);
        this.arrMetodosPagoReparidor(v.json_datos_delivery.p_header.arrDatosDelivery.metodoPago, p.metodoPago, importeRow);
        p.importe += importeRow;
        return p;
      }

     },
     // init
     () => {
       return { count: 0, nom_repartidor: '', telefono: '', importe: 0, calificacion: 0, metodoPago: []};
     }

   ).all();

   this.listPedidoXRepartidor = this.listPedidoXRepartidor.filter(x => x.value);
   console.log('listPedidoXRepartidor', this.listPedidoXRepartidor);

  //  console.log('dataPedidoPagadoTarjeta', this.dataPedidoPagadoTarjeta);
  }

  private arrMetodosPagoReparidor(row: any, _arrMetodo: any, importeRow: number) {
    // buscamos el metodo pago
    const _elMetodod = _arrMetodo.filter(r => r.idtipo_pago === row.idtipo_pago)[0];
    if ( _elMetodod ) {

      _elMetodod.num_pedidos += 1;
      _elMetodod.importe += importeRow;

    } else {
      row.num_pedidos = 1;
      row.importe = importeRow;
      _arrMetodo.push(row);
    }

  }

  private pedidoXTipoPago() {
    this.dataPedidoPagadoTarjeta = [];
    this.importeTotalEnCaja = 0;

    let ddPedidoXTipoPago;

    try {
      ddPedidoXTipoPago = this.dataFilter.dimension((x: any) => x?.metodoPagoRegistro[0].idtipo_pago);
    } catch (error) {
      return;
    }
    // const pedidoXTipoPago = ddPedidoXTipoPago.group().all();
    this.dataPedidoXTipoPago = ddPedidoXTipoPago.group().reduce(

      // add
      (p: any, v: any, nf) => {
      if ( v.metodoPagoRegistro ) {
        p.count += 1;
        p.importe += parseFloat(v.metodoPagoRegistro[0].importe);
        this.importeTotalEnCaja += parseFloat(v.metodoPagoRegistro[0].importe);
        p.descripcion = v.metodoPagoRegistro[0].descripcion;


        // si es pago con tarjeta le ponemos en el resumen de pago con tarjeta
        if ( v.metodoPagoRegistro[0].idtipo_pago === 4 ) { // tajeta aplicacion
          v.metodoPagoRegistro[0].nom_cliente = v.json_datos_delivery.p_header.arrDatosDelivery.nombre;
          v.metodoPagoRegistro[0].idpedido = v.idpedido;
          this.dataPedidoPagadoTarjeta.push(v.metodoPagoRegistro[0]);
        }

        return p;
      }
     },

     // remove
     (p: any, v: any, nf) => {
      if ( v.metodoPagoRegistro ) {
        p.count -= 1;
        p.importe -= parseFloat(v.metodoPagoRegistro[0].importe);
        this.importeTotalEnCaja -= parseFloat(v.metodoPagoRegistro[0].importe);
        p.descripcion = v.metodoPagoRegistro[0].descripcion;
        return p;
      }

     },
     // init
     () => {
       return { count: 0, descripcion: '', importe: 0};
     }

   ).all();

   this.dataPedidoXTipoPago = this.dataPedidoXTipoPago.filter(x => x.value);
   console.log('ddPedidoXTipoPago', this.dataPedidoXTipoPago);

   console.log('dataPedidoPagadoTarjeta', this.dataPedidoPagadoTarjeta);
  }

  private peditosXEstado() {
    const ddPedidoEstado = this.dataFilter.dimension((x: any) => x.pwa_estado);
    this.pedidosXEstado = ddPedidoEstado.group().reduce(

       // add
       (p: any, v: any, nf) => {
        p.count += 1;
        switch (v.pwa_estado) {
          case 'P':
            p.descripcion = 'PENDIENTE';
            break;
          case 'A':
            p.descripcion = 'ACEPTADO';
            break;
          case 'D':
            p.descripcion = 'LISTO';
            break;
          case 'R':
            p.descripcion = 'CON EL REPARTIDOR';
            break;
          case 'E':
            p.descripcion = 'ENTREGADO';
            break;
        }
        return p;
      },

      // remove
      (p: any, v: any, nf) => {
        p.count -= 1;
        switch (v.pwa_estado) {
          case 'P':
            p.descripcion = 'PENDIENTE';
            break;
          case 'A':
            p.descripcion = 'ACEPTADO';
            break;
          case 'D':
            p.descripcion = 'LISTO';
            break;
          case 'R':
            p.descripcion = 'CON EL REPARTIDOR';
            break;
          case 'E':
            p.descripcion = 'ENTREGADO';
            break;
        }
        return p;

      },
      // init
      () => {
        return { count: 0, descripcion: ''};
      }

    ).all();


    console.log('pedidosXEstado', this.pedidosXEstado);
  }

}
