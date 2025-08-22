import { useState, useEffect } from 'react';
import axios from 'axios';

export const useCategorias = () => {
    const [categorias, setCategorias] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const obtenerCategorias = async () => {
        setLoading(true);
        try {
            const response = await axios.get("http://localhost:8080/api/categorias");
            setCategorias(response.data);
            setError("");
        } catch (error) {
            console.error("Error al obtener categorías:", error);
            setError("Error al cargar las categorías");
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
