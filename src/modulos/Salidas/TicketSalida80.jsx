import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import empresaService from '../../servicios/empresaService';
import apiClient from '../../servicios/apiClient';

function formatearFecha(fecha) {
  if (!fecha) return '-';
  try {
    return new Date(fecha).toLocaleString('es-PE', {
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit'
    });
  } catch {
    return String(fecha);
  }
}

function moneda(v) {
  try {
    return new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN', minimumFractionDigits: 2 }).format(Number(v || 0));
  } catch {
    return `S/ ${Number(v || 0).toFixed(2)}`;
  }
}

const TicketSalida80 = ({ idSalida, autoPrint = true, showInternalButton = true }) => {
  const params = useParams();
  const id = idSalida || params?.id;
  const [empresa, setEmpresa] = useState(null);
  const [salida, setSalida] = useState(null);
  const [readyToPrint, setReadyToPrint] = useState(false);

  useEffect(() => {
    const cargar = async () => {
      try {
        const [emp, sal] = await Promise.all([
          empresaService.obtenerConfiguracion(),
          apiClient.get(`/salidas/${id}`).then(r => r.data)
        ]);
        setEmpresa(emp || {});
        setSalida(sal || {});
      } catch (e) {
        console.error('Error cargando datos del ticket', e);
      } finally {
        // pequeño defer para asegurar render del DOM antes de imprimir
        setTimeout(() => setReadyToPrint(true), 100);
      }
    };
    cargar();
  }, [id]);

  useEffect(() => {
    if (readyToPrint && autoPrint) {
      // Esperar un frame para estilos
      setTimeout(() => {
        window.print();
      }, 50);
    }
  }, [readyToPrint, autoPrint]);

  const total = (() => {
    if (salida?.total && salida.total > 0) return salida.total;
    if (salida?.totalSalida) return salida.totalSalida;
    const dets = salida?.detalles || [];
    return dets.reduce((acc, d) => acc + (Number(d?.subtotal) || (Number(d?.cantidad) || 0) * (Number(d?.precioUnitario) || 0)), 0);
  })();

  const nombreCliente = salida?.cliente
    ? `${salida.cliente.nombres || ''} ${salida.cliente.apellidos || ''}`.trim()
    : (salida?.nombreCliente || 'Venta al contado');
  const dniCliente = salida?.cliente ? salida.cliente.dni : (salida?.dniCliente || '');
  const tipoVenta = String(salida?.tipoVenta || '').toUpperCase();

  return (
    <div style={{ display: 'flex', justifyContent: 'center', background: autoPrint ? '#f5f5f5' : 'transparent', padding: autoPrint ? 12 : 0 }}>
      <div className="ticket" style={{ width: '80mm', background: '#fff', color: '#000', padding: '3mm', boxSizing: 'border-box' }}>
        <style>
          {`
          @page { size: 80mm auto; margin: 0; }
          @media print {
            html, body { margin: 0; padding: 0; }
            body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            .no-print { display: none !important; }
            /* Aísla la impresión usando visibility para evitar páginas en blanco */
            body * { visibility: hidden !important; }
            .ticket, .ticket * { visibility: visible !important; }
            /* Ocultar chrome del modal/backdrop de Bootstrap */
            .modal, .modal-backdrop { visibility: hidden !important; }
            .modal .ticket { visibility: visible !important; }
            .ticket { position: fixed; left: 0; top: 0; width: 80mm !important; margin: 0 !important; page-break-inside: avoid; break-inside: avoid; }
          }
          .center { text-align: center; }
          .right { text-align: right; }
          .row { display: flex; justify-content: space-between; }
          .muted { color: #333; font-size: 11px; }
          .bold { font-weight: 700; }
          .hr { border-top: 1px dashed #000; margin: 6px 0; }
          .items { width: 100%; font-size: 11px; }
          .items th, .items td { padding: 2px 0; }
          .mono { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace; }
        `}
        </style>

        {/* Encabezado Empresa */}
        <div className="center mono" style={{ marginBottom: 4 }}>
          <div className="bold" style={{ fontSize: 14 }}>{empresa?.nombreEmpresa || 'Mi Empresa'}</div>
          {empresa?.ruc && <div>RUC: {empresa.ruc}</div>}
          {empresa?.direccion && <div className="muted">{empresa.direccion}</div>}
          {(empresa?.telefono || empresa?.email) && (
            <div className="muted">{[empresa.telefono, empresa.email].filter(Boolean).join(' • ')}</div>
          )}
        </div>

        <div className="hr" />

        {/* Datos de la venta/salida */}
        <div className="mono" style={{ fontSize: 11 }}>
          <div className="row"><span>ID Salida:</span><span className="bold">#{salida?.idSalida || id}</span></div>
          <div className="row"><span>Fecha:</span><span>{formatearFecha(salida?.fechaSalida)}</span></div>
          <div className="row"><span>Tipo:</span><span className="bold">{tipoVenta === 'CREDITO' ? 'Crédito' : 'Contado'}</span></div>
          {tipoVenta === 'CREDITO' && salida?.fechaPagoCredito && (
            <div className="row"><span>Pago (crédito):</span><span>{formatearFecha(salida?.fechaPagoCredito)}</span></div>
          )}
        </div>

        {/* Cliente */}
        <div className="mono" style={{ marginTop: 6, fontSize: 11 }}>
          <div className="bold">Cliente</div>
          <div>{nombreCliente}</div>
          {dniCliente && <div className="muted">DNI: {dniCliente}</div>}
        </div>

        <div className="hr" />

        {/* Detalle de items */}
        <table className="items mono">
          <thead>
            <tr>
              <th style={{ textAlign: 'left' }}>Producto</th>
              <th className="right" style={{ width: 20 }}>Cant</th>
              <th className="right" style={{ width: 32 }}>P.U.</th>
              <th className="right" style={{ width: 40 }}>Subt</th>
            </tr>
          </thead>
          <tbody>
            {(salida?.detalles || []).map((d, idx) => {
              const nombre = d?.nombreProducto || d?.producto?.nombreProducto || '';
              const unidad = d?.producto?.unidadMedida ? ` (${d.producto.unidadMedida})` : '';
              const cantidad = Number(d?.cantidad) || 0;
              const pu = Number(d?.precioUnitario) || 0;
              const subtotal = Number(d?.subtotal) || (cantidad * pu);
              return (
                <tr key={idx}>
                  <td>{(nombre + unidad).slice(0, 28)}</td>
                  <td className="right">{cantidad}</td>
                  <td className="right">{moneda(pu)}</td>
                  <td className="right">{moneda(subtotal)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <div className="hr" />

        {/* Totales */}
        <div className="mono" style={{ fontSize: 12 }}>
          <div className="row"><span className="bold">TOTAL</span><span className="bold">{moneda(total)}</span></div>
        </div>

        {/* Nota según tipo */}
        <div className="mono center muted" style={{ marginTop: 8 }}>
          {tipoVenta === 'CREDITO' ? (
            <div>
              <div>Venta a crédito. Sujeto a pago en la fecha indicada.</div>
            </div>
          ) : (
            <div>Venta al contado.</div>
          )}
        </div>

        <div className="mono center" style={{ marginTop: 8, fontSize: 11 }}>
          ¡Gracias por su compra!
        </div>

        {/* Botón visible solo fuera de impresión y cuando no es autoPrint */}
        {!autoPrint && showInternalButton && (
          <div className="no-print" style={{ marginTop: 12, display: 'flex', justifyContent: 'center' }}>
            <button onClick={() => window.print()} style={{ padding: '6px 10px' }}>Imprimir</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TicketSalida80;
