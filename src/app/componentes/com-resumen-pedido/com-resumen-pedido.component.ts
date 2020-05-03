import { Component, OnInit, Input } from '@angular/core';
import { PedidoModel } from 'src/app/modelos/pedido.model';
import { MatDialogConfig, MatDialog } from '@angular/material/dialog';
import { DialogImgItemComponent } from '../dialog-img-item/dialog-img-item.component';

@Component({
  selector: 'app-com-resumen-pedido',
  templateUrl: './com-resumen-pedido.component.html',
  styleUrls: ['./com-resumen-pedido.component.css']
})
export class ComResumenPedidoComponent implements OnInit {
  @Input() elPedido: PedidoModel;
  @Input() elArrSubtTotales: any;
  @Input() showTitulo = false;
  constructor(
    private dialog: MatDialog,
  ) { }

  ngOnInit(): void {

    //  console.log('elPedido', this.elPedido);
  }


  showImg(item: any) {
    if ( !item.img || item.img === '') {return; }

    const _dialogConfig = new MatDialogConfig();
    _dialogConfig.disableClose = true;
    _dialogConfig.hasBackdrop = true;
    _dialogConfig.data = {
      item: item
    };

    this.dialog.open(DialogImgItemComponent, _dialogConfig);
  }

}
