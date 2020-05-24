import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-dialog-desicion',
  templateUrl: './dialog-desicion.component.html',
  styleUrls: ['./dialog-desicion.component.css']
})
export class DialogDesicionComponent implements OnInit {
  msj = '';
  titleBtnCancel = 'No';
  titleBtnSuccess = 'Si, por favor';
  otroDato: '';
  constructor(
    @Inject(MAT_DIALOG_DATA) data: any,
  ) {
    const idMsj = data ? data.idMjs : 0;
    switch (idMsj) {
      case 0:
        this.msj = 'Desea que se le notifique cuando su pedido este listo?';
        break;
      case 1:
        this.msj = 'Desea saber cuando tenga descuentos y/o ofertas?';
        break;
      case 2:
        this.msj = 'Esta seguro de eliminar este registro?';
        break;
      case 3:
        const costoEntrega = data.costoEntrega;
        this.msj = `Deseo Solicitar un repartidor de Papaya Express para este pedido. Al confirmar no podra asignar este pedido a ningún otro repartidor.
                    Ademas el comercio asume el costo del servicio de entrega (S/. ${ parseFloat(costoEntrega).toFixed(2) }). Desea confirmar su solicitud?`;
        break;
    }
  }

  ngOnInit() {
  }

}
