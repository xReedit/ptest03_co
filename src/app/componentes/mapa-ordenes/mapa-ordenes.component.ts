import { Component, OnInit, ViewChild, Input, Output, EventEmitter } from '@angular/core';
import { GoogleMap, MapInfoWindow, MapMarker } from '@angular/google-maps';
import { CalcDistanciaService } from 'src/app/shared/services/calc-distancia.service';
import { ComercioService } from 'src/app/shared/services/comercio.service';
import { SedeInfoModel } from 'src/app/modelos/sede.info.model';

@Component({
  selector: 'app-mapa-ordenes',
  templateUrl: './mapa-ordenes.component.html',
  styleUrls: ['./mapa-ordenes.component.css']
})
export class MapaOrdenesComponent implements OnInit {
  @ViewChild(GoogleMap, { static: false }) map: GoogleMap;
  infowindow = new google.maps.InfoWindow();

  listRepartidores: any;
  listPedidos: any;

  @Input()
  public set listaPedidos(list: any) {
    this.listPedidos = list;
    console.log('listPedidos', list);
    if ( list ) {
      this.addMarkerPedidos();
    }
  }

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
  markerOptionsPedido = {draggable: false, icon: './assets/images/marker-0.png'};

  markers = [];
  infoContent = '';

  markersPedidos = [];
  markersRepartidores = [];

  dataComercio: SedeInfoModel;

  isPropioRepartidores = false;


  constructor(
    private calcCoordenadaService: CalcDistanciaService,
    private comercioService: ComercioService
  ) { }

  ngOnInit(): void {

    this.comercioService.getSedeInfo();
    this.dataComercio = this.comercioService.sedeInfo;

    this.isPropioRepartidores = this.dataComercio.pwa_delivery_servicio_propio === 1;

    this.center = {
      lat: this.dataComercio.latitude,
      lng: this.dataComercio.longitude
    };

    if ( this.isPropioRepartidores ) {
      this.loadRepartidoresComercio();
    }
  }

  private loadRepartidoresComercio(): void {
    this.comercioService.loadRepartidoresComercio()
      .subscribe(res => {
        console.log(res);
        this.listRepartidores = res;
        this.addMarkerRepartidor();
      });
  }

  private addMarkerRepartidor(): void {
    this.listRepartidores.map((r: any) => {
      this.markersRepartidores.push({
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
          animation: google.maps.Animation.BOUNCE
        }
      });
    });
  }

  openInfo(marker: MapMarker, info) {
    this.infowindow.setContent('<p>' + info.title + '</p>' + info.info);
    this.infowindow.open(this.map._googleMap, marker._marker);
  }


  // ordenes o pedidos

  private addMarkerPedidos(): void {
    this.markersPedidos = [];
    this.listPedidos.map((p: any, i: number) => {
      const dataDelivery = p.json_datos_delivery.p_header.arrDatosDelivery; // .direccionEnvioSelected
      const iconMarker = p.idrepartidor ? 'marker-1.png' : 'marker-0.png';
      this.markersPedidos.push({
        position: {
          lat: dataDelivery.direccionEnvioSelected.latitude,
          lng: dataDelivery.direccionEnvioSelected.longitude
        },
        label: {
          color: '#0d47a1',
          fontWeight: '600',
          text: 'Pedido ' + (i + 1)
        },
        title: 'Pedido',
        info: p.idpedido,
        options: {
          animation: google.maps.Animation.BOUNCE
        }
      });

      this.markerOptionsPedido.icon = `./assets/images/${iconMarker}`;
    });
  }

  openPedido(index: number): void {
    const itemPedido = this.listPedidos[index];
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
