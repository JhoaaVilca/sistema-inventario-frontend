import { useState } from "react";
import { Card, Row, Col, Badge, Button, Collapse, Table } from "react-bootstrap";
import {
    Package,
    Calendar,
    User,
    Receipt,
    ChevronDown,
    ChevronUp,
    FileText,
    ShoppingCart,
    Hash
} from "lucide-react";

const DetalleSalida = ({ salida, isOpen, onToggle, ocultarHeader = false }) => {
    const [detallesAbiertos, setDetallesAbiertos] = useState(false);

    const calcularTotal = () => {
        if (salida?.total && salida.total > 0) return salida.total;
        if (Array.isArray(salida?.detalles)) {
            return salida.detalles.reduce((acc, d) => {
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

    // Fallbacks para cliente desde el DTO plano
    const nombreCliente = salida?.cliente
        ? `${salida.cliente.nombres || ''} ${salida.cliente.apellidos || ''}`.trim()
        : (salida?.nombreCliente || '');
    const dniCliente = salida?.cliente ? salida.cliente.dni : (salida?.dniCliente || '');

    // Estado UI derivado cuando no existe campo 'estado'
    const estadoUI = salida?.estado || (salida?.tipoVenta === 'CREDITO' ? 'Crédito' : 'Contado');

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

    const getTipoVentaBadge = (tipo) => {
        const isCredito = String(tipo || '').toUpperCase() === 'CREDITO';
        return <Badge bg={isCredito ? 'warning' : 'secondary'}>{isCredito ? 'Crédito' : 'Contado'}</Badge>;
    };

    if (ocultarHeader) {
        return (
            <div className="p-0">
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
                                        <small className="text-muted d-block">Número de Salida</small>
                                        <span className="fw-medium">#{salida.idSalida}</span>
                                    </div>
                                    <div className="col-6">
                                        <small className="text-muted d-block">Fecha de Salida</small>
                                        <span className="fw-medium">{formatearFecha(salida.fechaSalida)}</span>
                                    </div>
                                    <div className="col-6">
                                        <small className="text-muted d-block">Tipo de venta</small>
                                        <div>{getTipoVentaBadge(salida.tipoVenta)}</div>
                                    </div>
                                    <div className="col-6">
                                        <small className="text-muted d-block">Estado</small>
                                        <div>{getEstadoBadge(estadoUI)}</div>
                                    </div>
                                    <div className="col-6">
                                        <small className="text-muted d-block">Total</small>
                                        <span className="fw-bold text-success">{formatearMoneda(totalMostrado)}</span>
                                    </div>
                                    {String(salida?.tipoVenta || '').toUpperCase() === 'CREDITO' && salida?.fechaPagoCredito && (
                                        <div className="col-6">
                                            <small className="text-muted d-block">Compromiso de pago</small>
                                            <span className="fw-medium">{formatearFecha(salida.fechaPagoCredito)}</span>
                                        </div>
                                    )}
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={6}>
                        <Card className="h-100 border-0 bg-light">
                            <Card.Body>
                                <div className="d-flex align-items-center mb-3">
                                    <div className="p-2 bg-primary bg-opacity-10 rounded-3 me-3">
                                        <User size={20} className="text-primary" />
                                    </div>
                                    <h6 className="mb-0 text-dark fw-semibold">Cliente</h6>
                                </div>
                                {nombreCliente ? (
                                    <div>
                                        <h6 className="mb-1 fw-semibold">{nombreCliente}</h6>
                                        {dniCliente && (
                                            <small className="text-muted d-block">DNI: {dniCliente}</small>
                                        )}
                                    </div>
                                ) : (
                                    <span className="text-muted">Venta al contado</span>
                                )}
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>

                {/* Productos */}
                <Card className="border-0 bg-light">
                    <Card.Header className="bg-white border-bottom">
                        <div className="d-flex justify-content-between align-items-center">
                            <div className="d-flex align-items-center">
                                <div className="p-2 bg-primary bg-opacity-10 rounded-3 me-3">
                                    <Package size={20} className="text-primary" />
                                </div>
                                <h6 className="mb-0 text-dark fw-semibold">
                                    Productos ({salida.detalles?.length || 0})
                                </h6>
                            </div>
                        </div>
                    </Card.Header>
                    <Card.Body className="p-0">
                        {salida.detalles && salida.detalles.length > 0 ? (
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
                                        {salida.detalles.map((detalle, idx) => (
                                            <tr key={idx}>
                                                <td>
                                                    <div>
                                                        <div className="fw-medium">{detalle.nombreProducto || detalle.producto?.nombreProducto}</div>
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
        );
    }

    return (
        <Card className="mb-3 border-0 shadow-sm">
            <Card.Header
                className="bg-white border-bottom"
                onClick={onToggle}
                style={{ cursor: 'pointer' }}
            >
                <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
                    {/* Izquierda: cliente y etiqueta de salida */}
                    <div className="d-flex align-items-center">
                        <ShoppingCart size={20} className="me-2 text-primary" />
                        <div>
                            <div className="d-flex align-items-center gap-2">
                                <h6 className="mb-0">{nombreCliente || 'Venta'}</h6>
                                <span className="text-muted">•</span>
                                <small className="text-muted">Salida #{salida.idSalida}</small>
                                <span className="text-muted">•</span>
                                {getTipoVentaBadge(salida.tipoVenta)}
                            </div>
                            <small className="text-muted">{formatearFecha(salida.fechaSalida)}</small>
                        </div>
                    </div>
                    {/* Centro: total y estado */}
                    <div className="d-flex align-items-center gap-3">
                        <div className="text-end">
                            <small className="text-muted d-block">Total</small>
                            <span className="fw-bold text-success">{formatearMoneda(totalMostrado)}</span>
                        </div>
                        {getEstadoBadge(estadoUI)}
                    </div>
                    {/* Derecha: chevron */}
                    <div className="d-flex align-items-center">
                        {isOpen ? <ChevronUp size={20} className="ms-1" /> : <ChevronDown size={20} className="ms-1" />}
                    </div>
                </div>
            </Card.Header>

            <Collapse in={isOpen}>
                <Card.Body className="p-0">
                    <div className="p-4">
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
                                                <small className="text-muted d-block">Número de Salida</small>
                                                <span className="fw-medium">#{salida.idSalida}</span>
                                            </div>
                                            <div className="col-6">
                                                <small className="text-muted d-block">Fecha de Salida</small>
                                                <span className="fw-medium">{formatearFecha(salida.fechaSalida)}</span>
                                            </div>
                                            <div className="col-6">
                                                <small className="text-muted d-block">Tipo de venta</small>
                                                <div>{getTipoVentaBadge(salida.tipoVenta)}</div>
                                            </div>
                                            <div className="col-6">
                                                <small className="text-muted d-block">Estado</small>
                                                <div>{getEstadoBadge(estadoUI)}</div>
                                            </div>
                                            <div className="col-6">
                                                <small className="text-muted d-block">Total</small>
                                                <span className="fw-bold text-success">{formatearMoneda(totalMostrado)}</span>
                                            </div>
                                            {String(salida?.tipoVenta || '').toUpperCase() === 'CREDITO' && salida?.fechaPagoCredito && (
                                                <div className="col-6">
                                                    <small className="text-muted d-block">Compromiso de pago</small>
                                                    <span className="fw-medium">{formatearFecha(salida.fechaPagoCredito)}</span>
                                                </div>
                                            )}
                                        </div>
                                    </Card.Body>
                                </Card>
                            </Col>
                            <Col md={6}>
                                <Card className="h-100 border-0 bg-light">
                                    <Card.Body>
                                        <div className="d-flex align-items-center mb-3">
                                            <div className="p-2 bg-primary bg-opacity-10 rounded-3 me-3">
                                                <User size={20} className="text-primary" />
                                            </div>
                                            <h6 className="mb-0 text-dark fw-semibold">Cliente</h6>
                                        </div>
                                        {nombreCliente ? (
                                            <div>
                                                <h6 className="mb-1 fw-semibold">{nombreCliente}</h6>
                                                {dniCliente && (
                                                    <small className="text-muted d-block">
                                                        <Hash size={12} className="me-1" /> DNI: {dniCliente}
                                                    </small>
                                                )}
                                            </div>
                                        ) : (
                                            <span className="text-muted">Venta al contado</span>
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
                                            Productos ({salida.detalles?.length || 0})
                                        </h6>
                                    </div>
                                    {detallesAbiertos ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                </div>
                            </Card.Header>
                            <Collapse in={detallesAbiertos}>
                                <Card.Body className="p-0">
                                    {salida.detalles && salida.detalles.length > 0 ? (
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
                                                    {salida.detalles.map((detalle, idx) => (
                                                        <tr key={idx}>
                                                            <td>
                                                                <div>
                                                                    <div className="fw-medium">{detalle.nombreProducto || detalle.producto?.nombreProducto}</div>
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

export default DetalleSalida;
