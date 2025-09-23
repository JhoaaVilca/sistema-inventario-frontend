import { useState, useEffect, useRef } from "react";
import { Form, ListGroup, Button } from "react-bootstrap";
import { Search, X, ChevronDown } from "lucide-react";
import apiClient from "../../servicios/apiClient";

function SelectProductos({ onProductoSeleccionado, placeholder = "Buscar producto...", limpiar = false }) {
    const [query, setQuery] = useState("");
    const [productos, setProductos] = useState([]);
    const [productosFiltrados, setProductosFiltrados] = useState([]);
    const [mostrarSugerencias, setMostrarSugerencias] = useState(false);
    const [cargando, setCargando] = useState(true);
    const [productoSeleccionado, setProductoSeleccionado] = useState(null);
    
    const inputRef = useRef(null);
    const timeoutRef = useRef(null);

    // Cargar todos los productos al montar el componente
    useEffect(() => {
        const cargarProductos = async () => {
            try {
                setCargando(true);
                const { data } = await apiClient.get("/productos");
                setProductos(data);
                setProductosFiltrados(data);
            } catch (error) {
                console.error("Error al cargar productos:", error);
            } finally {
                setCargando(false);
            }
        };
        cargarProductos();
    }, []);

    // Filtrar productos en tiempo real
    useEffect(() => {
        if (query.trim() === "") {
            setProductosFiltrados([]);
        } else {
            const filtrados = productos.filter(producto =>
                producto.nombreProducto.toLowerCase().includes(query.toLowerCase())
            );
            setProductosFiltrados(filtrados.slice(0, 10)); // Solo 10 resultados
        }
    }, [query, productos]);

    // Limpiar cuando se reciba la prop limpiar
    useEffect(() => {
        if (limpiar) {
            setProductoSeleccionado(null);
            setQuery("");
            setMostrarSugerencias(false);
        }
    }, [limpiar]);

    // Manejar selección de producto
    const handleSeleccionarProducto = (producto) => {
        setProductoSeleccionado(producto);
        setQuery(producto.nombreProducto);
        setMostrarSugerencias(false);
        onProductoSeleccionado(producto);
    };

    // Limpiar selección
    const handleLimpiar = () => {
        setProductoSeleccionado(null);
        setQuery("");
        setMostrarSugerencias(false);
        onProductoSeleccionado(null);
    };

    // Manejar clics fuera del componente
    useEffect(() => {
        function handleClickOutside(event) {
            if (inputRef.current && !inputRef.current.contains(event.target)) {
                setMostrarSugerencias(false);
            }
        }
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
                    placeholder={cargando ? "Cargando productos..." : "Escribe para buscar productos..."}
                    className="rounded-end-0"
                    autoComplete="off"
                    disabled={cargando}
                />
                <Button
                    variant={productoSeleccionado ? "outline-danger" : "outline-primary"}
                    className="rounded-start-0 px-3"
                    onClick={handleLimpiar}
                    title={productoSeleccionado ? "Limpiar selección" : "Buscar productos"}
                >
                    {productoSeleccionado ? <X size={16} /> : <Search size={16} />}
                </Button>
            </div>
            
            {/* Texto de ayuda */}
            {!productoSeleccionado && query.length === 0 && (
                <small className="text-muted mt-1 d-block">
                    💡 Escribe el nombre del producto para buscar y seleccionar
                </small>
            )}

            {/* Sugerencias */}
            {mostrarSugerencias && query.length > 0 && (
                <div className="position-absolute w-100" style={{ zIndex: 1000 }}>
                    <ListGroup className="border rounded-bottom shadow-sm" style={{ maxHeight: '250px', overflowY: 'auto' }}>
                        {productosFiltrados.length === 0 ? (
                            <ListGroup.Item className="text-center text-muted py-3">
                                <Search size={20} className="me-2" />
                                No se encontraron productos
                            </ListGroup.Item>
                        ) : (
                            <>
                                <ListGroup.Item className="bg-light text-center py-2">
                                    <small className="text-muted">
                                        <strong>{productosFiltrados.length}</strong> producto{productosFiltrados.length !== 1 ? 's' : ''} encontrado{productosFiltrados.length !== 1 ? 's' : ''}
                                    </small>
                                </ListGroup.Item>
                                {productosFiltrados.map((producto) => (
                                    <ListGroup.Item
                                        key={producto.idProducto}
                                        action
                                        onClick={() => handleSeleccionarProducto(producto)}
                                        className="py-2 hover-bg-light"
                                        style={{ cursor: 'pointer' }}
                                    >
                                        <div className="d-flex justify-content-between align-items-center">
                                            <div>
                                                <div className="fw-medium text-primary">{producto.nombreProducto}</div>
                                                <small className="text-muted">
                                                    {producto.nombreCategoria} • Stock: {producto.stock} {producto.unidadMedida}
                                                </small>
                                            </div>
                                            <div className="text-end">
                                                <div className="fw-bold text-success">S/. {producto.precio?.toFixed(2)}</div>
                                                <small className="text-muted">Compra: S/. {producto.precioCompra?.toFixed(2)}</small>
                                            </div>
                                        </div>
                                    </ListGroup.Item>
                                ))}
                            </>
                        )}
                    </ListGroup>
                </div>
            )}

            {/* Información del producto seleccionado */}
            {productoSeleccionado && (
                <div className="mt-2 p-3 bg-success bg-opacity-10 rounded border border-success">
                    <div className="d-flex justify-content-between align-items-center">
                        <div className="flex-grow-1">
                            <div className="d-flex align-items-center mb-1">
                                <div className="bg-success rounded-circle me-2" style={{ width: '8px', height: '8px' }}></div>
                                <strong className="text-success">{productoSeleccionado.nombreProducto}</strong>
                            </div>
                            <div className="row text-muted small">
                                <div className="col-6">
                                    <strong>Stock:</strong> {productoSeleccionado.stock} {productoSeleccionado.unidadMedida}
                                </div>
                                <div className="col-6">
                                    <strong>Precio:</strong> S/. {productoSeleccionado.precio?.toFixed(2)}
                                </div>
                            </div>
                        </div>
                        <Button variant="outline-danger" size="sm" onClick={handleLimpiar} className="ms-2">
                            <X size={14} className="me-1" />
                            Cambiar
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default SelectProductos;
