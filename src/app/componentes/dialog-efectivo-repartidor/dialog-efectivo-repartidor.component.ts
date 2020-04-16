import { Component, OnInit } from '@angular/core';
import { NotificacionPushService } from 'src/app/shared/services/notificacion-push.service';
import { GpsUbicacionRepartidorService } from 'src/app/shared/services/gps-ubicacion-repartidor.service';
import { InfoTockenService } from 'src/app/shared/services/info-token.service';
import { RepartidorService } from 'src/app/shared/services/repartidor.service';
import { ListenStatusService } from 'src/app/shared/services/listen-status.service';
import { ComercioService } from 'src/app/shared/services/comercio.service';

@Component({
  selector: 'app-dialog-efectivo-repartidor',
  templateUrl: './dialog-efectivo-repartidor.component.html',
  styleUrls: ['./dialog-efectivo-repartidor.component.css']
})
export class DialogEfectivoRepartidorComponent implements OnInit {
  isOnNotificactionPush = false;

  importe = '';
  constructor(
    private pushNotificationService: NotificacionPushService,
    private comercioService: ComercioService
  ) { }

  ngOnInit() {
    this.isOnNotificactionPush = this.pushNotificationService.getIsTienePermiso();

  }

  listoOnline() {

    this.comercioService.guardarEstadoOnline(1);

  }

}
