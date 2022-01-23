import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-dialog-orden-detalle',
  templateUrl: './dialog-orden-detalle.component.html',
  styleUrls: ['./dialog-orden-detalle.component.css']
})
export class DialogOrdenDetalleComponent implements OnInit {
  laOrden: any;
  _isViewOnlyPedidoUrl: boolean;

  constructor(
    private dialogRef: MatDialogRef<DialogOrdenDetalleComponent>,
    @Inject(MAT_DIALOG_DATA) data: any,
  ) {
    this.laOrden = data.laOrden;
    this._isViewOnlyPedidoUrl = data.isViewOnlyPedidoUrl;
  }

  ngOnInit(): void {
  }

  cerrarDialog(val: boolean) {
    if ( val ) {
      this.dialogRef.close(this.laOrden);
    }
  }

}
