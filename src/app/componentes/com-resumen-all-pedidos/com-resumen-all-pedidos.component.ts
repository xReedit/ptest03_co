import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-com-resumen-all-pedidos',
  templateUrl: './com-resumen-all-pedidos.component.html',
  styleUrls: ['./com-resumen-all-pedidos.component.css']
})
export class ComResumenAllPedidosComponent implements OnInit {
  @Input() listResumen: any;
  constructor() { }

  ngOnInit(): void {
  }

}
