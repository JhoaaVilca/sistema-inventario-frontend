import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import FormularioCategoria from "./FormularioCategoria";
import { Edit, Trash2, Search, X, Grid3X3, Eye, Plus } from "lucide-react";
import {
    Table,
    Button,
    InputGroup,
    FormControl,
    Alert,
    Toast,
    ToastContainer,
    Badge
} from "react-bootstrap";
import apiClient from "../../servicios/apiClient";
import Paginador from "../common/Paginador";

function ListarCategorias() {
    const navigate = useNavigate();
    const [categorias, setCategorias] = useState([]);
    const [categoriaEditar, setCategoriaEditar] = useState(null);
    const [showAgregar, setShowAgregar] = useState(false);
    const [modoEdicion, setModoEdicion] = useState(false);
    const [mostrarInput, setMostrarInput] = useState(false);
    const [filtro, setFiltro] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState("");
    const [toastVariant, setToastVariant] = useState("success");
    const [page, setPage] = useState(0);
    const [size, setSize] = useState(10); // Tamaño normal
    const [totalPages, setTotalPages] = useState(0);

    const inputRef = useRef(null);

    useEffect(() => {
        obtenerCategorias();
    }, [page, size]);

    const obtenerCategorias = async () => {
        setLoading(true);
        try {
            const { data } = await apiClient.get("/categorias", { params: { page, size } });
            setCategorias(data?.content || []);
            setTotalPages(data?.totalPages || 0);
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
                await apiClient.delete(`/categorias/${id}`);
                mostrarNotificacion("Categoría eliminada exitosamente", "success");
                obtenerCategorias();
            } catch (error) {
                console.error("Error al eliminar categoría:", error);
                mostrarNotificacion("Error al eliminar la categoría", "danger");
            }
        }
    };

    const iniciarEdicion = (categoria) => {
        setCategoriaEditar(categoria);
        setModoEdicion(true);
    };

    const cancelarEdicion = () => {
        setCategoriaEditar(null);
        setModoEdicion(false);
    };

    const mostrarNotificacion = (mensaje, variante) => {
        setToastMessage(mensaje);
        setToastVariant(variante);
        setShowToast(true);
    };

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const limpiarBuscador = () => {
        setFiltro("");
        setMostrarInput(false);
        inputRef.current?.blur();
    };

    const categoriasFiltradas = categorias.filter((categoria) =>
        (categoria.nombre || "").toLowerCase().includes(filtro.toLowerCase()) ||
        (categoria.descripcion || "").toLowerCase().includes(filtro.toLowerCase())
    );

    return (
        <div className="container-fluid mt-4">
            <div className="d-flex align-items-center gap-3 mb-4 p-3 bg-white rounded-3 shadow-sm border">
                <div className="p-2 bg-primary bg-opacity-10 rounded-3">
                    <Grid3X3 size={24} className="text-primary" />
                </div>
                <div>
                    <h3 className="mb-0 text-dark fw-bold">Gestión de Categorías</h3>
                    <small className="text-muted">Organiza tus productos por categorías</small>
                </div>
            </div>

            {/* Mensaje de error */}
            {error && (
                <Alert variant="danger" dismissible onClose={() => setError("")}>
                    {error}
                </Alert>
            )}

            {/* Layout mitad y mitad */}
            <div className="row">
                {/* Columna izquierda: Formulario de agregar */}
                <div className="col-lg-6 mb-4">
                    <div className="card h-100">
                        <div className={`card-header text-white ${modoEdicion ? 'bg-warning' : 'bg-success'}`}>
                            <h5 className="mb-0">
                                {modoEdicion ? (
                                    <>
                                        <Edit size={20} className="me-2" />
                                        Editar Categoría
                                    </>
                                ) : (
                                    <>
                                        <Plus size={20} className="me-2" />
                                        Agregar Nueva Categoría
                                    </>
                                )}
                            </h5>
                        </div>
                        <div className="card-body">
                            <FormularioCategoria
                                show={true}
                                handleClose={() => {}}
                                onCategoriaAdded={() => {
                                    obtenerCategorias();
                                    mostrarNotificacion("Categoría agregada exitosamente", "success");
                                }}
                                onCategoriaUpdated={() => {
                                    obtenerCategorias();
                                    mostrarNotificacion("Categoría actualizada exitosamente", "success");
                                    cancelarEdicion();
                                }}
                                inlineMode={true}
                                categoriaEditar={categoriaEditar}
                                modoEdicion={modoEdicion}
                            />
                            {modoEdicion && (
                                <div className="mt-3">
                                    <Button 
                                        variant="outline-secondary" 
                                        size="sm" 
                                        onClick={cancelarEdicion}
                                    >
                                        Cancelar Edición
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Columna derecha: Listado */}
                <div className="col-lg-6 mb-4">
                    <div className="card h-100">
                        <div className="card-header bg-primary text-white">
                            <div className="d-flex justify-content-between align-items-center">
                                <h5 className="mb-0">
                                    <Grid3X3 size={20} className="me-2" />
                                    Lista de Categorías
                                    {categoriasFiltradas.length > 0 && (
                                        <span className="badge bg-light text-primary ms-2">{categoriasFiltradas.length}</span>
                                    )}
                                </h5>
                                <div className="d-flex align-items-center gap-2">
                                    {!mostrarInput ? (
                                        <Button
                                            variant="outline-light"
                                            size="sm"
                                            onClick={() => setMostrarInput(true)}
                                        >
                                            <Search size={16} />
                                        </Button>
                                    ) : (
                                        <InputGroup size="sm" style={{ width: "200px" }}>
                                            <FormControl
                                                ref={inputRef}
                                                autoFocus
                                                placeholder="Buscar..."
                                                value={filtro}
                                                onChange={(e) => setFiltro(e.target.value)}
                                            />
                                            {filtro ? (
                                                <Button variant="outline-secondary" onClick={limpiarBuscador}>
                                                    <X size={16} />
                                                </Button>
                                            ) : (
                                                <Button
                                                    variant="outline-danger"
                                                    onClick={() => {
                                                        setMostrarInput(false);
                                                        setFiltro("");
                                                    }}
                                                >
                                                    <X size={16} />
                                                </Button>
                                            )}
                                        </InputGroup>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="card-body p-0" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                            {loading ? (
                                <div className="text-center py-4">
                                    <div className="spinner-border text-primary" role="status">
                                        <span className="visually-hidden">Cargando...</span>
                                    </div>
                                </div>
                            ) : categoriasFiltradas.length === 0 ? (
                                <div className="text-center py-4 text-muted">
                                    {filtro ? "No se encontraron categorías" : "No hay categorías registradas"}
                                </div>
                            ) : (
                                <div className="list-group list-group-flush">
                                    {categoriasFiltradas.map((categoria) => (
                                        <div key={categoria.idCategoria} className="list-group-item">
                                            <div className="d-flex justify-content-between align-items-start">
                                                <div className="flex-grow-1">
                                                    <h6 className="mb-1 fw-bold">{categoria.nombre}</h6>
                                                    <p className="mb-1 text-muted small">
                                                        {categoria.descripcion || "Sin descripción"}
                                                    </p>
                                                    <div className="d-flex gap-2">
                                                        {categoria.activo ? (
                                                            <Badge bg="success" className="small">Activo</Badge>
                                                        ) : (
                                                            <Badge bg="secondary" className="small">Inactivo</Badge>
                                                        )}
                                                        <Button
                                                            variant="link"
                                                            size="sm"
                                                            className="p-0 text-primary"
                                                            onClick={() => navigate(`/categoria/${categoria.idCategoria}`)}
                                                            title="Ver productos"
                                                        >
                                                            <Eye size={14} />
                                                        </Button>
                                                    </div>
                                                </div>
                                                <div className="d-flex gap-1">
                                                    <Button
                                                        variant="outline-warning"
                                                        size="sm"
                                                        onClick={() => iniciarEdicion(categoria)}
                                                        title="Editar categoría"
                                                        className="btn-sm"
                                                    >
                                                        <Edit size={12} />
                                                    </Button>
                                                    <Button
                                                        variant="outline-danger"
                                                        size="sm"
                                                        onClick={() => eliminarCategoria(categoria.idCategoria)}
                                                        title="Eliminar categoría"
                                                        className="btn-sm"
                                                    >
                                                        <Trash2 size={12} />
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        {totalPages > 1 && (
                            <div className="card-footer">
                                <Paginador page={page} totalPages={totalPages} onChange={setPage} disabled={loading} />
                            </div>
                        )}
                    </div>
                </div>
            </div>

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
