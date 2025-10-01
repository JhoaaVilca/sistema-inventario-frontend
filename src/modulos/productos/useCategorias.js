import { useState, useEffect } from 'react';
import apiClient from '../../servicios/apiClient';

export const useCategorias = () => {
    const [categorias, setCategorias] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const obtenerCategorias = async () => {
        setLoading(true);
        try {
            const { data } = await apiClient.get("/categorias/activas");
            // data ya es un array simple
            setCategorias(data || []);
            setError("");
        } catch (error) {
            console.error("Error al obtener categorías activas:", error);
            setError("Error al cargar las categorías activas");
        } finally {
            setLoading(false);
        }
    };


    const obtenerNombreCategoria = (idCategoria) => {
        const categoria = categorias.find(cat => cat.idCategoria === idCategoria);
        return categoria ? categoria.nombre : 'Sin categoría';
    };

    useEffect(() => {
        obtenerCategorias();
    }, []);

    return {
        categorias,
        loading,
        error,
        obtenerCategorias,
        obtenerNombreCategoria
    };
};
