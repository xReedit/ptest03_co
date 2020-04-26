import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-com-resumen-all-pedidos',
  templateUrl: './com-resumen-all-pedidos.component.html',
  styleUrls: ['./com-resumen-all-pedidos.component.css']
})
export class ComResumenAllPedidosComponent implements OnInit {
  _listResumen: any;
  @Input()
  set listResumen(val: any) {
    if ( val ) {
      this._listResumen = val;
      this.getTotal();
    }
  }

  sumaTotal = 0;
  constructor() {
  }

  ngOnInit(): void {
  }

  private getTotal(): void {
    this.sumaTotal = 0;
    this._listResumen.map(s => {
      this.sumaTotal += s.items.map(i => i.precio_total).reduce((a, b) => a + b , 0);
    });
  }



}
