import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatDialogConfig, MatDialog } from '@angular/material/dialog';
import { DialogEfectivoRepartidorComponent } from 'src/app/componentes/dialog-efectivo-repartidor/dialog-efectivo-repartidor.component';
import { SocketService } from 'src/app/shared/services/socket.service';
import { Subject } from 'rxjs/internal/Subject';
import { takeUntil } from 'rxjs/internal/operators/takeUntil';
import { ComercioService } from 'src/app/shared/services/comercio.service';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class MainComponent implements OnInit, OnDestroy {
  private destroy$: Subject<boolean> = new Subject<boolean>();
  showPanelLeft = false;

  constructor(
    private dialog: MatDialog,
    private socketService: SocketService,
    private comercioService: ComercioService
  ) { }

  ngOnInit(): void {
    this.socketService.connect();
    this.listenDatosSede();
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

  comercioOnLine(value: boolean) {
    if ( !value ) {return; }
    const _dialogConfig = new MatDialogConfig();
    _dialogConfig.disableClose = true;
    _dialogConfig.hasBackdrop = true;

    this.dialog.open(DialogEfectivoRepartidorComponent, _dialogConfig);
  }

  private listenDatosSede(): void {
    this.socketService.onGetDatosSede()
    .pipe(takeUntil(this.destroy$))
    .subscribe(res => {
      this.comercioService.setSedeInfo(res[0].datossede[0]);
      console.log('datos sede', res);

      this.comercioService.loadDatosImpresion();
      this.comercioService.loadDatosTipoPago();
    });
  }

}
