import { useEffect, useState, useRef } from "react";
import AgregarProveedor from "./AgregarProveedor";
import EditarProveedor from "./EditarProveedor";
import { Edit, Power, PowerOff, Search, X, Building2 } from "lucide-react";
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

function ListarProveedores() {
    const [proveedores, setProveedores] = useState([]);
    const [proveedorEditar, setProveedorEditar] = useState(null);
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
        obtenerProveedores();
    }, []);

    const obtenerProveedores = async () => {
        setLoading(true);
        try {
            const response = await axios.get("http://localhost:8080/api/proveedores");
            setProveedores(response.data);
            setError("");
        } catch (error) {
            console.error("Error al obtener proveedores:", error);
            setError("Error al cargar los proveedores. Intente nuevamente.");
        } finally {
            setLoading(false);
        }
    };

    // 🔴 Desactivar proveedor
    const desactivarProveedor = async (id) => {
        if (window.confirm("¿Seguro que deseas desactivar este proveedor?")) {
            try {
                await axios.put(`http://localhost:8080/api/proveedores/${id}/desactivar`);
                mostrarNotificacion("Proveedor desactivado exitosamente", "success");
                obtenerProveedores();
            } catch (error) {
                console.error("Error al desactivar proveedor:", error);
                mostrarNotificacion("Error al desactivar el proveedor", "danger");
            }
        }
    };

    // 🟢 Activar proveedor
    const activarProveedor = async (id) => {
        try {
            await axios.put(`http://localhost:8080/api/proveedores/${id}/activar`);
            mostrarNotificacion("Proveedor activado exitosamente", "success");
            obtenerProveedores();
        } catch (error) {
            console.error("Error al activar proveedor:", error);
            mostrarNotificacion("Error al activar el proveedor", "danger");
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

    const proveedoresFiltrados = proveedores.filter((proveedor) =>
        proveedor.nombre.toLowerCase().includes(filtro.toLowerCase())
    );

    return (
        <div className="container mt-4">
            {/* HEADER CON ICONO */}
            <div className="d-flex align-items-center gap-3 mb-4">
                <Building2 size={32} className="text-success" />
                <h3 className="mb-0">Gestión de Proveedores</h3>
            </div>

            {/* Botón Agregar + Buscador */}
            <div className="d-flex justify-content-between align-items-center mb-3">
                <Button variant="success" onClick={() => setShowAgregar(true)}>
                    + Agregar Proveedor
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
                            placeholder="Buscar proveedores..."
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

            {/* TABLA */}
            <div className="card shadow-sm">
                <div className="card-body p-0">
                    <Table striped bordered hover responsive className="mb-0">
                        <thead className="table-dark text-center">
                            <tr>
                                <th>#</th>
                                <th>Nombre</th>
                                <th>Tipo Documento</th>
                                <th>Número Documento</th>
                                <th>Dirección</th>
                                <th>Teléfono</th>
                                <th>Email</th>
                                <th>Estado</th>
                                <th style={{ width: '220px' }}>Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="text-center align-middle">
                            {loading ? (
                                <tr>
                                    <td colSpan="9" className="text-center py-4">
                                        <div className="spinner-border text-success" role="status">
                                            <span className="visually-hidden">Cargando...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : proveedoresFiltrados.length === 0 ? (
                                <tr>
                                    <td colSpan="9" className="text-center py-4 text-muted">
                                        {filtro ? "No se encontraron proveedores" : "No hay proveedores registrados"}
                                    </td>
                                </tr>
                            ) : (
                                proveedoresFiltrados.map((proveedor, index) => (
                                    <tr key={proveedor.idProveedor}>
                                        <td>{index + 1}</td>
                                        <td className="fw-medium">{proveedor.nombre}</td>
                                        <td>{proveedor.tipoDocumento}</td>
                                        <td>{proveedor.numeroDocumento}</td>
                                        <td>{proveedor.direccion}</td>
                                        <td>{proveedor.telefono}</td>
                                        <td>{proveedor.email}</td>
                                        <td>
                                            {proveedor.activo ? (
                                                <span className="badge bg-success">Activo</span>
                                            ) : (
                                                <span className="badge bg-secondary">Inactivo</span>
                                            )}
                                        </td>
                                        <td>
                                            <div className="d-flex justify-content-center gap-2">
                                                <Button
                                                    variant="outline-warning"
                                                    size="sm"
                                                    onClick={() => {
                                                        setProveedorEditar(proveedor);
                                                        setShowEditar(true);
                                                    }}
                                                    title="Editar proveedor"
                                                >
                                                    <Edit size={16} />
                                                    <span className="d-none d-md-inline ms-1">Editar</span>
                                                </Button>
                                                {proveedor.activo ? (
                                                    <Button
                                                        variant="outline-danger"
                                                        size="sm"
                                                        onClick={() => desactivarProveedor(proveedor.idProveedor)}
                                                        title="Desactivar proveedor"
                                                    >
                                                        <PowerOff size={16} />
                                                        <span className="d-none d-md-inline ms-1">Desactivar</span>
                                                    </Button>
                                                ) : (
                                                    <Button
                                                        variant="outline-success"
                                                        size="sm"
                                                        onClick={() => activarProveedor(proveedor.idProveedor)}
                                                        title="Activar proveedor"
                                                    >
                                                        <Power size={16} />
                                                        <span className="d-none d-md-inline ms-1">Activar</span>
                                                    </Button>
                                                )}
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
            <AgregarProveedor
                show={showAgregar}
                handleClose={() => setShowAgregar(false)}
                onProveedorAdded={() => {
                    obtenerProveedores();
                    mostrarNotificacion("Proveedor agregado exitosamente", "success");
                }}
            />
            <EditarProveedor
                show={showEditar}
                handleClose={() => setShowEditar(false)}
                proveedor={proveedorEditar}
                onProveedorUpdated={() => {
                    obtenerProveedores();
                    mostrarNotificacion("Proveedor actualizado exitosamente", "success");
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

export default ListarProveedores;
