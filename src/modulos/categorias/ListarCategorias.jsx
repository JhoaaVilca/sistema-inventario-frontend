import { useEffect, useState, useRef } from "react";
import AgregarCategoria from "./AgregarCategoria";
import EditarCategoria from "./EditarCategoria";
import { Edit, Trash2, Search, X, Grid3X3 } from "lucide-react";
import {
    Table,
    Button,
    InputGroup,
    FormControl,
    Alert,
    Toast,
    ToastContainer
} from "react-bootstrap";
import axios from "axios";

function ListarCategorias() {
    const [categorias, setCategorias] = useState([]);
    const [categoriaEditar, setCategoriaEditar] = useState(null);
    const [showAgregar, setShowAgregar] = useState(false);
    const [showEditar, setShowEditar] = useState(false);
    const [mostrarInput, setMostrarInput] = useState(false);
    const [filtro, setFiltro] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState("");
    const [toastVariant, setToastVariant] = useState("success");

    const inputRef = useRef(null);

    useEffect(() => {
        obtenerCategorias();
    }, []);

    const obtenerCategorias = async () => {
        setLoading(true);
        try {
            const response = await axios.get("http://localhost:8080/api/categorias");
            setCategorias(response.data);
            setError("");
        } catch (error) {
            console.error("Error al obtener categorías:", error);
            setError("Error al cargar las categorías. Intente nuevamente.");
        } finally {
            setLoading(false);
        }
    };

    const eliminarCategoria = async (id) => {
        if (window.confirm("¿Estás seguro de que deseas eliminar esta categoría?")) {
            try {
                await axios.delete(`http://localhost:8080/api/categorias/${id}`);
                mostrarNotificacion("Categoría eliminada exitosamente", "success");
                obtenerCategorias();
            } catch (error) {
                console.error("Error al eliminar categoría:", error);
                mostrarNotificacion("Error al eliminar la categoría", "danger");
            }
        }
    };

    const mostrarNotificacion = (mensaje, variante) => {
        setToastMessage(mensaje);
        setToastVariant(variante);
        setShowToast(true);
    };

    const limpiarBuscador = () => {
        setFiltro("");
        setMostrarInput(false);
        inputRef.current?.blur();
    };

    const categoriasFiltradas = categorias.filter((categoria) =>
        categoria.nombre.toLowerCase().includes(filtro.toLowerCase())
    );

    return (
        <div className="container mt-4">
            <div className="d-flex align-items-center gap-3 mb-4">
                <Grid3X3 size={32} className="text-primary" />
                <h3 className="mb-0">Gestión de Categorías</h3>
            </div>

            {/* Botón Agregar + Buscador */}
            <div className="d-flex justify-content-between align-items-center mb-3">
                <Button variant="success" onClick={() => setShowAgregar(true)}>
                    + Agregar Categoría
                </Button>

                {!mostrarInput ? (
                    <Button
                        variant="outline-primary"
                        onClick={() => setMostrarInput(true)}
                    >
                        <Search size={18} />
                    </Button>
                ) : (
                    <InputGroup style={{ maxWidth: "250px" }}>
                        <FormControl
                            ref={inputRef}
                            autoFocus
                            placeholder="Buscar categorías..."
                            value={filtro}
                            onChange={(e) => setFiltro(e.target.value)}
                        />
                        {filtro ? (
                            <Button variant="outline-secondary" onClick={limpiarBuscador}>
                                <X size={18} />
                            </Button>
                        ) : (
                            <Button
                                variant="outline-danger"
                                onClick={() => {
                                    setMostrarInput(false);
                                    setFiltro("");
                                }}
                            >
                                <X size={18} />
                            </Button>
                        )}
                    </InputGroup>
                )}
            </div>

            {/* Mensaje de error */}
            {error && (
                <Alert variant="danger" dismissible onClose={() => setError("")}>
                    {error}
                </Alert>
            )}

            {/* Tabla */}
            <div className="card shadow-sm">
                <div className="card-body p-0">
                    <Table striped bordered hover responsive className="mb-0">
                        <thead className="table-dark text-center">
                            <tr>
                                <th style={{ width: '80px' }}>ID</th>
                                <th>Nombre</th>
                                <th style={{ width: '150px' }}>Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="text-center align-middle">
                            {loading ? (
                                <tr>
                                    <td colSpan="3" className="text-center py-4">
                                        <div className="spinner-border text-primary" role="status">
                                            <span className="visually-hidden">Cargando...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : categoriasFiltradas.length === 0 ? (
                                <tr>
                                    <td colSpan="3" className="text-center py-4 text-muted">
                                        {filtro ? "No se encontraron categorías" : "No hay categorías registradas"}
                                    </td>
                                </tr>
                            ) : (
                                categoriasFiltradas.map((categoria) => (
                                    <tr key={categoria.idCategoria}>
                                        <td>{categoria.idCategoria}</td>
                                        <td className="fw-medium">{categoria.nombre}</td>
                                        <td>
                                            <div className="d-flex justify-content-center gap-2">
                                                <Button
                                                    variant="outline-warning"
                                                    size="sm"
                                                    onClick={() => {
                                                        setCategoriaEditar(categoria);
                                                        setShowEditar(true);
                                                    }}
                                                    title="Editar categoría"
                                                >
                                                    <Edit size={16} />
                                                    <span className="d-none d-md-inline ms-1">Editar</span>
                                                </Button>
                                                <Button
                                                    variant="outline-danger"
                                                    size="sm"
                                                    onClick={() => eliminarCategoria(categoria.idCategoria)}
                                                    title="Eliminar categoría"
                                                >
                                                    <Trash2 size={16} />
                                                    <span className="d-none d-md-inline ms-1">Eliminar</span>
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </Table>
                </div>
            </div>

            {/* Modales */}
            <AgregarCategoria
                show={showAgregar}
                handleClose={() => setShowAgregar(false)}
                onCategoriaAdded={() => {
                    obtenerCategorias();
                    mostrarNotificacion("Categoría agregada exitosamente", "success");
                }}
            />
            <EditarCategoria
                show={showEditar}
                handleClose={() => setShowEditar(false)}
                categoria={categoriaEditar}
                onCategoriaEditada={() => {
                    obtenerCategorias();
                    mostrarNotificacion("Categoría actualizada exitosamente", "success");
                }}
            />

            {/* Toast de notificaciones */}
            <ToastContainer position="top-end" className="p-3">
                <Toast 
                    show={showToast} 
                    onClose={() => setShowToast(false)} 
                    delay={3000} 
                    autohide
                    bg={toastVariant}
                >
                    <Toast.Header closeButton>
                        <strong className="me-auto">
                            {toastVariant === "success" ? "Éxito" : "Error"}
                        </strong>
                    </Toast.Header>
                    <Toast.Body className={toastVariant === "success" ? "text-white" : ""}>
                        {toastMessage}
                    </Toast.Body>
                </Toast>
            </ToastContainer>
        </div>
    );
}

export default ListarCategorias;
