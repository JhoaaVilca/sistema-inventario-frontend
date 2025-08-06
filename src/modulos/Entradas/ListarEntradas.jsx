// modulos/entradas/ListarEntradas.jsx
import { useEffect, useState } from "react";
import { Table, Button } from "react-bootstrap";
import AgregarEntrada from "./AgregarEntrada";
import { Plus } from "lucide-react";

function ListarEntradas() {
    const [entradas, setEntradas] = useState([]);
    const [showAddModal, setShowAddModal] = useState(false);

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

    const handleCerrarModal = () => {
        setShowAddModal(false);
    };

    const handleEntradaAgregada = () => {
        obtenerEntradas();
        handleCerrarModal();
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
                                                <td>{detalle.producto?.nombreProducto || detalle.producto?.nombre || detalle.producto?.idProducto}</td>
                                                <td>{detalle.cantidad}</td>
                                                <td>S/{detalle.precioUnitario}</td>
                                                <td>S/{detalle.subtotal}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>

            <AgregarEntrada
                show={showAddModal}
                handleClose={handleCerrarModal}
                onEntradaAgregada={handleEntradaAgregada}
            />
        </div>
    );
}

export default ListarEntradas;
