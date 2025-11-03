import apiClient from './apiClient';

const dashboardService = {
    obtenerResumen: async () => {
        const { data } = await apiClient.get('/dashboard/resumen');
        return data;
    },

    actividadReciente: async (limite = 10) => {
        const { data } = await apiClient.get(`/dashboard/actividad-reciente?limite=${limite}`);
        return data;
    },

    resumenMensual: async () => {
        const { data } = await apiClient.get('/reportes/mensual');
        return data;
    },

    alertas: async () => {
        const { data } = await apiClient.get('/dashboard/alertas');
        return data;
    },

    proximosVencer: async () => {
        const { data } = await apiClient.get('/dashboard/proximos-vencer');
        return data;
    },

    deudores: async (limite = 5) => {
        const { data } = await apiClient.get(`/dashboard/deudores?limite=${limite}`);
        return data;
    },

    productosSinStock: async () => {
        const { data } = await apiClient.get('/productos/alertas/sin-stock');
        return data;
    },

    vencimientos: async () => {
        const { data } = await apiClient.get('/dashboard/vencimientos');
        return data;
    }
};

export default dashboardService;


