import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-ordenes-en-mapa',
  templateUrl: './ordenes-en-mapa.component.html',
  styleUrls: ['./ordenes-en-mapa.component.css']
})
export class OrdenesEnMapaComponent implements OnInit {

  // botones del toolbar
  listBtnToolbar = [];
  constructor() { }

  ngOnInit(): void {

    this.listBtnToolbar.push({descripcion: 'Pendientes', checked: true, filtro: `'P', 'A'`});
    this.listBtnToolbar.push({descripcion: ' Listos ', checked: false, filtro: `'D'`});
    this.listBtnToolbar.push({descripcion: ' Entregados ', checked: false, filtro: `'R'` });
  }


  resumenOrdenesPendientes() {
  }

}
