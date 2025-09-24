import apiClient from './apiClient';

// Servicio para gestionar lotes y alertas usando axios y baseURL por entorno
export const loteService = {
  // Obtener lotes por producto
  async obtenerLotesPorProducto(idProducto) {
    const { data } = await apiClient.get(`/lotes/producto/${idProducto}`);
    return data;
  },

  // Obtener lotes próximos a vencer
  async obtenerLotesProximosAVencer() {
    const { data } = await apiClient.get('/lotes/proximos-vencer');
    return data;
  },

  // Obtener lotes vencidos
  async obtenerLotesVencidos() {
    const { data } = await apiClient.get('/lotes/vencidos');
    return data;
  },

  // Obtener stock total de un producto
  async obtenerStockTotalPorProducto(idProducto) {
    const { data } = await apiClient.get(`/lotes/producto/${idProducto}/stock`);
    return data;
  },

  // Obtener resumen de alertas
  async obtenerResumenAlertas() {
    const { data } = await apiClient.get('/lotes/alertas/resumen');
    return data;
  },

  // Dar de baja un lote (registrar merma por vencimiento u otro motivo)
  async darDeBaja(idLote, payload) {
    // payload: { motivo: string, observacion?: string }
    const { data } = await apiClient.post(`/lotes/${idLote}/baja`, payload);
    return data;
  }
};
