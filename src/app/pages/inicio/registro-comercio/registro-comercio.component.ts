import { Component, OnInit } from '@angular/core';
import { CrudHttpService } from 'src/app/shared/services/crud-http.service';

@Component({
  selector: 'app-registro-comercio',
  templateUrl: './registro-comercio.component.html',
  styleUrls: ['./registro-comercio.component.css']
})
export class RegistroComercioComponent implements OnInit {

  comercio: any = {};
  loader = false;
  showRegisterSuccces = false;

  listFormaEntrega = [{'descripcion': 'Delivery', 'id': 1}, {'descripcion': 'Recojo en local', 'id': 2}];
  listCategoria: any;
  listSubCategoria: any;
  listDepartamento = [
    {'id': '22', 'name': 'San Martín'},
    {
      'id': '01',
      'name': 'Amazonas'
    },
    {
      'id': '06',
      'name': 'Cajamarca'
    },
    {
      'id': '16',
      'name': 'Loreto'
    }
  ];
  listProvincia = [{
    'id': '2201',
    'name': 'Moyobamba',
    'department_id': '22'
  },
  {
    'id': '2208',
    'name': 'Rioja ',
    'department_id': '22'
  }, {
    'id': '2209',
    'name': 'Tarapoto',
    'department_id': '22'
  }, {
    'id': '2209',
    'name': 'Morales',
    'department_id': '22'
  }, {
    'id': '2209',
    'name': 'Banda del Shilcayo',
    'department_id': '22'
  }, {
    'id': '2209',
    'name': 'Nueva Cajamarca',
    'department_id': '22'
  }, {
    'id': '010101',
    'name': 'Chachapoyas',
    'department_id': '01'
  }, {
    'id': '010201',
    'name': 'Bagua',
    'department_id': '01'
  }, {
    'id': '010701',
    'name': 'Bagua Grande',
    'department_id': '01'
  }, {
    'id': '010101',
    'name': 'Jaen',
    'department_id': '06'
  }, {
    'id': '160601',
    'name': 'Contamana',
    'department_id': '16'
  }, {
    'id': '160201',
    'name': 'Yurimaguas',
    'department_id': '16'
  }
];

  _listProvincia: any;

  constructor(
    private crudService: CrudHttpService
  ) { }

  ngOnInit(): void {
    console.log('aaa');
    this.crudService.getAll('comercio', 'get-categoria-registro', false, false, false)
      .subscribe((res: any) => {
        this.listCategoria = res.data[0].rpt;
      });
  }

  getSubItem($event: any) {
    this.listSubCategoria = this.listCategoria.filter(c => c.id === $event.value.id)[0]?.items;
  }

  getCiudades($event: any) {
    this._listProvincia = this.listProvincia.filter(p => p.department_id === $event.value.id);
  }

  registrarComercio() {
    this.loader = true;


    this.crudService.postFree({comercio: this.comercio}, 'comercio', 'registro-solicitud-comercio', false)
      .subscribe((response) => {
        // console.log(response);
      });

      setTimeout(() => {
        this.loader = true;
        this.showRegisterSuccces = true;
      }, 1500);
  }

}
