import { useState } from "react";
import { Card, Row, Col, Badge, Button, Collapse, Table } from "react-bootstrap";
import {
    Package,
    Calendar,
    Building,
    Receipt,
    ChevronDown,
    ChevronUp,
    Truck,
    Hash,
    Eye,
    Upload
} from "lucide-react";

const DetalleEntrada = ({
    entrada,
    isOpen,
    onToggle,
    onVerFactura,
    onSubirFactura,
    resolverFacturaUrl,
    ocultarHeader = false
}) => {
    const [detallesAbiertos, setDetallesAbiertos] = useState(false);

    const calcularTotal = () => {
        if (entrada?.total && entrada.total > 0) return entrada.total;
        if (Array.isArray(entrada?.detalles)) {
            return entrada.detalles.reduce((acc, d) => {
                const s = d?.subtotal;
                if (s && s > 0) return acc + s;
                const qty = Number(d?.cantidad) || 0;
                const pu = Number(d?.precioUnitario) || 0;
                return acc + qty * pu;
            }, 0);
        }
        return 0;
    };

    const totalMostrado = calcularTotal();

    const formatearFecha = (fecha) => {
        if (!fecha) return "-";
        return new Date(fecha).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const formatearMoneda = (monto) => {
        return new Intl.NumberFormat('es-PE', {
            style: 'currency',
            currency: 'PEN'
        }).format(monto || 0);
    };

    const getEstadoBadge = (estado) => {
        const estados = {
            'Pendiente': { variant: 'warning', text: 'Pendiente' },
            'Completado': { variant: 'success', text: 'Completado' },
            'Cancelado': { variant: 'danger', text: 'Cancelado' }
        };
        const estadoInfo = estados[estado] || { variant: 'secondary', text: estado || 'Sin estado' };
        return <Badge bg={estadoInfo.variant}>{estadoInfo.text}</Badge>;
    };

    if (ocultarHeader) {
        // Renderiza solo el contenido de detalle (para usarse dentro de un Modal)
        return (
            <div>
                <div className="p-0">
                    <div className="p-0">
                        {/* Acciones: visibles en modal */}
                        <div className="d-flex justify-content-end gap-2 mb-3">
                            {entrada?.facturaUrl && (
                                <Button
                                    variant="outline-primary"
                                    size="sm"
                                    onClick={() => onVerFactura && onVerFactura(entrada)}
                                    className="d-flex align-items-center"
                                >
                                    <Eye size={16} className="me-1" /> Ver factura
                                </Button>
                            )}
                            <Button
                                variant="primary"
                                size="sm"
                                onClick={() => onSubirFactura && onSubirFactura(entrada)}
                                className="d-flex align-items-center"
                            >
                                <Upload size={16} className="me-1" /> {entrada?.facturaUrl ? 'Actualizar factura' : 'Subir factura'}
                            </Button>
                        </div>
                        {/* Información General */}
                        <Row className="mb-4">
                            <Col md={6}>
                                <Card className="h-100 border-0 bg-light">
                                    <Card.Body>
                                        <div className="d-flex align-items-center mb-3">
                                            <div className="p-2 bg-primary bg-opacity-10 rounded-3 me-3">
                                                <Receipt size={20} className="text-primary" />
                                            </div>
                                            <h6 className="mb-0 text-dark fw-semibold">Información General</h6>
                                        </div>
                                        <div className="row g-2">
                                            <div className="col-6">
                                                <small className="text-muted d-block">Número de Factura</small>
                                                <span className="fw-medium">{entrada.numeroFactura || "-"}</span>
                                            </div>
                                            <div className="col-6">
                                                <small className="text-muted d-block">Fecha de Entrada</small>
                                                <span className="fw-medium">{formatearFecha(entrada.fechaEntrada)}</span>
                                            </div>
                                            <div className="col-6">
                                                <small className="text-muted d-block">Estado</small>
                                                <div>{getEstadoBadge(entrada.estado)}</div>
                                            </div>
                                            <div className="col-6">
                                                <small className="text-muted d-block">Total</small>
                                                <span className="fw-bold text-success">{formatearMoneda(totalMostrado)}</span>
                                            </div>
                                        </div>
                                    </Card.Body>
                                </Card>
                            </Col>
                            <Col md={6}>
                                <Card className="h-100 border-0 bg-light">
                                    <Card.Body>
                                        <div className="d-flex align-items-center mb-3">
                                            <div className="p-2 bg-primary bg-opacity-10 rounded-3 me-3">
                                                <Building size={20} className="text-primary" />
                                            </div>
                                            <h6 className="mb-0 text-dark fw-semibold">Proveedor</h6>
                                        </div>
                                        {entrada.proveedor ? (
                                            <div>
                                                <h6 className="mb-1 fw-semibold">{entrada.proveedor.nombre}</h6>
                                                <small className="text-muted d-block">
                                                    <Hash size={12} className="me-1" />
                                                    {entrada.proveedor.tipoDocumento} {entrada.proveedor.numeroDocumento}
                                                </small>
                                                {entrada.proveedor.telefono && (
                                                    <small className="text-muted d-block">
                                                        📞 {entrada.proveedor.telefono}
                                                    </small>
                                                )}
                                                {entrada.proveedor.email && (
                                                    <small className="text-muted d-block">
                                                        ✉️ {entrada.proveedor.email}
                                                    </small>
                                                )}
                                            </div>
                                        ) : (
                                            <span className="text-muted">Sin proveedor asignado</span>
                                        )}
                                    </Card.Body>
                                </Card>
                            </Col>
                        </Row>
                        {/* Productos */}
                        <Card className="border-0 bg-light">
                            <Card.Header
                                className="bg-white border-bottom"
                            >
                                <div className="d-flex justify-content-between align-items-center">
                                    <div className="d-flex align-items-center">
                                        <div className="p-2 bg-primary bg-opacity-10 rounded-3 me-3">
                                            <Package size={20} className="text-primary" />
                                        </div>
                                        <h6 className="mb-0 text-dark fw-semibold">
                                            Productos ({entrada.detalles?.length || 0})
                                        </h6>
                                    </div>
                                </div>
                            </Card.Header>
                            <Card.Body className="p-0">
                                {entrada.detalles && entrada.detalles.length > 0 ? (
                                    <div className="table-responsive">
                                        <Table hover className="mb-0">
                                            <thead className="table-light">
                                                <tr>
                                                    <th className="fw-semibold py-3">Producto</th>
                                                    <th className="fw-semibold py-3 text-center">Cantidad</th>
                                                    <th className="fw-semibold py-3 text-end">Precio Unit.</th>
                                                    <th className="fw-semibold py-3 text-end">Subtotal</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {entrada.detalles.map((detalle, idx) => (
                                                    <tr key={idx}>
                                                        <td>
                                                            <div>
                                                                <div className="fw-medium">{detalle.producto?.nombreProducto}</div>
                                                                <small className="text-muted">
                                                                    {detalle.producto?.unidadMedida}
                                                                </small>
                                                            </div>
                                                        </td>
                                                        <td className="text-center">
                                                            <Badge bg="primary" className="px-2 py-1">
                                                                {detalle.cantidad}
                                                            </Badge>
                                                        </td>
                                                        <td className="text-end fw-medium">
                                                            {formatearMoneda(detalle.precioUnitario)}
                                                        </td>
                                                        <td className="text-end fw-bold text-success">
                                                            {formatearMoneda(detalle.subtotal)}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                            <tfoot className="table-light">
                                                <tr>
                                                    <th colSpan="3" className="text-end py-3">Total:</th>
                                                    <th className="text-end py-3 text-success">
                                                        {formatearMoneda(totalMostrado)}
                                                    </th>
                                                </tr>
                                            </tfoot>
                                        </Table>
                                    </div>
                                ) : (
                                    <div className="text-center py-4 text-muted">
                                        No hay productos registrados
                                    </div>
                                )}
                            </Card.Body>
                        </Card>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <Card className="mb-3 border-0 shadow-sm">
            <Card.Header
                className="bg-white border-bottom"
                onClick={onToggle}
                style={{ cursor: 'pointer' }}
            >
                <div className="d-flex flex-wrap align-items-center gap-3">
                    {/* Izquierda: proveedor y documento */}
                    <div className="d-flex align-items-center">
                        <Truck size={20} className="me-2 text-primary" />
                        <div>
                            <div className="d-flex align-items-center gap-2">
                                <h6 className="mb-0">{entrada?.proveedor?.nombre || 'Sin proveedor'}</h6>
                                {entrada?.numeroFactura || entrada?.facturaUrl ? (
                                    <Badge bg="success" className="ms-1">
                                        {entrada?.numeroFactura ? `Factura ${entrada.numeroFactura}` : 'Factura adjunta'}
                                    </Badge>
                                ) : (
                                    <Badge bg="secondary" className="ms-1">Sin factura</Badge>
                                )}
                            </div>
                            <small className="text-muted">
                                {formatearFecha(entrada.fechaEntrada)}
                            </small>
                        </div>
                    </div>
                    {/* Derecha: bloque total + estado alineado y chevron al extremo */}
                    <div className="ms-auto d-flex align-items-center gap-3">
                        <div className="text-end">
                            <small className="text-muted d-block">Total</small>
                            <span className="fw-bold text-success">{formatearMoneda(totalMostrado)}</span>
                        </div>
                        {getEstadoBadge(entrada.estado)}
                    </div>
                    <div className="d-flex align-items-center">
                        {isOpen ? <ChevronUp size={20} className="ms-1" /> : <ChevronDown size={20} className="ms-1" />}
                    </div>
                </div>
                {/* Miniatura si la factura es imagen */}
                {entrada?.facturaUrl && /\.(jpg|jpeg|png)$/i.test(entrada.facturaUrl) && (
                    <div className="mt-3">
                        <img
                            src={resolverFacturaUrl ? resolverFacturaUrl(entrada) : entrada.facturaUrl}
                            alt="Factura adjunta"
                            style={{ maxHeight: 80, borderRadius: 6 }}
                            className="border"
                            onClick={(e) => { e.stopPropagation(); onVerFactura && onVerFactura(entrada); }}
                        />
                    </div>
                )}
            </Card.Header>

            <Collapse in={isOpen}>
                <Card.Body className="p-0">
                    <div className="p-4">
                        {/* Acciones: solo visibles al expandir */}
                        <div className="d-flex justify-content-end gap-2 mb-3">
                            {entrada?.facturaUrl && (
                                <Button
                                    variant="outline-primary"
                                    size="sm"
                                    onClick={() => onVerFactura && onVerFactura(entrada)}
                                    className="d-flex align-items-center"
                                >
                                    <Eye size={16} className="me-1" /> Ver factura
                                </Button>
                            )}
                            <Button
                                variant="primary"
                                size="sm"
                                onClick={() => onSubirFactura && onSubirFactura(entrada)}
                                className="d-flex align-items-center"
                            >
                                <Upload size={16} className="me-1" /> {entrada?.facturaUrl ? 'Actualizar factura' : 'Subir factura'}
                            </Button>
                        </div>
                        {/* Información General */}
                        <Row className="mb-4">
                            <Col md={6}>
                                <Card className="h-100 border-0 bg-light">
                                    <Card.Body>
                                        <div className="d-flex align-items-center mb-3">
                                            <div className="p-2 bg-primary bg-opacity-10 rounded-3 me-3">
                                                <Receipt size={20} className="text-primary" />
                                            </div>
                                            <h6 className="mb-0 text-dark fw-semibold">Información General</h6>
                                        </div>
                                        <div className="row g-2">
                                            <div className="col-6">
                                                <small className="text-muted d-block">Número de Factura</small>
                                                <span className="fw-medium">{entrada.numeroFactura || "-"}</span>
                                            </div>
                                            <div className="col-6">
                                                <small className="text-muted d-block">Fecha de Entrada</small>
                                                <span className="fw-medium">{formatearFecha(entrada.fechaEntrada)}</span>
                                            </div>
                                            <div className="col-6">
                                                <small className="text-muted d-block">Estado</small>
                                                <div>{getEstadoBadge(entrada.estado)}</div>
                                            </div>
                                            <div className="col-6">
                                                <small className="text-muted d-block">Total</small>
                                                <span className="fw-bold text-success">{formatearMoneda(totalMostrado)}</span>
                                            </div>
                                        </div>
                                    </Card.Body>
                                </Card>
                            </Col>
                            <Col md={6}>
                                <Card className="h-100 border-0 bg-light">
                                    <Card.Body>
                                        <div className="d-flex align-items-center mb-3">
                                            <div className="p-2 bg-primary bg-opacity-10 rounded-3 me-3">
                                                <Building size={20} className="text-primary" />
                                            </div>
                                            <h6 className="mb-0 text-dark fw-semibold">Proveedor</h6>
                                        </div>
                                        {entrada.proveedor ? (
                                            <div>
                                                <h6 className="mb-1 fw-semibold">{entrada.proveedor.nombre}</h6>
                                                <small className="text-muted d-block">
                                                    <Hash size={12} className="me-1" />
                                                    {entrada.proveedor.tipoDocumento} {entrada.proveedor.numeroDocumento}
                                                </small>
                                                {entrada.proveedor.telefono && (
                                                    <small className="text-muted d-block">
                                                        📞 {entrada.proveedor.telefono}
                                                    </small>
                                                )}
                                                {entrada.proveedor.email && (
                                                    <small className="text-muted d-block">
                                                        ✉️ {entrada.proveedor.email}
                                                    </small>
                                                )}
                                            </div>
                                        ) : (
                                            <span className="text-muted">Sin proveedor asignado</span>
                                        )}
                                    </Card.Body>
                                </Card>
                            </Col>
                        </Row>

                        {/* Productos */}
                        <Card className="border-0 bg-light">
                            <Card.Header
                                className="bg-white border-bottom cursor-pointer"
                                onClick={() => setDetallesAbiertos(!detallesAbiertos)}
                                style={{ cursor: 'pointer' }}
                            >
                                <div className="d-flex justify-content-between align-items-center">
                                    <div className="d-flex align-items-center">
                                        <div className="p-2 bg-primary bg-opacity-10 rounded-3 me-3">
                                            <Package size={20} className="text-primary" />
                                        </div>
                                        <h6 className="mb-0 text-dark fw-semibold">
                                            Productos ({entrada.detalles?.length || 0})
                                        </h6>
                                    </div>
                                    {detallesAbiertos ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                </div>
                            </Card.Header>
                            <Collapse in={detallesAbiertos}>
                                <Card.Body className="p-0">
                                    {entrada.detalles && entrada.detalles.length > 0 ? (
                                        <div className="table-responsive">
                                            <Table hover className="mb-0">
                                                <thead className="table-light">
                                                    <tr>
                                                        <th className="fw-semibold py-3">Producto</th>
                                                        <th className="fw-semibold py-3 text-center">Cantidad</th>
                                                        <th className="fw-semibold py-3 text-end">Precio Unit.</th>
                                                        <th className="fw-semibold py-3 text-end">Subtotal</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {entrada.detalles.map((detalle, idx) => (
                                                        <tr key={idx}>
                                                            <td>
                                                                <div>
                                                                    <div className="fw-medium">{detalle.producto?.nombreProducto}</div>
                                                                    <small className="text-muted">
                                                                        {detalle.producto?.unidadMedida}
                                                                    </small>
                                                                </div>
                                                            </td>
                                                            <td className="text-center">
                                                                <Badge bg="primary" className="px-2 py-1">
                                                                    {detalle.cantidad}
                                                                </Badge>
                                                            </td>
                                                            <td className="text-end fw-medium">
                                                                {formatearMoneda(detalle.precioUnitario)}
                                                            </td>
                                                            <td className="text-end fw-bold text-success">
                                                                {formatearMoneda(detalle.subtotal)}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                                <tfoot className="table-light">
                                                    <tr>
                                                        <th colSpan="3" className="text-end py-3">Total:</th>
                                                        <th className="text-end py-3 text-success">
                                                            {formatearMoneda(totalMostrado)}
                                                        </th>
                                                    </tr>
                                                </tfoot>
                                            </Table>
                                        </div>
                                    ) : (
                                        <div className="text-center py-4 text-muted">
                                            No hay productos registrados
                                        </div>
                                    )}
                                </Card.Body>
                            </Collapse>
                        </Card>
                    </div>
                </Card.Body>
            </Collapse>
        </Card>
    );
};

export default DetalleEntrada;
