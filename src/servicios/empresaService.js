import apiClient from './apiClient';

const empresaService = {
    // Obtener configuración de la empresa
    obtenerConfiguracion: async () => {
        try {
            const response = await apiClient.get('/empresa');
            return response.data;
        } catch (error) {
            console.error('Error al obtener configuración de empresa:', error);
            throw error;
        }
    },

    // Actualizar configuración de la empresa
    actualizarConfiguracion: async (empresaData) => {
        try {
            const response = await apiClient.put('/empresa', empresaData);
            return response.data;
        } catch (error) {
            console.error('Error al actualizar configuración de empresa:', error);
            throw error;
        }
    },

    subirLogo: async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        const response = await apiClient.post('/empresa/logo', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
    },
};

export default empresaService;
