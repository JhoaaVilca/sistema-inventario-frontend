import { useEffect, useState, useRef } from "react";
import AgregarProveedor from "./AgregarProveedor";
import EditarProveedor from "./EditarProveedor";
import { Edit, Trash2, Search, X } from "lucide-react";
import {
    Table,
    Button,
    InputGroup,
    FormControl,
} from "react-bootstrap";
import axios from "axios";

function ListarProveedores() {
    const [proveedores, setProveedores] = useState([]);
    const [proveedorEditar, setProveedorEditar] = useState(null);
    const [showAgregar, setShowAgregar] = useState(false);
    const [showEditar, setShowEditar] = useState(false);
    const [mostrarInput, setMostrarInput] = useState(false);
    const [filtro, setFiltro] = useState("");

    const inputRef = useRef(null);

    useEffect(() => {
        obtenerProveedores();
    }, []);

    const obtenerProveedores = async () => {
        try {
            const response = await axios.get("http://localhost:8080/api/proveedores");
            setProveedores(response.data);
        } catch (error) {
            console.error("Error al obtener proveedores:", error);
        }
    };

    const eliminarProveedor = async (id) => {
        if (window.confirm("¿Estás seguro de que deseas eliminar este proveedor?")) {
            try {
                await axios.delete(`http://localhost:8080/api/proveedores/${id}`);
                obtenerProveedores();
            } catch (error) {
                console.error("Error al eliminar proveedor:", error);
            }
        }
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
            <h3 className="text-center mb-4">Lista de Proveedores</h3>

            {/* Botón Agregar + Buscador */}
            <div className="d-flex justify-content-end align-items-center gap-2 mb-3">
                <Button variant="success" onClick={() => setShowAgregar(true)}>
                    + Agregar Proveedor
                </Button>

                {!mostrarInput ? (
                    <Button variant="outline-primary" onClick={() => setMostrarInput(true)}>
                        <Search size={18} />
                    </Button>
                ) : (
                    <InputGroup style={{ maxWidth: "250px" }}>
                        <FormControl
                            ref={inputRef}
                            autoFocus
                            placeholder="Buscar"
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

            {/* Tabla */}
            <Table striped bordered hover responsive>
                <thead className="table-dark text-center">
                    <tr>
                        <th>Id</th>
                        <th>Nombre</th>
                        <th>Tipo Documento</th>
                        <th>Número Documento</th>
                        <th>Dirección</th>
                        <th>Teléfono</th>
                        <th>Email</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody className="text-center align-middle">
                    {proveedoresFiltrados.map((proveedor, index) => (
                        <tr key={proveedor.idProveedor}>
                            <td>{index + 1}</td>
                            <td>{proveedor.nombre}</td>
                            <td>{proveedor.tipoDocumento}</td>
                            <td>{proveedor.numeroDocumento}</td>
                            <td>{proveedor.direccion}</td>
                            <td>{proveedor.telefono}</td>
                            <td>{proveedor.email}</td>
                            <td>
                                <div className="d-flex justify-content-center gap-2">
                                    <button
                                        className="btn btn-sm btn-outline-success d-flex align-items-center gap-1"
                                        onClick={() => {
                                            setProveedorEditar(proveedor);
                                            setShowEditar(true);
                                        }}
                                        title="Editar proveedor"
                                    >
                                        <Edit size={16} />
                                        <span className="d-none d-md-inline">Editar</span>
                                    </button>
                                    <button
                                        className="btn btn-sm btn-outline-danger d-flex align-items-center gap-1"
                                        onClick={() => eliminarProveedor(proveedor.idProveedor)}
                                        title="Eliminar proveedor"
                                    >
                                        <Trash2 size={16} />
                                        <span className="d-none d-md-inline">Eliminar</span>
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>

            {/* Modales */}
            <AgregarProveedor
                show={showAgregar}
                handleClose={() => setShowAgregar(false)}
                onProveedorAdded={obtenerProveedores}
            />
            <EditarProveedor
                show={showEditar}
                handleClose={() => setShowEditar(false)}
                proveedor={proveedorEditar}
                onProveedorUpdated={obtenerProveedores}
            />
        </div>
    );
}

export default ListarProveedores;
