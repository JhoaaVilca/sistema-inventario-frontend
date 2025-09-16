// src/modulos/Entradas/AgregarEntrada.jsx

import { Modal, Button, Form, Alert, Row, Col, Card, Badge, OverlayTrigger, Tooltip } from "react-bootstrap";
import { useEffect, useState } from "react";
import axios from "axios";
import TablaProductosEntrada from "./TablaProductosEntrada";
import { Upload, Eye, FileText, X, CheckCircle, AlertCircle, Info } from "lucide-react";

function AgregarEntrada({ show, handleClose, onEntradaAgregada }) {
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
    const [entradaCreada, setEntradaCreada] = useState(null);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState("");
    const [toastType, setToastType] = useState("success");

    useEffect(() => {
        const obtenerProveedores = async () => {
            try {
                const response = await axios.get(
                    "http://localhost:8080/api/proveedores/activos"
                );
                setProveedores(response.data);
            } catch (error) {
                console.error("Error al obtener proveedores:", error);
            }
        };
        if (show) {
            obtenerProveedores();
            setIdProveedor("");
            setProductosEntrada([]);
            setFechaEntrada("");
            setNumeroFactura("");
            setObservaciones("");
            setEstado("Registrada");
            setErrorMsg("");
            setArchivoFactura(null);
            setPreviewFactura(null);
            setEntradaCreada(null);
        }
    }, [show]);

    const handleGuardar = async () => {
        if (!idProveedor || productosEntrada.length === 0 || !fechaEntrada || !numeroFactura) {
            setErrorMsg("Complete proveedor, fecha, número de factura y al menos un producto.");
            return;
        }

        // Calcular el total sumando los subtotales
        const totalEntrada = productosEntrada.reduce((acc, detalle) => acc + (detalle.subtotal || 0), 0);

        try {
            setGuardando(true);
            const response = await axios.post("http://localhost:8080/api/entradas", {
                proveedor: { idProveedor: parseInt(idProveedor) },
                fechaEntrada,
                totalEntrada,
                numeroFactura,
                observaciones,
                estado,
                detalles: productosEntrada
            });
            
            // Guardar la entrada creada para subir factura después
            setEntradaCreada(response.data);
            
            // Si hay archivo de factura, subirlo
            if (archivoFactura) {
                await subirFactura(response.data.idEntrada);
            }
            
            onEntradaAgregada();
            handleClose();
        } catch (error) {
            console.error("Error al guardar entrada:", error);
            setErrorMsg("No se pudo guardar la entrada.");
        } finally {
            setGuardando(false);
        }
    };

    const subirFactura = async (idEntrada) => {
        if (!archivoFactura) return;

        const formData = new FormData();
        formData.append('file', archivoFactura);

        try {
            await axios.post(
                `http://localhost:8080/api/entradas/${idEntrada}/factura`,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );
        } catch (error) {
            console.error('Error al subir factura:', error);
            setErrorMsg("Entrada guardada pero error al subir la factura.");
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

    // Calcular resumen de la entrada
    const calcularResumen = () => {
        const totalProductos = productosEntrada.length;
        const subtotal = productosEntrada.reduce((acc, detalle) => acc + (detalle.subtotal || 0), 0);
        const igv = subtotal * 0.18; // 18% IGV
        const total = subtotal + igv;
        
        return {
            totalProductos,
            subtotal,
            igv,
            total
        };
    };

    // Validar si el formulario está completo
    const esFormularioValido = () => {
        return idProveedor && productosEntrada.length > 0 && fechaEntrada && numeroFactura;
    };

    // Mostrar toast
    const mostrarToast = (mensaje, tipo = "success") => {
        setToastMessage(mensaje);
        setToastType(tipo);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
    };

    return (
        <Modal show={show} onHide={handleClose} size="xl" centered>
            <Modal.Header closeButton>
                <Modal.Title>Agregar Entrada</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {errorMsg && (
                    <Alert variant="danger" className="mb-3">{errorMsg}</Alert>
                )}
                <Row>
                    <Col md={6}>
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
                    </Col>
                    <Col md={6}>
                        <Form.Group className="mb-3">
                            <Form.Label>Fecha de Entrada</Form.Label>
                            <Form.Control
                                type="date"
                                value={fechaEntrada}
                                onChange={(e) => setFechaEntrada(e.target.value)}
                                disabled={guardando}
                            />
                        </Form.Group>
                    </Col>
                </Row>

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

                <Row>
                    <Col md={12}>
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
                    </Col>
                </Row>

                <TablaProductosEntrada 
                    productosEntrada={productosEntrada} 
                    setProductosEntrada={setProductosEntrada}
                    onProductoAgregado={mostrarToast}
                />
                <div className="mt-3">
                    <strong>Total de la Entrada: S/{productosEntrada.reduce((acc, detalle) => acc + (detalle.subtotal || 0), 0).toFixed(2)}</strong>
                </div>

                {/* Sección de Factura */}
                <hr className="my-4" />
                <h6 className="mb-3">
                    <FileText size={20} className="me-2" />
                    Factura del Proveedor (Opcional)
                </h6>
                
                <Row>
                    <Col md={8}>
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
                    </Col>
                    <Col md={4} className="d-flex align-items-end">
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
                    </Col>
                </Row>

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

                {/* Resumen de la Entrada */}
                {productosEntrada.length > 0 && (
                    <Card className="mt-4 border-0 shadow-sm">
                        <Card.Header className="bg-primary text-white">
                            <h6 className="mb-0 d-flex align-items-center">
                                <Info size={20} className="me-2" />
                                📋 Resumen de la Entrada
                            </h6>
                        </Card.Header>
                        <Card.Body>
                            <Row>
                                <Col md={6}>
                                    <div className="mb-2">
                                        <strong>Proveedor:</strong> 
                                        <span className="text-muted ms-2">
                                            {proveedores.find(p => p.idProveedor === parseInt(idProveedor))?.nombre || 'No seleccionado'}
                                        </span>
                                    </div>
                                    <div className="mb-2">
                                        <strong>Fecha:</strong> 
                                        <span className="text-muted ms-2">{fechaEntrada || 'No seleccionada'}</span>
                                    </div>
                                    <div className="mb-2">
                                        <strong>N° Factura:</strong> 
                                        <span className="text-muted ms-2">{numeroFactura || 'No ingresado'}</span>
                                    </div>
                                    <div className="mb-2">
                                        <strong>Estado:</strong> 
                                        <Badge bg={estado === 'Registrada' ? 'success' : estado === 'Pendiente de pago' ? 'warning' : 'danger'} className="ms-2">
                                            {estado}
                                        </Badge>
                                    </div>
                                    <div className="mb-2">
                                        <strong>Total de Productos:</strong> 
                                        <Badge bg="info" className="ms-2">{calcularResumen().totalProductos}</Badge>
                                    </div>
                                </Col>
                                <Col md={6}>
                                    <div className="text-end">
                                        <div className="mb-2">
                                            <strong>Subtotal:</strong> 
                                            <span className="text-muted ms-2">S/ {calcularResumen().subtotal.toFixed(2)}</span>
                                        </div>
                                        <div className="mb-2">
                                            <strong>IGV (18%):</strong> 
                                            <span className="text-muted ms-2">S/ {calcularResumen().igv.toFixed(2)}</span>
                                        </div>
                                        <div className="border-top pt-2">
                                            <strong className="text-primary fs-5">Total a Pagar:</strong> 
                                            <span className="text-primary fs-5 ms-2">S/ {calcularResumen().total.toFixed(2)}</span>
                                        </div>
                                    </div>
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>
                )}
            </Modal.Body>
            <Modal.Footer>
                <div className="d-flex flex-column flex-sm-row justify-content-end gap-2 w-100">
                    <Button variant="secondary" onClick={handleClose} disabled={guardando} className="w-100 w-sm-auto">
                        Cancelar
                    </Button>
                    <OverlayTrigger
                        placement="top"
                        overlay={
                            <Tooltip>
                                {!esFormularioValido() ? (
                                    <div>
                                        <div>❌ Complete todos los campos requeridos:</div>
                                        {!idProveedor && <div>• Seleccione un proveedor</div>}
                                        {productosEntrada.length === 0 && <div>• Agregue al menos un producto</div>}
                                        {!fechaEntrada && <div>• Seleccione una fecha</div>}
                                        {!numeroFactura && <div>• Ingrese el número de factura</div>}
                                    </div>
                                ) : (
                                    <div>
                                        ✅ Formulario completo<br/>
                                        Listo para guardar
                                    </div>
                                )}
                            </Tooltip>
                        }
                    >
                        <span>
                            <Button 
                                variant={esFormularioValido() ? "primary" : "outline-secondary"} 
                                onClick={handleGuardar} 
                                disabled={guardando || !esFormularioValido()} 
                                className="w-100 w-sm-auto"
                            >
                                {guardando ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                        Guardando...
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle size={16} className="me-2" />
                                        Guardar Entrada
                                    </>
                                )}
                            </Button>
                        </span>
                    </OverlayTrigger>
                </div>
            </Modal.Footer>

            {/* Toast de notificaciones */}
            {showToast && (
                <div className="position-fixed top-0 end-0 p-3" style={{ zIndex: 9999 }}>
                    <div className={`toast show ${toastType === 'success' ? 'bg-success' : 'bg-danger'} text-white`} role="alert">
                        <div className="toast-header bg-transparent text-white border-0">
                            <strong className="me-auto">
                                {toastType === 'success' ? '✅ Éxito' : '❌ Error'}
                            </strong>
                            <button 
                                type="button" 
                                className="btn-close btn-close-white" 
                                onClick={() => setShowToast(false)}
                            ></button>
                        </div>
                        <div className="toast-body">
                            {toastMessage}
                        </div>
                    </div>
                </div>
            )}

        </Modal>
    );
}

export default AgregarEntrada;
