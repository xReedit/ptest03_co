import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatDialogConfig, MatDialog } from '@angular/material/dialog';
import { DialogEfectivoRepartidorComponent } from 'src/app/componentes/dialog-efectivo-repartidor/dialog-efectivo-repartidor.component';
import { SocketService } from 'src/app/shared/services/socket.service';
import { Subject } from 'rxjs/internal/Subject';
import { takeUntil } from 'rxjs/internal/operators/takeUntil';
import { ComercioService } from 'src/app/shared/services/comercio.service';
import { Router } from '@angular/router';
import { InfoTockenService } from 'src/app/shared/services/info-token.service';
import { CrudHttpService } from 'src/app/shared/services/crud-http.service';
import { NotificacionPushService } from 'src/app/shared/services/notificacion-push.service';

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
    private comercioService: ComercioService,
    private router: Router,
    private infoTokenService: InfoTockenService,
    private crudService: CrudHttpService,
    private pushNotificationService: NotificacionPushService
  ) { }

  ngOnInit(): void {
    this.socketService.connect();
    this.listenDatosSede();

    // al entrar manda online al ingresar automaticamente
    this.comercioService.guardarEstadoOnline(1);

    this.pushNotificationService.getIsTienePermiso();

    setTimeout(() => {
      // this.isOnGeoPosition = this.geoPositionService.getGeoPosition().hasPermition;
      // console.log('notificacion');
      this.pushNotificationService.suscribirse();
    }, 1500);

    // listen close page
    // window.onbeforeunload = function() {
    //   alert('Al cerrar dejara de recibir pedidos.');
    // };

    // window.addEventListener('beforeunload', function (e) {
    //   const confirmationMessage = 'Al cerrar dejara de recibir pedidos.';

    //   (e || window.event).returnValue = confirmationMessage;
    //   return confirmationMessage;
    // });
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

  comercioOnLine(value: boolean) {
    if ( !value ) { this.comercioService.guardarEstadoOnline(0); return; }
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
      // console.log('datos sede', res);

      this.comercioService.loadDatosImpresion();
      this.comercioService.loadDatosTipoPago();
    });
  }


  openServidorPrint() {
    console.log('aa');
    const _xdataOrg = {o: this.infoTokenService.infoUsToken.usuario.idorg, s: this.infoTokenService.infoUsToken.usuario.idsede };
    const _xr = btoa(JSON.stringify(_xdataOrg));
    const versionPrintServer = 'print-server';
    const _urlPrintServver = 'http://appx.papaya.com.pe/' + versionPrintServer + '/print-server.html?o=' + _xr;
    window.open(_urlPrintServver, 'Servidor de Impresion'); // produccion
  }

  cerrarSession() {
    this.comercioService.guardarEstadoOnline(0);
    this.socketService.closeConnection();
    this.router.navigate(['../']);
  }




}
