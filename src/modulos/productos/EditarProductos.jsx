import { useEffect, useState } from "react";
import { Modal, Button, Form, Spinner, Alert, Row, Col } from "react-bootstrap";
import apiClient from "../../servicios/apiClient";
import { useCategorias } from "./useCategorias";

const EditarProducto = ({ show, handleClose, producto, onProductoUpdated }) => {
    const [nombreProducto, setNombreProducto] = useState("");
    const [precio, setPrecio] = useState(""); // Precio de venta
    const [precioCompra, setPrecioCompra] = useState(""); // Precio de compra
    const [stock, setStock] = useState("");
    const [stockMinimo, setStockMinimo] = useState("");
    const [unidadMedida, setUnidadMedida] = useState("");
    const [fechaIngreso, setFechaIngreso] = useState("");
    const [esPerecible, setEsPerecible] = useState(false);
    const [descripcionCorta, setDescripcionCorta] = useState("");
    const [categoria, setCategoria] = useState("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const { categorias } = useCategorias();


    useEffect(() => {
        if (producto) {
            setNombreProducto(producto.nombreProducto || "");
            setPrecio(producto.precio || ""); // Precio de venta
            setPrecioCompra(producto.precioCompra || ""); // Precio de compra
            setStock(producto.stock || "");
            setStockMinimo(producto.stockMinimo || "");
            setUnidadMedida(producto.unidadMedida || "");
            setFechaIngreso(producto.fechaIngreso || "");
            setEsPerecible(producto.esPerecible || false);
            setDescripcionCorta(producto.descripcionCorta || "");
            setCategoria(producto.idCategoria || "");
            setError("");
        }
    }, [producto]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!categoria) {
            setError("Por favor selecciona una categoría");
            return;
        }

        if (!unidadMedida) {
            setError("Por favor ingresa la unidad de medida");
            return;
        }


        setLoading(true);
        setError("");

        const productoActualizado = {
            nombreProducto,
            precio: parseFloat(precio), // Precio de venta
            precioCompra: parseFloat(precioCompra), // Precio de compra
            stock: parseInt(stock, 10),
            stockMinimo: parseInt(stockMinimo, 10),
            unidadMedida,
            fechaIngreso,
            esPerecible,
            descripcionCorta: descripcionCorta || null,
            idCategoria: parseInt(categoria, 10),
        };

        try {
            const response = await apiClient.put(
                `/productos/${producto.idProducto}`,
                productoActualizado
            );

            if (response.status === 200) {
                onProductoUpdated();
                handleClose();
            }
        } catch (error) {
            console.error("Error al actualizar producto:", error);
            
            if (error.response?.data?.error) {
                setError(error.response.data.error);
            } else if (error.response?.data?.message) {
                setError(error.response.data.message);
            } else {
                setError("Error al actualizar el producto. Intente nuevamente.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal show={show} onHide={handleClose} backdrop={loading ? "static" : true} size="xl" centered scrollable>
            <Modal.Header closeButton={!loading}>
                <Modal.Title>Editar Producto</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {error && (
                    <Alert variant="danger" dismissible onClose={() => setError("")}>
                        {error}
                    </Alert>
                )}
                <Form onSubmit={handleSubmit}>
                    {/* Información Básica */}
                    <Row>
                        <Col md={12}>
                            <Form.Group controlId="formNombreProducto" className="mb-3">
                                <Form.Label>Nombre del Producto <span className="text-danger">*</span></Form.Label>
                        <Form.Control
                            type="text"
                            value={nombreProducto}
                            onChange={(e) => setNombreProducto(e.target.value)}
                                    placeholder="Ingresa el nombre del producto"
                            required
                        />
                    </Form.Group>
                        </Col>
                    </Row>

                    <Row>
                        <Col md={12}>
                            <Form.Group controlId="formDescripcion" className="mb-3">
                                <Form.Label>Descripción Corta</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={2}
                                    value={descripcionCorta}
                                    onChange={(e) => setDescripcionCorta(e.target.value)}
                                    placeholder="Descripción breve del producto (opcional)"
                                />
                            </Form.Group>
                        </Col>
                    </Row>

                    {/* Precios */}
                    <Row>
                        <Col md={6}>
                            <Form.Group controlId="formPrecioCompra" className="mb-3">
                                <Form.Label>Precio de Compra <span className="text-danger">*</span></Form.Label>
                                <Form.Control
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={precioCompra}
                                    onChange={(e) => setPrecioCompra(e.target.value)}
                                    placeholder="0.00"
                                    required
                                />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group controlId="formPrecio" className="mb-3">
                                <Form.Label>Precio de Venta <span className="text-danger">*</span></Form.Label>
                        <Form.Control
                            type="number"
                                    step="0.01"
                                    min="0"
                            value={precio}
                            onChange={(e) => setPrecio(e.target.value)}
                                    placeholder="0.00"
                            required
                        />
                    </Form.Group>
                        </Col>
                    </Row>

                    {/* Stock e Inventario */}
                    <Row>
                        <Col md={4}>
                            <Form.Group controlId="formStock" className="mb-3">
                                <Form.Label>Stock Actual <span className="text-danger">*</span></Form.Label>
                        <Form.Control
                            type="number"
                                    min="0"
                            value={stock}
                            onChange={(e) => setStock(e.target.value)}
                                    placeholder="0"
                            required
                        />
                    </Form.Group>
                        </Col>
                        <Col md={4}>
                            <Form.Group controlId="formStockMinimo" className="mb-3">
                                <Form.Label>Stock Mínimo <span className="text-danger">*</span></Form.Label>
                        <Form.Control
                                    type="number"
                                    min="0"
                                    value={stockMinimo}
                                    onChange={(e) => setStockMinimo(e.target.value)}
                                    placeholder="0"
                            required
                        />
                    </Form.Group>
                        </Col>
                        <Col md={4}>
                            <Form.Group controlId="formUnidadMedida" className="mb-3">
                                <Form.Label>Unidad de Medida <span className="text-danger">*</span></Form.Label>
                                <Form.Select
                                    value={unidadMedida}
                                    onChange={(e) => setUnidadMedida(e.target.value)}
                                    required
                                >
                                    <option value="">Selecciona unidad</option>
                                    <option value="unidad">Unidad</option>
                                    <option value="kg">Kilogramo (kg)</option>
                                    <option value="g">Gramo (g)</option>
                                    <option value="litro">Litro (L)</option>
                                    <option value="ml">Mililitro (ml)</option>
                                    <option value="caja">Caja</option>
                                    <option value="paquete">Paquete</option>
                                    <option value="bolsa">Bolsa</option>
                                    <option value="botella">Botella</option>
                                    <option value="lata">Lata</option>
                                </Form.Select>
                            </Form.Group>
                        </Col>
                    </Row>

                    {/* Categoría y Proveedor */}
                    <Row>
                        <Col md={6}>
                            <Form.Group controlId="formCategoria" className="mb-3">
                                <Form.Label>Categoría <span className="text-danger">*</span></Form.Label>
                        <Form.Select
                            value={categoria}
                            onChange={(e) => setCategoria(e.target.value)}
                            required
                        >
                                    <option value="">Selecciona una categoría</option>
                            {categorias.map((cat) => (
                                <option key={cat.idCategoria} value={cat.idCategoria}>
                                    {cat.nombre}
                                </option>
                            ))}
                        </Form.Select>
                    </Form.Group>
                        </Col>
                    </Row>

                    {/* Fechas */}
                    <Row>
                        <Col md={6}>
                            <Form.Group controlId="formFechaIngreso" className="mb-3">
                                <Form.Label>Fecha de Ingreso <span className="text-danger">*</span></Form.Label>
                                <Form.Control
                                    type="date"
                                    value={fechaIngreso}
                                    onChange={(e) => setFechaIngreso(e.target.value)}
                                    required
                                />
                            </Form.Group>
                        </Col>
                        
                    </Row>

                    {/* Fecha de Vencimiento (condicional) */}

                    <div className="d-flex flex-column flex-sm-row justify-content-end gap-2 mt-4">
                        <Button
                            variant="secondary"
                            onClick={handleClose}
                            disabled={loading}
                            className="w-100 w-sm-auto"
                        >
                            Cancelar
                        </Button>
                        <Button
                            variant="primary"
                            type="submit"
                            disabled={loading}
                            className="w-100 w-sm-auto"
                        >
                            {loading ? (
                                <>
                                    <Spinner
                                        as="span"
                                        animation="border"
                                        size="sm"
                                        role="status"
                                        aria-hidden="true"
                                    /> Guardando...
                                </>
                            ) : (
                                "Guardar Cambios"
                            )}
                        </Button>
                    </div>
                </Form>
            </Modal.Body>
        </Modal>
    );
};

export default EditarProducto;
