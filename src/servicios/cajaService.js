import apiClient from './apiClient';

const cajaService = {
    // Obtener estado de caja
    obtenerEstado: async () => {
        try {
            // Primero verificamos si hay una caja abierta
            const verificarResponse = await apiClient.get('/caja/verificar');

            if (verificarResponse.data.existeCajaAbierta) {
                // Si hay caja abierta, obtenemos sus detalles
                const estadoResponse = await apiClient.get('/caja/estado');
                if (estadoResponse.data.success && estadoResponse.data.caja) {
                    return {
                        existeCaja: true,
                        caja: estadoResponse.data.caja,
                        message: estadoResponse.data.message
                    };
                }
            }

            // Si no hay caja abierta o hubo un error al obtener los detalles
            return {
                existeCaja: false,
                message: 'No hay caja abierta actualmente'
            };

        } catch (error) {
            console.error('Error al obtener estado de caja:', error);
            // En caso de error, asumir que no hay caja abierta
            return {
                existeCaja: false,
                message: 'Error al verificar el estado de la caja'
            };
        }
    },

    // Abrir caja
    abrirCaja: async (montoApertura, observaciones = '') => {
        try {
            const response = await apiClient.post('/caja/abrir', {
                montoApertura: parseFloat(montoApertura),
                usuario: localStorage.getItem('username') || 'admin',
                observaciones
            });
            return response.data;
        } catch (error) {
            console.error('Error al abrir caja:', error);
            throw error;
        }
    },

    // Cerrar caja
    cerrarCaja: async (idCaja, observaciones = '') => {
        try {
            const response = await apiClient.post(`/caja/${idCaja}/cerrar`, {
                usuario: localStorage.getItem('username') || 'admin',
                observaciones
            });
            return response.data;
        } catch (error) {
            console.error('Error al cerrar caja:', error);
            throw error;
        }
    },

    // Obtener resumen de caja
    obtenerResumen: async (idCaja) => {
        try {
            const response = await apiClient.get(`/caja/${idCaja}/resumen`);
            return response.data;
        } catch (error) {
            console.error('Error al obtener resumen de caja:', error);
            throw error;
        }
    },

    // Obtener movimientos de caja
    obtenerMovimientos: async (idCaja) => {
        try {
            const response = await apiClient.get(`/caja/${idCaja}/movimientos`);
            return response.data;
        } catch (error) {
            console.error('Error al obtener movimientos:', error);
            throw error;
        }
    },

    // Registrar egreso manual
    registrarEgreso: async (idCaja, monto, descripcion, observaciones = '') => {
        try {
            const response = await apiClient.post(`/caja/${idCaja}/egreso`, {
                monto: parseFloat(monto),
                descripcion,
                usuario: localStorage.getItem('username') || 'admin',
                observaciones
            });
            return response.data;
        } catch (error) {
            console.error('Error al registrar egreso:', error);
            throw error;
        }
    },

    // Registrar movimiento manual
    registrarMovimiento: async (idCaja, tipo, monto, descripcion, referencia = '') => {
        try {
            const response = await apiClient.post(`/caja/${idCaja}/movimiento`, {
                tipo,
                monto: parseFloat(monto),
                descripcion,
                usuario: localStorage.getItem('username') || 'admin',
                referencia
            });
            return response.data;
        } catch (error) {
            console.error('Error al registrar movimiento:', error);
            throw error;
        }
    },

    // Obtener historial de cajas
    obtenerHistorial: async (dias = 30) => {
        try {
            const response = await apiClient.get(`/caja/historial?dias=${dias}`);
            return response.data;
        } catch (error) {
            console.error('Error al obtener historial:', error);
            throw error;
        }
    },

    // Generar reporte PDF
    generarReporte: async (idCaja) => {
        try {
            const response = await apiClient.get(`/caja/${idCaja}/reporte`, {
                responseType: 'blob'
            });
            return response;
        } catch (error) {
            console.error('Error al generar reporte:', error);
            throw error;
        }
    },

    // Verificar si existe caja abierta
    verificarCajaAbierta: async () => {
        try {
            const response = await apiClient.get('/caja/verificar');
            return response.data;
        } catch (error) {
            console.error('Error al verificar caja abierta:', error);
            throw error;
        }
    }
};

export default cajaService;






