import { useEffect, useState } from "react";
import AgregarProveedor from "./AgregarProveedor";
import EditarProveedor from "./EditarProveedor";
import { Edit, Trash2, Plus } from "lucide-react";
function ListarProveedores() {
    const [proveedores, setProveedores] = useState([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [proveedorEditar, setProveedorEditar] = useState(null);

    useEffect(() => {
        cargarProveedores();
    }, []);

    const cargarProveedores = () => {
        fetch("http://localhost:8080/api/proveedores")
            .then((res) => res.json())
            .then((data) => setProveedores(data))
            .catch(() => alert("Error al cargar proveedores."));
    };

    const handleOpenAddModal = () => setShowAddModal(true);
    const handleCloseAddModal = () => setShowAddModal(false);

    const handleProveedorAgregado = (nuevoProveedor) => {
        setProveedores((prev) => [...prev, nuevoProveedor]);
        handleCloseAddModal();
    };

    const handleEditarClick = (proveedor) => {
        setProveedorEditar(proveedor);
        setShowEditModal(true);
    };

    const handleProveedorEditado = (proveedorActualizado) => {
        setProveedores((prev) =>
            prev.map((prov) =>
                prov.idProveedor === proveedorActualizado.idProveedor
                    ? proveedorActualizado
                    : prov
            )
        );
        setShowEditModal(false);
    };

    const handleEliminarProveedor = (idProveedor) => {
        const confirmar = window.confirm("¿Estás segura de eliminar este proveedor?");
        if (!confirmar) return;

        fetch(`http://localhost:8080/api/proveedores/${idProveedor}`, {
            method: "DELETE",
        })
            .then((res) => {
                if (res.ok) {
                    setProveedores((prev) =>
                        prev.filter((p) => p.idProveedor !== idProveedor)
                    );
                } else {
                    alert("Error al eliminar proveedor.");
                }
            })
            .catch(() => alert("Error de red al eliminar proveedor."));
    };

    return (
        <div className="container mt-4">
            <h2 className="mb-4 text-center">Lista de Proveedores</h2>

            <div className="d-flex justify-content-end mb-3">
                <button
                    className="btn btn-primary d-flex align-items-center gap-2"
                    onClick={handleOpenAddModal}
                >
                    <Plus size={18} />
                    <span>Agregar Proveedor</span>
                </button>
            </div>


            <table className="table table-striped table-bordered">
                <thead className="table-dark">
                    <tr>
                        <th>Nombre</th>
                        <th>Tipo Doc.</th>
                        <th>N° Doc.</th>
                        <th>Dirección</th>
                        <th>Teléfono</th>
                        <th>Email</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {proveedores.map((p) => (
                        <tr key={p.idProveedor}>
                            <td>{p.nombre}</td>
                            <td>{p.tipoDocumento}</td>
                            <td>{p.numeroDocumento}</td>
                            <td>{p.direccion}</td>
                            <td>{p.telefono}</td>
                            <td>{p.email}</td>
                            <td>
                                <div className="d-flex gap-2">
                                    <button
                                        className="btn btn-sm btn-outline-success d-flex align-items-center gap-1"
                                        onClick={() => handleEditarClick(p)}
                                        title="Editar proveedor"
                                    >
                                        <Edit size={16} />
                                        <span className="d-none d-md-inline">Editar</span>
                                    </button>
                                    <button
                                        className="btn btn-sm btn-outline-danger d-flex align-items-center gap-1"
                                        onClick={() => handleEliminarProveedor(p.idProveedor)}
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
            </table>

            <AgregarProveedor
                show={showAddModal}
                handleClose={handleCloseAddModal}
                onProveedorAdded={handleProveedorAgregado}
            />

            {proveedorEditar && (
                <EditarProveedor
                    show={showEditModal}
                    handleClose={() => setShowEditModal(false)}
                    proveedor={proveedorEditar}
                    onProveedorEditado={handleProveedorEditado}
                />
            )}
        </div>
    );
}

export default ListarProveedores;
