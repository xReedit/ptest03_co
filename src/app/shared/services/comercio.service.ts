import { Injectable } from '@angular/core';
import { CrudHttpService } from './crud-http.service';
import { Observable } from 'rxjs/internal/Observable';
import { SedeInfoModel } from 'src/app/modelos/sede.info.model';

@Injectable({
  providedIn: 'root'
})
export class ComercioService {

  keyLocal = 'sys::s';
  sedeInfo: SedeInfoModel;

  constructor(
    private crudService: CrudHttpService
  ) { }

  // guardar datos de la sede
  setSedeInfo(_sedeInfo: any = null): void {
    _sedeInfo = _sedeInfo ? _sedeInfo : this.sedeInfo;
    this.sedeInfo = _sedeInfo;
    localStorage.setItem(this.keyLocal, btoa(JSON.stringify(_sedeInfo)));
  }

  getSedeInfo(): SedeInfoModel {
    const _sedeInfo = localStorage.getItem(this.keyLocal);
    this.sedeInfo = _sedeInfo ? JSON.parse(atob(_sedeInfo)) : new SedeInfoModel;
    return this.sedeInfo;
  }

  guardarEstadoOnline(_estado: number) {
    const _data = {
      estado: _estado
    };

    this.crudService.postFree(_data, 'comercio', 'set-online', true)
    .subscribe(res => console.log(res));
  }

  loadOrdenesPendientes(_filtro: string) {
    const _dataFiltro = { filtro: _filtro };
    // console.log(_dataFiltro);
    return new Observable(observer => {
    this.crudService.postFree(_dataFiltro, 'comercio', 'get-pedidos-pendientes')
      .subscribe((res: any) => {
        // console.log(res);
        observer.next(res.data);
      });
    });
  }

  loadOrdenenById(_idpedido: number) {
    return new Observable(observer => {
    const _dataSend = {idpedido: _idpedido};
    this.crudService.postFree(_dataSend, 'comercio', 'get-pedido-by-id')
      .subscribe((res: any) => {
        // console.log(res);
        const response = res.data[0];
        response.json_datos_delivery = JSON.parse(response.json_datos_delivery);
        observer.next(response);
      });
    });
  }

  // carga los datos de impresion
  loadDatosImpresion() {
      this.crudService.getAll('comercio', 'get-datos-impresion', false, false, true)
        .subscribe((res: any) => {
          this.getSedeInfo();
          this.sedeInfo.datos_impresion = res.data[0];
          this.setSedeInfo();
        });
  }

  // carga los datos de impresion
  loadDatosTipoPago() {
    this.crudService.getAll('comercio', 'get-tipo-pago', false, false, true)
      .subscribe((res: any) => {
        this.getSedeInfo();
        this.sedeInfo.datos_tipo_pago = res.data;
        this.setSedeInfo();
      });
  }

  // carga los repartidores del comercio
  loadRepartidoresComercio() {
    return new Observable(observer => {
    this.crudService.getAll('comercio', 'get-comercio-repartidor-suscrito', false, false, true)
      .subscribe((res: any) => {
        observer.next(res.data);
      });
    });
  }


  // load data cierre de caja
  loadDataCierreCaja() {
    return new Observable(observer => {
    this.crudService.getAll('comercio', 'get-data-cierre-caja', false, false, true)
      .subscribe((res: any) => {
        observer.next(res.data);
      });
    });
  }

}
