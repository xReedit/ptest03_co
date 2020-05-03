import { Component, OnInit, ViewChild, Input, Output, EventEmitter, OnDestroy, OnChanges, SimpleChanges } from '@angular/core';
import { GoogleMap, MapInfoWindow, MapMarker } from '@angular/google-maps';
import { CalcDistanciaService } from 'src/app/shared/services/calc-distancia.service';
import { ComercioService } from 'src/app/shared/services/comercio.service';
import { SedeInfoModel } from 'src/app/modelos/sede.info.model';
import { SocketService } from 'src/app/shared/services/socket.service';
import { takeUntil } from 'rxjs/internal/operators/takeUntil';
import { Subject } from 'rxjs/internal/Subject';
import { PedidoRepartidorModel } from 'src/app/modelos/pedido.repartidor.model';
import { ListenStatusService } from 'src/app/shared/services/listen-status.service';

@Component({
  selector: 'app-mapa-ordenes',
  templateUrl: './mapa-ordenes.component.html',
  styleUrls: ['./mapa-ordenes.component.css']
})
export class MapaOrdenesComponent implements OnInit, OnDestroy, OnChanges {
  @ViewChild(GoogleMap, { static: false }) map: GoogleMap;
  infowindow = new google.maps.InfoWindow();

  listRepartidores: any;
  // _listPedidos: any = [];


  @Input() listaPedidos!: any;
  @Input() listaRepartidoresRed!: any; // lista de repartidores que estan asociados con los pedidos

  @Output() pedidoOpen = new EventEmitter<any>(); // abre el pedido en el dialog


  zoom = 15;
  center: google.maps.LatLngLiteral;
  options: google.maps.MapOptions = {
    zoomControl: true,
    scrollwheel: true,
    disableDoubleClickZoom: true,
    // mapTypeId: 'hybrid'
  };

  markerOptionsRepartidor = {draggable: false, icon: './assets/images/delivery-man.png'};
  // markerOptionsPedido = {draggable: false, icon: './assets/images/marker-0.png'};

  markers = [];
  infoContent = '';

  markerComercio: any = {};
  markersPedidos = [];
  markersRepartidores: any = [];

  dataComercio: SedeInfoModel;

  isPropioRepartidores = false;

  private destroy$: Subject<boolean> = new Subject<boolean>();

  constructor(
    private calcCoordenadaService: CalcDistanciaService,
    private comercioService: ComercioService,
    private socketService: SocketService,
    private listenService: ListenStatusService
  ) { }

  ngOnInit(): void {

    this.comercioService.getSedeInfo();
    this.dataComercio = this.comercioService.sedeInfo;

    this.isPropioRepartidores = this.dataComercio.pwa_delivery_servicio_propio === 1;

    this.center = {
      lat: this.dataComercio.latitude,
      lng: this.dataComercio.longitude
    };

    // marker Comercio
    this.addMarkerComercio();

    if ( this.isPropioRepartidores ) {
      this.loadRepartidoresComercio();
    } else {
      // traer los repartidores que tengan pedidos activos de este comercio
    }

    this.listenSockets();
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

  ngOnChanges(changes: SimpleChanges) {
    if ( !this.listaPedidos ) {return; }
    // this.listaPedidos = this.listaPedidos;
    this.addMarkerPedidos();
    // console.log('cambios en listaPediods', this.listaPedidos);
    // console.log('cambios en listaRepartidoresRed', this.listaRepartidoresRed);
    // console.log('cambios en list', this.listaPedidos);
  }

  private addMarkerComercio(): void {
    this.markerComercio = {
      position: {
        lat: this.center.lat,
        lng: this.center.lng
      },
      label: {
        color: '#212121',
        fontWeight: '600',
        text: this.dataComercio.nombre
      },
      title: 'Comercio',
      info: this.dataComercio.nombre,
      options: {
        draggable: false,
        icon: `./assets/images/marker-4.png`
      }
    };

    // console.log('markerComercio', this.markerComercio);
  }

  private listenSockets(): void {


    this.socketService.onRepartidorNotificaUbicacion()
    .pipe(takeUntil(this.destroy$))
      .subscribe((data: any) => {
        // buscamos al repartidor
        const _elRepartidor = this.markersRepartidores.filter(r => r.idrepartidor === data.idrepartidor)[0];
        const _positionActual: google.maps.LatLngLiteral = {
          lat: data.coordenadas.latitude,
          lng: data.coordenadas.longitude
        };
        _elRepartidor.position = _positionActual;
      });

    // pedido nuevo
    this.listenService.notificaPedidoNuevo$
    .pipe(takeUntil(this.destroy$))
    .subscribe((getOrden: any) => {
      if ( !getOrden ) {return; }
        // console.log('nuevo pedido listen service', getOrden);
        // this.listaPedidos.push(getOrden);
        this.addMarkerPedidos();
    });

    // pedido modificado // se asigno repartidor
    this.listenService.pedidoModificado$
      .pipe(takeUntil(this.destroy$))
      .subscribe((pedido: any) => {

        if ( !pedido ) {return; }

        // console.log('Cambiamos icono');

        // buscar pedido en los marcadores
        // const p = this.markersPedidos.filter(_p => _p.idpedido === pedido.idpedido)[0];
        const p = this.buscarPedidoEnMarcadores(pedido.idpedido);
        const iconMarker = pedido.idrepartidor ? 'marker-1.png' : 'marker-0.png';
        let _options: google.maps.MarkerOptions = {
          animation: pedido.idrepartidor ? google.maps.Animation.DROP : google.maps.Animation.BOUNCE,
          draggable: false,
          icon: `./assets/images/${iconMarker}`
        };

        // fin del pedido onRepartidorNotificaFinPedido
        if ( pedido.pwa_delivery_status && pedido.pwa_delivery_status.toString() === '4' ) {
          _options = {
            animation: 0,
            draggable: false,
            icon: `./assets/images/marker-3.png`
          };
        }

        p.options = _options;

      });
  }


  private loadRepartidoresComercio(): void {
    this.comercioService.loadRepartidoresComercio()
      .subscribe(res => {
        // console.log(res);
        this.listRepartidores = res;
        this.addMarkerRepartidor();
      });
  }

  // repartidores de la red que estan asignados a los pedidos

  private addMarkerRepartidor(): void {
    this.markersRepartidores = [];
    this.listRepartidores.map((r: any) => {
      this.markersRepartidores.push({
        visible: r.visible ? r.visible : true, // si no son repartidores propios y si el pedido esta finalizado no muestra
        idrepartidor: r.idrepartidor,
        position: {
          lat: r.position_now.latitude,
          lng: r.position_now.longitude
        },
        label: {
          // color: 'red',
          fontWeight: '600',
          text: r.nombre
        },
        title: 'Repartidor',
        info: r.nombre + ' ' + r.apellido,
        options: {
          animation: 0
        }
      });
    });
  }

  openInfo(marker: MapMarker, info) {
    this.infowindow.setContent('<p>' + info.title + '</p>' + info.info);
    this.infowindow.open(this.map._googleMap, marker._marker);
  }

  private buscarPedidoEnMarcadores(idpedido: number): any {
    return this.markersPedidos.filter(_p => _p.idpedido === idpedido)[0];
  }

  // ordenes o pedidos
  private addMarkerPedidos(): void {
    if ( !this.dataComercio ) {
      this.comercioService.getSedeInfo();
    this.dataComercio = this.comercioService.sedeInfo;
    }

    const isGetRepartidoresFromPedidos = this.dataComercio.pwa_delivery_servicio_propio === 0;
    this.listaRepartidoresRed = [];
    let rowAddRepartidor: any = {};


    this.markersPedidos = [];
    this.listaPedidos.map((p: any, i: number) => {

      const dataDelivery = p.json_datos_delivery.p_header.arrDatosDelivery; // .direccionEnvioSelected
      let iconMarker = p.idrepartidor ? 'marker-1.png' : 'marker-0.png';
      let tituloText = 'Pedido ' + p.idpedido;
      if ( p.pwa_delivery_status.toString()  === '4' ) {
        iconMarker = 'marker-3.png';
        tituloText = p.idpedido.toString();
      }

      this.markersPedidos.push({
        idpedido: p.idpedido,
        position: {
          lat: dataDelivery.direccionEnvioSelected.latitude,
          lng: dataDelivery.direccionEnvioSelected.longitude
        },
        label: {
          color: '#0d47a1',
          fontWeight: '600',
          text: tituloText
        },
        title: 'Pedido',
        info: p.idpedido,
        options: {
          animation: p.idrepartidor ? 0 : google.maps.Animation.BOUNCE,
          draggable: false,
          icon: `./assets/images/${iconMarker}`
        }
      });

      if ( isGetRepartidoresFromPedidos && p.pwa_delivery_status !== '4' && p.idrepartidor) {
        rowAddRepartidor = {
          idrepartidor: p.idrepartidor,
          idpedido: p.idpedido,
          nombre: p.nom_repartidor,
          apellido: p.ap_repartidor,
          position_now: p.position_now_repartidor
        };

        this.listaRepartidoresRed.push(rowAddRepartidor);
      }

      // this.markerOptionsPedido.icon = `./assets/images/${iconMarker}`;
    });

    if ( isGetRepartidoresFromPedidos ) {
      this.listRepartidores = this.listaRepartidoresRed;
      this.addMarkerRepartidor(); }
  }

  openPedido(index: number): void {
    const itemPedido = this.listaPedidos[index];
    this.pedidoOpen.emit(itemPedido);
  }
















  // directionMap() {

  //   // const directionsRenderer = new google.maps.DirectionsRenderer({suppressMarkers: true});
  //   const directionsService = new google.maps.DirectionsService();

  //   // const directionsService = new google.maps.DirectionsService;
  //   // const directionsRenderer = new google.maps.DirectionsRenderer;

  //   const rendererOptions = {
  //     preserveViewport: false,
  //     suppressMarkers: true
  //   };

  //   const waypoints = [];
  //   this.markers.map(m => {
  //     waypoints.push({
  //       location: m.position,
  //       stopover: true
  //   });
  //   });

  //   const request = {
  //     origin: this.center,
  //     destination: this.markers[this.markers.length - 1].position,
  //     waypoints: waypoints, // an array of waypoints
  //     optimizeWaypoints: true,
  //     travelMode: google.maps.TravelMode.DRIVING,
  //     // unitSystem: google.maps.UnitSystem.IMPERIAL,
  //     // durationInTraffic: false,
  //     avoidHighways: true,
  //     avoidTolls: true
  //    };


  //    const directionsDisplay = new google.maps.DirectionsRenderer(rendererOptions);
  //    directionsDisplay.setMap(this.map._googleMap);

  //   //  const dmatrix = new google.maps.DistanceMatrixService();

  //    directionsService.route(request, function(result, status) {
  //     console.log(result);

  //     if (status === google.maps.DirectionsStatus.OK) {
  //       directionsDisplay.setDirections(result);
  //       }
  //    });
  // }



  // addMarker() {
  //   this.markers.push({
  //     position: {
  //       lat: this.center.lat + ((Math.random() - 0.5) * 2) / 120,
  //       lng: this.center.lng + ((Math.random() - 0.5) * 2) / 120
  //     },
  //     label: {
  //       color: 'red',
  //       text: 'Marker label ' + (this.markers.length + 1)
  //     },
  //     title: 'Marker title ' + (this.markers.length + 1),
  //     info: 'Marker info ' + (this.markers.length + 1),
  //     options: {
  //       animation: google.maps.Animation.BOUNCE
  //     }
  //   });
  // }

  // private orderPointsMarkert() {
  //   console.log('antes de ordenar ', this.markers);
  //   // let positionAnterior = {};
  //   this.markers = this.markers.map((m, i) => {
  //     // const origin = i === 0 ? this.center : positionAnterior;
  //     m.distancia =  parseInt(this.calcCoordenadaService.calcDistanciaDosPunto(this.center, m.position).toString(), 0);
  //     // positionAnterior = m.position;
  //     return m;
  //   }).sort((a, b) => a.distancia - b.distancia);

  //   console.log('--- despues de ordenar ', this.markers);
  //   // console.log('--- despues de ordenar aaa', aaa);
  // }

}
