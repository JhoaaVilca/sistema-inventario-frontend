import apiClient from './apiClient';

export const creditoService = {
  listar: async (params = {}) => {
    const { page = 0, size = 20 } = params;
    const resp = await apiClient.get(`/creditos`, { params: { page, size } });
    return resp.data;
  },
  obtener: async (id) => {
    const resp = await apiClient.get(`/creditos/${id}`);
    return resp.data;
  },
  registrarPago: async (idCredito, payload) => {
    const resp = await apiClient.post(`/creditos/${idCredito}/pagos`, payload);
    return resp.data;
  },
};

export default creditoService;


