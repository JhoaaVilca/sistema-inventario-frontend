const API_BASE_URL = 'http://localhost:8080/api';

// Servicio para gestionar lotes y alertas
export const loteService = {
  // Obtener lotes por producto
  async obtenerLotesPorProducto(idProducto) {
    const response = await fetch(`${API_BASE_URL}/lotes/producto/${idProducto}`);
    if (!response.ok) throw new Error('Error al obtener lotes del producto');
    return response.json();
  },

  // Obtener lotes próximos a vencer
  async obtenerLotesProximosAVencer() {
    const response = await fetch(`${API_BASE_URL}/lotes/proximos-vencer`);
    if (!response.ok) throw new Error('Error al obtener lotes próximos a vencer');
    return response.json();
  },

  // Obtener lotes vencidos
  async obtenerLotesVencidos() {
    const response = await fetch(`${API_BASE_URL}/lotes/vencidos`);
    if (!response.ok) throw new Error('Error al obtener lotes vencidos');
    return response.json();
  },

  // Obtener stock total de un producto
  async obtenerStockTotalPorProducto(idProducto) {
    const response = await fetch(`${API_BASE_URL}/lotes/producto/${idProducto}/stock`);
    if (!response.ok) throw new Error('Error al obtener stock del producto');
    return response.json();
  },

  // Obtener resumen de alertas
  async obtenerResumenAlertas() {
    const response = await fetch(`${API_BASE_URL}/lotes/alertas/resumen`);
    if (!response.ok) throw new Error('Error al obtener resumen de alertas');
    return response.json();
  }
};
