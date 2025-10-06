import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import AgregarCategoria from "./AgregarCategoria";
import EditarCategoria from "./EditarCategoria";
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
    const [showEditar, setShowEditar] = useState(false);
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

            {/* Botón Agregar */}
            <div className="d-flex justify-content-end align-items-center gap-2 mb-3">
                <Button variant="success" onClick={() => setShowAgregar(true)} className="mb-3">
                    <Plus size={16} /> Agregar Categoría
                </Button>
            </div>

            {/* Mensaje de error */}
            {error && (
                <Alert variant="danger" dismissible onClose={() => setError("")}>
                    {error}
                </Alert>
            )}

            {/* Listado unificado */}
            <div className="list-card">
                <div className="list-card-header py-3 px-3">
                    <div className="d-flex justify-content-between align-items-center">
                        <h5 className="mb-0 text-dark fw-semibold">
                            Lista de Categorías
                            {categoriasFiltradas.length > 0 && (
                                <span className="badge bg-primary ms-2">{categoriasFiltradas.length}</span>
                            )}
                        </h5>
                        <div className="d-flex align-items-center gap-2">
                            {!mostrarInput ? (
                                <Button
                                    variant="outline-primary"
                                    size="sm"
                                    onClick={() => setMostrarInput(true)}
                                >
                                    <Search size={16} />
                                </Button>
                            ) : (
                                <InputGroup size="sm" style={{ width: "250px" }}>
                                    <FormControl
                                        ref={inputRef}
                                        autoFocus
                                        placeholder="Buscar categorías o descripción..."
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
                <div className="list-card-body p-0">
                    <div className="table-responsive">
                        <Table hover className="mb-0">
                            <thead className="table-light text-center">
                                <tr>
                                    <th className="fw-semibold py-3">Nombre</th>
                                    <th className="fw-semibold py-3">Descripción</th>
                                    <th className="fw-semibold py-3">Estado</th>
                                    <th className="fw-semibold py-3 col-actions">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="text-center align-middle">
                                {loading ? (
                                    <tr>
                                        <td colSpan="4" className="text-center py-4">
                                            <div className="spinner-border text-primary" role="status">
                                                <span className="visually-hidden">Cargando...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : categoriasFiltradas.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className="text-center py-4 text-muted">
                                            {filtro ? "No se encontraron categorías" : "No hay categorías registradas"}
                                        </td>
                                    </tr>
                                ) : (
                                    categoriasFiltradas.map((categoria) => (
                                        <tr key={categoria.idCategoria}>
                                            <td className="fw-medium">{categoria.nombre}</td>
                                            <td className="text-start">{categoria.descripcion || "-"}</td>
                                            <td>
                                                {categoria.activo ? (
                                                    <Badge bg="success">🟢 Activo</Badge>
                                                ) : (
                                                    <Badge bg="secondary">⚪ Inactivo</Badge>
                                                )}
                                            </td>
                                            <td>
                                                <div className="d-flex justify-content-center gap-1 flex-wrap">
                                                    <Button
                                                        variant="outline-primary"
                                                        size="sm"
                                                        onClick={() => navigate(`/categoria/${categoria.idCategoria}`)}
                                                        title="Ver productos de esta categoría"
                                                        className="btn-sm shadow-sm"
                                                        style={{ minWidth: '32px' }}
                                                    >
                                                        <Eye size={12} />
                                                        <span className="d-none d-xl-inline ms-1">Ver</span>
                                                    </Button>
                                                    <Button
                                                        variant="outline-warning"
                                                        size="sm"
                                                        onClick={() => {
                                                            setCategoriaEditar(categoria);
                                                            setShowEditar(true);
                                                        }}
                                                        title="Editar categoría"
                                                        className="btn-sm shadow-sm"
                                                        style={{ minWidth: '32px' }}
                                                    >
                                                        <Edit size={12} />
                                                        <span className="d-none d-xl-inline ms-1">Editar</span>
                                                    </Button>
                                                    <Button
                                                        variant="outline-danger"
                                                        size="sm"
                                                        onClick={() => eliminarCategoria(categoria.idCategoria)}
                                                        title="Eliminar categoría"
                                                        className="btn-sm shadow-sm"
                                                        style={{ minWidth: '32px' }}
                                                    >
                                                        <Trash2 size={12} />
                                                        <span className="d-none d-xl-inline ms-1">Eliminar</span>
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </Table>
                    </div>
                    <Paginador page={page} totalPages={totalPages} onChange={setPage} disabled={loading} />
                </div>
            </div>

            {/* Modales */}
            <AgregarCategoria
                show={showAgregar}
                handleClose={() => setShowAgregar(false)}
                onCategoriaAdded={() => {
                    obtenerCategorias();
                    mostrarNotificacion("Categoría agregada exitosamente", "success");
                    scrollToTop();
                }}
            />
            <EditarCategoria
                show={showEditar}
                handleClose={() => setShowEditar(false)}
                categoria={categoriaEditar}
                onCategoriaEditada={() => {
                    obtenerCategorias();
                    mostrarNotificacion("Categoría actualizada exitosamente", "success");
                    scrollToTop();
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
