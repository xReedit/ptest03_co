export class SedeInfoModel {
    mesas: string;
    ciudad: string;
    nombre: string;
    eslogan: string;
    ip_print: string;
    num_copias: number;
    pie_pagina: string;
    pwa_time_limit: number;
    pie_pagina_comprobante: string;
    pwa_delivery_importe_min: number;
    var_size_font_tall_comanda: number;
    pwa_delivery_servicio_propio: number;
    pwa_comercio_afiliado: number; // 1 si el comercio esta afiliado
    facturacion_e_activo: number; // 1 si tiene facturacion electronica con el servicio
    direccion: string;
    ubigeo: string;
    sedeciudad: string;
    codigo_del_domicilio_fiscal: string;
    telefono: string;
    porcentaje_igv: string;
    is_exonerado_igv: number;
    authorization_api_comprobante: string;
    datos_impresion: any; // los datos de impresion / para facturacion electronica
    datos_tipo_pago: any;
    latitude: number;
    longitude: number;
    sufijo: string; // sufijo sede
}

