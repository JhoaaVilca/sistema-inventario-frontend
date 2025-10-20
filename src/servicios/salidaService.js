import apiClient from './apiClient';

const salidaService = {
    // Listar salidas con paginación
    listar: async (params = {}) => {
        const response = await apiClient.get('/salidas', { params });
        return response.data;
    },

    // Obtener una salida por ID
    obtenerPorId: async (id) => {
        const response = await apiClient.get(`/salidas/${id}`);
        return response.data;
    },

    // Crear una nueva salida
    crear: async (salidaData) => {
        const response = await apiClient.post('/salidas', salidaData);
        return response.data;
    },

    // Actualizar una salida
    actualizar: async (id, salidaData) => {
        const response = await apiClient.put(`/salidas/${id}`, salidaData);
        return response.data;
    },

    // Cancelar una salida
    cancelar: async (id) => {
        const response = await apiClient.put(`/salidas/${id}/cancelar`);
        return response.data;
    },

    // Filtrar salidas por fecha
    filtrarPorFecha: async (fecha) => {
        const response = await apiClient.get(`/salidas/filtrar/fecha?fecha=${fecha}`);
        return response.data;
    },

    // Filtrar salidas por rango de fechas
    filtrarPorRango: async (fechaInicio, fechaFin) => {
        const response = await apiClient.get(`/salidas/filtrar/rango?inicio=${fechaInicio}&fin=${fechaFin}`);
        return response.data;
    },

    // Generar boleta de venta
    generarBoleta: async (id) => {
        const response = await apiClient.get(`/salidas/${id}/boleta`, {
            responseType: 'blob'
        });
        return response;
    }
};

export default salidaService;

