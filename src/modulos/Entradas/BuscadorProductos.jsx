import { useState, useEffect, useRef } from "react";
import { Form, ListGroup, Button, Dropdown } from "react-bootstrap";
import { Search, X, ChevronDown } from "lucide-react";
import apiClient from "../../servicios/apiClient";

function BuscadorProductos({ onProductoSeleccionado, placeholder = "Buscar producto..." }) {
    const [query, setQuery] = useState("");
    const [productos, setProductos] = useState([]);
    const [mostrarSugerencias, setMostrarSugerencias] = useState(false);
    // removido loading no utilizado
    const [productoSeleccionado, setProductoSeleccionado] = useState(null);
    const [todosProductos, setTodosProductos] = useState([]);

    const inputRef = useRef(null);
    const timeoutRef = useRef(null);

    // Cargar todos los productos al montar el componente
    useEffect(() => {
        const cargarProductos = async () => {
            try {
                const { data } = await apiClient.get("/productos", { params: { page: 0, size: 1000 } });
                setTodosProductos(data?.content || []);
            } catch (error) {
                console.error("Error al cargar productos:", error);
            }
        };
        cargarProductos();
    }, []);

    // Buscar productos (inline en efecto para evitar deps faltantes)

    // Búsqueda en tiempo real
    useEffect(() => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = setTimeout(() => {
            if (query.length < 1) {
                setProductos([]);
                setMostrarSugerencias(false);
                return;
            }

            const filtrados = todosProductos.filter(producto =>
                producto.nombreProducto.toLowerCase().includes(query.toLowerCase())
            );

            setProductos(filtrados.slice(0, 10));
            setMostrarSugerencias(true);
        }, 200);

        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, [query, todosProductos]);

    // Manejar selección de producto
    const handleSeleccionarProducto = (producto) => {
        setProductoSeleccionado(producto);
        setQuery(producto.nombreProducto);
        setMostrarSugerencias(false);
        onProductoSeleccionado(producto);
    };

    // Limpiar selección
    const handleLimpiar = () => {
        setQuery("");
        setProductoSeleccionado(null);
        setProductos([]);
        setMostrarSugerencias(false);
        onProductoSeleccionado(null);
        inputRef.current?.focus();
    };

    // Manejar clic fuera del componente
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (inputRef.current && !inputRef.current.contains(event.target)) {
                setMostrarSugerencias(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    return (
        <div className="position-relative" ref={inputRef}>
            <div className="d-flex">
                <Form.Control
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => setMostrarSugerencias(true)}
                    placeholder={placeholder}
                    className="rounded-end-0"
                    autoComplete="off"
                />
                <Button
                    variant={productoSeleccionado ? "outline-danger" : "outline-secondary"}
                    className="rounded-start-0 px-3"
                    onClick={handleLimpiar}
                    title={productoSeleccionado ? "Limpiar selección" : "Buscar"}
                >
                    {productoSeleccionado ? <X size={16} /> : <ChevronDown size={16} />}
                </Button>
            </div>

            {/* Sugerencias */}
            {mostrarSugerencias && query.length > 0 && (
                <div className="position-absolute w-100" style={{ zIndex: 1000 }}>
                    <ListGroup className="border rounded-bottom shadow-sm" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                        {productos.length === 0 ? (
                            <ListGroup.Item className="text-center text-muted">
                                {query.length < 2 ? "Escribe al menos 2 caracteres" : "No se encontraron productos"}
                            </ListGroup.Item>
                        ) : (
                            productos.map((producto) => (
                                <ListGroup.Item
                                    key={producto.idProducto}
                                    action
                                    onClick={() => handleSeleccionarProducto(producto)}
                                    className="d-flex justify-content-between align-items-center"
                                >
                                    <div>
                                        <div className="fw-medium">{producto.nombreProducto}</div>
                                        <small className="text-muted">
                                            {producto.nombreCategoria} • Stock: {producto.stock} {producto.unidadMedida}
                                        </small>
                                    </div>
                                    <div className="text-end">
                                        <div className="fw-bold text-success">
                                            S/. {producto.precio?.toFixed(2)}
                                        </div>
                                        <small className="text-muted">
                                            Compra: S/. {producto.precioCompra?.toFixed(2)}
                                        </small>
                                    </div>
                                </ListGroup.Item>
                            ))
                        )}
                    </ListGroup>
                </div>
            )}

            {/* Información del producto seleccionado */}
            {productoSeleccionado && (
                <div className="mt-2 p-2 bg-light rounded border">
                    <div className="d-flex justify-content-between align-items-center">
                        <div>
                            <strong>{productoSeleccionado.nombreProducto}</strong>
                            <br />
                            <small className="text-muted">
                                {productoSeleccionado.nombreCategoria} • Stock: {productoSeleccionado.stock} {productoSeleccionado.unidadMedida}
                            </small>
                        </div>
                        <div className="text-end">
                            <div className="fw-bold text-success">
                                S/. {productoSeleccionado.precio?.toFixed(2)}
                            </div>
                            <small className="text-muted">
                                Compra: S/. {productoSeleccionado.precioCompra?.toFixed(2)}
                            </small>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default BuscadorProductos;
