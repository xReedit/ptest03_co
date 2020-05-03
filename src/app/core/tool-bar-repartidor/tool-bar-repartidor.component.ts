import { Component, OnInit, Output, EventEmitter } from '@angular/core';
// import { MatDialogConfig, MatDialog } from '@angular/material/dialog';
import { InfoTockenService } from 'src/app/shared/services/info-token.service';
import { ComercioService } from 'src/app/shared/services/comercio.service';
// import { SocketService } from 'src/app/shared/services/socket.service';

@Component({
  selector: 'app-tool-bar-repartidor',
  templateUrl: './tool-bar-repartidor.component.html',
  styleUrls: ['./tool-bar-repartidor.component.css']
})
export class ToolBarRepartidorComponent implements OnInit {
  @Output() public changeTogle = new EventEmitter<boolean>(false);
  @Output() public openMenuLateral = new EventEmitter<boolean>(false);

  isTogleActive = true;
  dataSede: any;
  constructor(
    private infoTokenService: InfoTockenService,
    private comercioService: ComercioService
    // private socketService: SocketService
  ) { }

  ngOnInit() {
    // console.log('toll');
    // setTimeout(() => {
      this.dataSede = this.comercioService.getSedeInfo();
      this.infoTokenService.infoUsToken.isOnline = true;
    // }, 1500);

    // console.log('this.dataSede', this.dataSede);

    // this.isTogleActive = this.infoTokenService.infoUsToken.isOnline;
    // this.changeTogle.emit(this.isTogleActive);
    // if ( this.isTogleActive ) {
    //   this.socketService.connect();
    // }
  }

  repartidorOnLine($event: any) {
    this.isTogleActive = $event.checked;
    this.infoTokenService.setisOnline(this.isTogleActive);
    this.changeTogle.emit(this.isTogleActive);
  }

  abrirMenuLateral() {
    // console.log('this.openMenuLateral', true);
    this.openMenuLateral.emit(true);
  }

  // repartidorOnLine() {
  //   const _dialogConfig = new MatDialogConfig();
  //   _dialogConfig.disableClose = true;
  //   _dialogConfig.hasBackdrop = true;

  //   const dialogReset = this.dialog.open(DialogEfectivoRepartidorComponent, _dialogConfig);
  // }

}
