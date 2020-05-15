import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-dialog-add-repartidor',
  templateUrl: './dialog-add-repartidor.component.html',
  styleUrls: ['./dialog-add-repartidor.component.css']
})
export class DialogAddRepartidorComponent implements OnInit {
  repartidor: any;
  sufijo: string;
  constructor(
    @Inject(MAT_DIALOG_DATA) data: any,
    private dialogRef: MatDialogRef<DialogAddRepartidorComponent>,
  ) {

    this.repartidor = data.repartidor || {};
    this.sufijo = data.sufijo;

    if ( !data.repartidor ) {
      // this.repartidor.ciudad = data.ciudad;
    } else {
      this.repartidor.usuario = this.repartidor.usuario.replace(this.sufijo, '');
    }

  }

  ngOnInit(): void {
  }

  cerrarDlg(): void {
    this.repartidor.usuario = this.sufijo + this.repartidor.usuario;
    this.dialogRef.close(this.repartidor);
  }

}
