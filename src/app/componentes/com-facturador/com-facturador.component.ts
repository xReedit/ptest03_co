import { Component, OnInit, Input, Output, EventEmitter} from '@angular/core';
import { CrudHttpService } from 'src/app/shared/services/crud-http.service';
import { FacturacionElectronicaService } from 'src/app/shared/services/facturacion-electronica.service';

@Component({
  selector: 'app-com-facturador',
  templateUrl: './com-facturador.component.html',
  styleUrls: ['./com-facturador.component.css']
})
export class ComFacturadorComponent implements OnInit {
  msj_error = '';
  datosConsulta: any = {
    num_doc: '00000000',
    nombres: '',
    direccion: '',
    idcliente: ''
  };

  loadConsulta = false;
  isvalid = true;
  isTieneCliente = false;
  isValidAll = false;

  listTipoComprobante: any;
  comprobanteSelected: any;

  nomServicio: string;
  num_documento: string;
  private isValidarCompIni = false;

  private isConrolVisible = true; // si el control es visible despues de validar // o imprime de frente
  @Output() isShowControl = new EventEmitter<boolean>(false);
  @Input() orden: any;
  // @Input() validarDatos: boolean; // valida datos enviados si son correctos envia de frente si no abre las opciones
  // valida datos enviados si son correctos envia de frente si no abre las opciones
  @Input()
  public set validarDatos(val: boolean) {
    console.log('validarDatos', val);
    if ( val ) {
      this.validarDatosCliente();
    }
  }

  constructor(
    private crudService: CrudHttpService,
    private facturacionService: FacturacionElectronicaService,
  ) { }

  ngOnInit(): void {
    this.loadTipoComprobantes();
  }

  // ngOnChanges(changes: SimpleChanges) {
  //   console.log('validarDatos changes', changes);
  //   // console.log('validarDatos', changes);
  //   // if ( changes.validarDatos ) {
  //   //   this.validarDatosCliente();
  //   // }
  // }

  private validarDatosCliente() {
    const _dataClienteComprobante = this.orden.json_datos_delivery.p_header.arrDatosDelivery.tipoComprobante;
    this.num_documento = _dataClienteComprobante.dni ? _dataClienteComprobante.dni : '';
    this.datosConsulta.num_doc = this.num_documento;
    this.comprobanteSelected = this.listTipoComprobante.filter((x: any) => x.descripcion.toLowerCase() === _dataClienteComprobante.descripcion.toLowerCase())[0];

    if ( _dataClienteComprobante?.otro_dato ) {
      this.isConrolVisible = true;
      this.isShowControl.emit(this.isConrolVisible);
      return;
    }

    this.verificarDocumento(this.num_documento);
    if ( this.isValidAll ) {
      this.isvalid = true;
      this.isValidarCompIni = true;

      if ( this.num_documento === '' ) {
        this.datosConsulta.nombres = '';
        this.isConrolVisible = false;
        this.isValidarCompIni = false;
        this.isShowControl.emit(this.isConrolVisible);
        this.emitirFacturar();
      } else {
        this.buscarDNI(this.num_documento);
      }
      // emitir comprobante
      // this.emitirFacturar();
      // this.isConrolVisible = false;
    } else {
      this.isConrolVisible = true;
      this.isShowControl.emit(this.isConrolVisible);
    }

  }

  private loadTipoComprobantes(): void {
    this.facturacionService.getTipoComprobantes()
      .subscribe(res => {
        this.listTipoComprobante = res;
      });
  }

  selectComprobante($event: any) {
    this.comprobanteSelected = this.listTipoComprobante[$event.value];
    if ( this.comprobanteSelected.requiere_cliente === 1 ) {
      this.verificarDocumento(this.num_documento);
      return;
    }
    this.msj_error = '';
    this.comprobarRequeridos();
  }

  buscarDNI(value: string) {

    this.isTieneCliente = false;

    if ( !this.isvalid ) {
      this.msj_error = 'Documento no valido';
      return;
    }

    this.loadConsulta = true;

    const dataSend = {
      documento: value,
      servicio: this.nomServicio,
    };

    this.crudService.postFree(dataSend, 'consulta', 'dni-ruc', true)
      .subscribe((res: any) => {
        this.datosConsulta = res.data;
        // console.log(this.datosConsulta);
        this.loadConsulta = false;
        this.isTieneCliente = this.datosConsulta.nombres !== '';
        this.comprobarRequeridos();

        if ( this.isValidarCompIni ) {
          this.isConrolVisible = false;
          this.isValidarCompIni = false;
          this.isShowControl.emit(this.isConrolVisible);
          this.emitirFacturar();
        }
      });
  }

  verificarDocumento(value: string): void {

    // validar
    const numLength = value.toString().length;
    this.isvalid = true;
    this.nomServicio =  numLength <= 8 ? 'dni' : 'RUC';
    this.isvalid =  numLength < 8 ? false : numLength === 8 ? true : numLength < 11 ? false : numLength === 11 ? true : false;

    this.isvalid = this.comprobanteSelected.inicial === 'F' && this.nomServicio === 'dni' ? false : this.isvalid;

    if ( !this.isvalid ) {
      this.msj_error = 'Documento no valido';
      // return;
    } else {
      this.msj_error = '';
    }

    this.isTieneCliente = this.datosConsulta?.nombres && this.isvalid;
    this.comprobarRequeridos();
  }

  private comprobarRequeridos() {
    const isRequeridoCliente = this.comprobanteSelected.requiere_cliente === 1;
    this.isValidAll = isRequeridoCliente && this.isTieneCliente ? true : isRequeridoCliente && !this.isTieneCliente ? false : !isRequeridoCliente && !this.isTieneCliente ? true : true;
  }

  emitirFacturar() {
    const json_datos_delivery = this.orden.json_datos_delivery;
    const items = this.facturacionService.xCargarDatosAEstructuraImpresion(json_datos_delivery.p_body, json_datos_delivery.p_subtotales);

    this.datosConsulta.num_doc = this.datosConsulta.num_doc ? this.datosConsulta.num_doc : this.num_documento;
    console.log('items facturacion', items);


    // si el cliente es nuevo lo guarda
    if ( this.datosConsulta.idcliente === '' &&  this.datosConsulta.num_doc !== '' ) {
      this.facturacionService.guardarClienteNuevo(this.datosConsulta)
        .subscribe(res => {
          this.datosConsulta.idcliente = res[0].idcliente;
          this.facturacionService.cocinarFactura(this.orden.idpedido, items, json_datos_delivery.p_subtotales, this.comprobanteSelected, this.datosConsulta);
        });
    } else {
      this.facturacionService.cocinarFactura(this.orden.idpedido, items, json_datos_delivery.p_subtotales, this.comprobanteSelected, this.datosConsulta);
    }

    this.orden.pwa_facturado = 1;

  }

  atras() {
    this.isShowControl.emit(false);
  }


}
