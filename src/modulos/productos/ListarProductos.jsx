import { useEffect, useState, useRef } from "react";
import AgregarProducto from "./AgregarProductos";
import EditarProducto from "./EditarProductos";
import { Edit, Trash2, Search, X } from "lucide-react";
import {
    Table,
    Button,
    InputGroup,
    FormControl,
} from "react-bootstrap";
import axios from "axios";

function ListarProductos() {
    const [productos, setProductos] = useState([]);
    const [productoEditar, setProductoEditar] = useState(null);
    const [showAgregar, setShowAgregar] = useState(false);
    const [showEditar, setShowEditar] = useState(false);
    const [mostrarInput, setMostrarInput] = useState(false);
    const [filtro, setFiltro] = useState("");

    const inputRef = useRef(null);

    useEffect(() => {
        obtenerProductos();
    }, []);

    const obtenerProductos = async () => {
        try {
            const response = await axios.get("http://localhost:8080/api/productos");
            setProductos(response.data);
        } catch (error) {
            console.error("Error al obtener productos:", error);
        }
    };

    const eliminarProducto = async (id) => {
        if (window.confirm("¿Estás seguro de que deseas eliminar este producto?")) {
            try {
                await axios.delete(`http://localhost:8080/api/productos/${id}`);
                obtenerProductos();
            } catch (error) {
                console.error("Error al eliminar producto:", error);
            }
        }
    };

    const limpiarBuscador = () => {
        setFiltro("");
        setMostrarInput(false);
        inputRef.current?.blur();
    };

    const productosFiltrados = productos.filter((producto) =>
        producto.nombreProducto.toLowerCase().includes(filtro.toLowerCase())
    );

    return (
        <div className="container mt-4">
            <h3 className="text-center mb-4">Lista de Productos</h3>

            {/* Botón Agregar + Buscador */}
            <div className="d-flex justify-content-end align-items-center gap-2 mb-3">
                <Button variant="success" onClick={() => setShowAgregar(true)}>
                    + Agregar Producto
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
                        <th>Precio</th>
                        <th>Categoria</th>
                        <th>Stock</th>
                        <th>Fecha Ingreso</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody className="text-center align-middle">
                    {productosFiltrados.map((producto, index) => (
                        <tr key={producto.idProducto}>
                            <td>{index + 1}</td>
                            <td>{producto.nombreProducto}</td>
                            <td>S/. {producto.precio}</td>
                            <td>{producto.categoria}</td>
                            <td>{producto.stock}</td>
                            <td>{producto.fechaIngreso?.split("T")[0]}</td>
                            <td>
                                <div className="d-flex justify-content-center gap-2">
                                    <button
                                        className="btn btn-sm btn-outline-success d-flex align-items-center gap-1"
                                        onClick={() => {
                                            setProductoEditar(producto);
                                            setShowEditar(true);
                                        }}
                                        title="Editar producto"
                                    >
                                        <Edit size={16} />
                                        <span className="d-none d-md-inline">Editar</span>
                                    </button>
                                    <button
                                        className="btn btn-sm btn-outline-danger d-flex align-items-center gap-1"
                                        onClick={() => eliminarProducto(producto.idProducto)}
                                        title="Eliminar producto"
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
            <AgregarProducto
                show={showAgregar}
                handleClose={() => setShowAgregar(false)}
                onProductoAdded={obtenerProductos}
            />
            <EditarProducto
                show={showEditar}
                handleClose={() => setShowEditar(false)}
                producto={productoEditar}
                onProductoEditado={obtenerProductos} // nombre correcto
            />

        </div>
    );
}

export default ListarProductos;
