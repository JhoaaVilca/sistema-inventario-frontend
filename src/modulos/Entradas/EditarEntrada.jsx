import { Modal, Button, Form, Alert, Row, Col } from "react-bootstrap";
import { useEffect, useState } from "react";
import apiClient from "../../servicios/apiClient";
import TablaProductosEntrada from "./TablaProductosEntrada";
import { Upload, Eye, FileText, X } from "lucide-react";

function EditarEntrada({ show, handleClose, entrada, onEntradaEditada }) {
    const [proveedores, setProveedores] = useState([]);
    const [idProveedor, setIdProveedor] = useState("");
    const [productosEntrada, setProductosEntrada] = useState([]);
    const [fechaEntrada, setFechaEntrada] = useState("");
    const [numeroFactura, setNumeroFactura] = useState("");
    const [observaciones, setObservaciones] = useState("");
    const [estado, setEstado] = useState("Registrada");
    const [errorMsg, setErrorMsg] = useState("");
    const [guardando, setGuardando] = useState(false);
    const [archivoFactura, setArchivoFactura] = useState(null);
    const [previewFactura, setPreviewFactura] = useState(null);

    useEffect(() => {
        const obtenerProveedores = async () => {
            try {
                const { data } = await apiClient.get("/proveedores/activos");
                setProveedores(data);
            } catch (error) {
                console.error("Error al obtener proveedores:", error);
            }
        };

        if (show && entrada) {
            obtenerProveedores();
            setIdProveedor(entrada.proveedor?.idProveedor || "");
            setFechaEntrada(entrada.fechaEntrada || "");
            setNumeroFactura(entrada.numeroFactura || "");
            setObservaciones(entrada.observaciones || "");
            setEstado(entrada.estado || "Registrada");
            setProductosEntrada(entrada.detalles || []);
            setArchivoFactura(null);
            setPreviewFactura(null);
        }
    }, [show, entrada]);

    const handleGuardarCambios = async () => {
        if (!idProveedor || productosEntrada.length === 0 || !fechaEntrada || !numeroFactura) {
            setErrorMsg("Complete proveedor, fecha, número de factura y al menos un producto.");
            return;
        }

        const totalEntrada = productosEntrada.reduce(
            (acc, detalle) => acc + (detalle.subtotal || 0),
            0
        );

        try {
            setGuardando(true);
            await apiClient.put(`/entradas/${entrada.idEntrada}`, {
                proveedor: { idProveedor: parseInt(idProveedor) },
                fechaEntrada,
                totalEntrada,
                numeroFactura,
                observaciones,
                estado,
                detalles: productosEntrada
            });

            // Si hay archivo de factura, subirlo
            if (archivoFactura) {
                await subirFactura(entrada.idEntrada);
            }

            onEntradaEditada();
            handleClose();
        } catch (error) {
            console.error("Error al editar entrada:", error);
            setErrorMsg("No se pudo guardar los cambios.");
        } finally {
            setGuardando(false);
        }
    };

    const subirFactura = async (idEntrada) => {
        if (!archivoFactura) return;

        const formData = new FormData();
        formData.append('file', archivoFactura);

        try {
            await apiClient.post(
                `/entradas/${idEntrada}/factura`,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );
        } catch (error) {
            console.error('Error al subir factura:', error);
            setErrorMsg("Entrada actualizada pero error al subir la factura.");
        }
    };

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        // Validar tipo de archivo
        const validTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
        if (!validTypes.includes(file.type)) {
            setErrorMsg('Solo se permiten archivos PDF o imágenes (JPG, PNG)');
            return;
        }

        // Validar tamaño (máximo 100MB)
        if (file.size > 100 * 1024 * 1024) {
            setErrorMsg('El archivo no puede ser mayor a 100MB');
            return;
        }

        setArchivoFactura(file);
        setErrorMsg("");

        // Crear preview para imágenes
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setPreviewFactura(e.target.result);
            };
            reader.readAsDataURL(file);
        } else {
            setPreviewFactura(null);
        }
    };

    const verFactura = () => {
        if (previewFactura) {
            window.open(previewFactura, '_blank');
        }
    };

    return (
        <Modal show={show} onHide={handleClose} size="lg">
            <Modal.Header closeButton>
                <Modal.Title>Editar Entrada</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {errorMsg && (
                    <Alert variant="danger" className="mb-3">{errorMsg}</Alert>
                )}
                <Form.Group className="mb-3">
                    <Form.Label>Proveedor</Form.Label>
                    <Form.Select
                        value={idProveedor}
                        onChange={(e) => setIdProveedor(e.target.value)}
                        disabled={guardando}
                    >
                        <option value="">Seleccione un proveedor</option>
                        {proveedores.map((p) => (
                            <option key={p.idProveedor} value={p.idProveedor}>
                                {p.nombre}
                            </option>
                        ))}
                    </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label>Fecha de Entrada</Form.Label>
                    <Form.Control
                        type="date"
                        value={fechaEntrada}
                        onChange={(e) => setFechaEntrada(e.target.value)}
                        disabled={guardando}
                    />
                </Form.Group>

                <Row>
                    <Col md={6}>
                        <Form.Group className="mb-3">
                            <Form.Label>Número de Factura *</Form.Label>
                            <Form.Control
                                type="text"
                                value={numeroFactura}
                                onChange={(e) => setNumeroFactura(e.target.value)}
                                placeholder="Ej: F001-00012345"
                                disabled={guardando}
                            />
                        </Form.Group>
                    </Col>
                    <Col md={6}>
                        <Form.Group className="mb-3">
                            <Form.Label>Estado</Form.Label>
                            <Form.Select
                                value={estado}
                                onChange={(e) => setEstado(e.target.value)}
                                disabled={guardando}
                            >
                                <option value="Registrada">Registrada</option>
                                <option value="Pendiente de pago">Pendiente de pago</option>
                                <option value="Anulada">Anulada</option>
                            </Form.Select>
                        </Form.Group>
                    </Col>
                </Row>

                <Form.Group className="mb-3">
                    <Form.Label>Observaciones</Form.Label>
                    <Form.Control
                        as="textarea"
                        rows={3}
                        value={observaciones}
                        onChange={(e) => setObservaciones(e.target.value)}
                        placeholder="Notas adicionales (ej: Productos con descuento por volumen)"
                        disabled={guardando}
                    />
                </Form.Group>

                <TablaProductosEntrada
                    productosEntrada={productosEntrada}
                    setProductosEntrada={setProductosEntrada}
                />
                <div className="mt-3">
                    <strong>Total de la Entrada: S/
                        {productosEntrada
                            .reduce((acc, detalle) => acc + (detalle.subtotal || 0), 0)
                            .toFixed(2)}
                    </strong>
                </div>

                {/* Sección de Factura */}
                <hr className="my-4" />
                <h6 className="mb-3">
                    <FileText size={20} className="me-2" />
                    Factura del Proveedor (Opcional)
                </h6>

                <div className="row">
                    <div className="col-md-8">
                        <Form.Group className="mb-3">
                            <Form.Label>Seleccionar archivo de factura</Form.Label>
                            <Form.Control
                                type="file"
                                accept=".pdf,.jpg,.jpeg,.png"
                                onChange={handleFileChange}
                                disabled={guardando}
                            />
                            <Form.Text className="text-muted">
                                Formatos permitidos: PDF, JPG, PNG. Tamaño máximo: 100MB
                            </Form.Text>
                        </Form.Group>
                    </div>
                    <div className="col-md-4 d-flex align-items-end">
                        {archivoFactura && (
                            <div className="d-flex gap-2">
                                <Button
                                    variant="outline-primary"
                                    size="sm"
                                    onClick={verFactura}
                                    disabled={!previewFactura}
                                >
                                    <Eye size={16} className="me-1" />
                                    Ver Preview
                                </Button>
                                <Button
                                    variant="outline-danger"
                                    size="sm"
                                    onClick={() => {
                                        setArchivoFactura(null);
                                        setPreviewFactura(null);
                                    }}
                                >
                                    <X size={16} className="me-1" />
                                    Quitar
                                </Button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Preview de la factura seleccionada */}
                {archivoFactura && (
                    <div className="mt-3 p-3 bg-light rounded border">
                        <div className="d-flex align-items-center">
                            <FileText size={20} className="text-primary me-2" />
                            <div>
                                <strong>{archivoFactura.name}</strong>
                                <br />
                                <small className="text-muted">
                                    {(archivoFactura.size / 1024 / 1024).toFixed(2)} MB
                                </small>
                            </div>
                        </div>
                    </div>
                )}
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose} disabled={guardando}>
                    Cancelar
                </Button>
                <Button variant="primary" onClick={handleGuardarCambios} disabled={guardando}>
                    Guardar Cambios
                </Button>
            </Modal.Footer>

        </Modal>
    );
}

export default EditarEntrada;
