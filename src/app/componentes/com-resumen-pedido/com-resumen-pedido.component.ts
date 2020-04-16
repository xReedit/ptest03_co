import { Component, OnInit, Input } from '@angular/core';
import { PedidoModel } from 'src/app/modelos/pedido.model';

@Component({
  selector: 'app-com-resumen-pedido',
  templateUrl: './com-resumen-pedido.component.html',
  styleUrls: ['./com-resumen-pedido.component.css']
})
export class ComResumenPedidoComponent implements OnInit {
  @Input() elPedido: PedidoModel;
  @Input() elArrSubtTotales: any;
  @Input() showTitulo = false;
  constructor() { }

  ngOnInit(): void {

    //  console.log('elPedido', this.elPedido);
  }

}
