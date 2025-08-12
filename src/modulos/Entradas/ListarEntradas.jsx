import { useEffect, useState } from "react";
import { Table, Button } from "react-bootstrap";
import AgregarEntrada from "./AgregarEntrada";
import EditarEntrada from "./EditarEntrada";
import { Plus } from "lucide-react";

function ListarEntradas() {
    const [entradas, setEntradas] = useState([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [entradaSeleccionada, setEntradaSeleccionada] = useState(null);

    const obtenerEntradas = async () => {
        try {
            const response = await fetch("http://localhost:8080/api/entradas");
            const data = await response.json();
            setEntradas(data);
        } catch (error) {
            console.error("Error al obtener entradas:", error);
        }
    };

    useEffect(() => {
        obtenerEntradas();
    }, []);

    const handleAgregarEntrada = () => {
        setShowAddModal(true);
    };

    const handleCerrarModalAgregar = () => {
        setShowAddModal(false);
    };

    const handleCerrarModalEditar = () => {
        setShowEditModal(false);
        setEntradaSeleccionada(null);
    };

    const handleEntradaAgregada = () => {
        obtenerEntradas();
        handleCerrarModalAgregar();
    };

    const handleEditar = (entrada) => {
        setEntradaSeleccionada(entrada);
        setShowEditModal(true);
    };

    const handleEliminacion = async (idEntrada) => {
        if (!window.confirm("¿Seguro que quieres eliminar esta entrada?")) return;

        try {
            await fetch(`http://localhost:8080/api/entradas/${idEntrada}`, { method: "DELETE" });
            obtenerEntradas();
        } catch (error) {
            console.error("Error al eliminar entrada:", error);
        }
    };

    return (
        <div className="container mt-4">
            <h2 className="mb-4">Lista de Entradas</h2>
            <Button variant="primary" onClick={handleAgregarEntrada} className="mb-3">
                <Plus size={16} /> Agregar Entrada
            </Button>

            <Table striped bordered hover>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Proveedor</th>
                        <th>Fecha</th>
                        <th>Total</th>
                        <th>Detalles</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {entradas?.map((entrada) => (
                        <tr key={entrada.idEntrada}>
                            <td>{entrada.idEntrada}</td>
                            <td>{entrada.proveedor?.nombre}</td>
                            <td>{entrada.fechaEntrada}</td>
                            <td>S/{entrada.totalEntrada?.toFixed(2)}</td>
                            <td>
                                <Table size="sm" bordered>
                                    <thead>
                                        <tr>
                                            <th>Producto</th>
                                            <th>Cantidad</th>
                                            <th>Precio Unitario</th>
                                            <th>Subtotal</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {entrada.detalles?.map((detalle, idx) => (
                                            <tr key={idx}>
                                                <td>{detalle.producto?.nombreProducto}</td>
                                                <td>{detalle.cantidad}</td>
                                                <td>S/{detalle.precioUnitario}</td>
                                                <td>S/{detalle.subtotal}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            </td>
                            <td>
                                <Button
                                    variant="warning"
                                    size="sm"
                                    className="me-2"
                                    onClick={() => handleEditar(entrada)}
                                >
                                    Editar
                                </Button>
                                <Button
                                    variant="danger"
                                    size="sm"
                                    onClick={() => handleEliminacion(entrada.idEntrada)}
                                >
                                    Eliminar
                                </Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>

            {/* Modal Agregar */}
            <AgregarEntrada
                show={showAddModal}
                handleClose={handleCerrarModalAgregar}
                onEntradaAgregada={handleEntradaAgregada}
            />

            {/* Modal Editar */}
            {entradaSeleccionada && (
                <EditarEntrada
                    show={showEditModal}
                    handleClose={handleCerrarModalEditar}
                    entrada={entradaSeleccionada}
                    onEntradaEditada={obtenerEntradas}
                />
            )}
        </div>
    );
}

export default ListarEntradas;
