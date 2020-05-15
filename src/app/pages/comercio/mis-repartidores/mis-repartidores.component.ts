import { Component, OnInit } from '@angular/core';
import { CrudHttpService } from 'src/app/shared/services/crud-http.service';
import { MatTableDataSource } from '@angular/material/table';
import { DialogAddRepartidorComponent } from 'src/app/componentes/dialog-add-repartidor/dialog-add-repartidor.component';
import { MatDialogConfig, MatDialog } from '@angular/material/dialog';
import { EstablecimientoService } from 'src/app/shared/services/establecimiento.service';
import { ComercioService } from 'src/app/shared/services/comercio.service';
import { InfoTockenService } from 'src/app/shared/services/info-token.service';

@Component({
  selector: 'app-mis-repartidores',
  templateUrl: './mis-repartidores.component.html',
  styleUrls: ['./mis-repartidores.component.css']
})
export class MisRepartidoresComponent implements OnInit {
  listRepartidores = new MatTableDataSource<any>();
  displayedColumnsReparidores: string[] = ['n', 'nombre', 'dni', 'telefono', 'ciudad', 'f_registro', 'usuario', 'op'];

  repartidorSelect: any;
  constructor(
    private crudService: CrudHttpService,
    private dialog: MatDialog,
    private comercioService: ComercioService,
    private infoTokenService: InfoTockenService
  ) { }

  ngOnInit(): void {
    this.loadRepartidores();
    console.log( 'comercioService', this.comercioService.getSedeInfo());
  }

  private loadRepartidores(): void {
    this.crudService.getAll('comercio', 'get-mis-repartidores', false, false, true)
    .subscribe((res: any) => {
      console.log(res);
      this.listRepartidores.data = res.data;
    });
  }

  openDialogRepartidor(elRepartidor: any = null) {

    const _dialogConfig = new MatDialogConfig();
    _dialogConfig.disableClose = false;
    _dialogConfig.hasBackdrop = true;
    _dialogConfig.width = '400px';
    _dialogConfig.panelClass = ['my-dialog-orden-detalle', 'my-dialog-scrool'];
    _dialogConfig.data = {
      repartidor: elRepartidor,
      ciudad: this.comercioService.sedeInfo.ciudad,
      sufijo: this.comercioService.sedeInfo.sufijo
    };

    const dialogRef = this.dialog.open(DialogAddRepartidorComponent, _dialogConfig);

    dialogRef.afterClosed().subscribe((result: any) => {
      if ( result !== false ) {
        result.idsede = this.infoTokenService.infoUsToken.usuario.idsede;
        // guarda o modifica repartidor
        const dataReparitdor = {
          repartidor: result
        };

        this.crudService.postFree(dataReparitdor, 'comercio', 'set-registrar-repartidor', true)
        .subscribe(res => {

          if ( !result.idrepartidor ) {
            this.loadRepartidores();
          }
        });
      }
    });

  }

}
