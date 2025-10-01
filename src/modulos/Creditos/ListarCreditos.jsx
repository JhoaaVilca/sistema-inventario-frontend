import { useEffect, useState } from 'react';
import { Table, Button, Form, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import creditoService from '../../servicios/creditoService';

function ListarCreditos() {
  const [page, setPage] = useState(0);
  const [size] = useState(20);
  const [data, setData] = useState({ content: [], totalPages: 0 });
  const [loading, setLoading] = useState(false);

  const cargar = async () => {
    setLoading(true);
    try {
      const resp = await creditoService.listar({ page, size });
      setData(resp);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { cargar(); }, [page]);

  return (
    <div className="container mt-3">
      <h4>Créditos</h4>
      <Table striped bordered hover size="sm" className="mt-3">
        <thead>
          <tr>
            <th>#</th>
            <th>Cliente</th>
            <th>Monto Total</th>
            <th>Saldo</th>
            <th>Fecha Inicio</th>
            <th>Vencimiento</th>
            <th>Estado</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr><td colSpan={8}>Cargando...</td></tr>
          ) : data.content.length === 0 ? (
            <tr><td colSpan={8}>Sin registros</td></tr>
          ) : (
            data.content.map((c) => (
              <tr key={c.idCredito}>
                <td>{c.idCredito}</td>
                <td>{c.nombreCliente}</td>
                <td>{c.montoTotal?.toFixed(2)}</td>
                <td className={c.saldoPendiente === 0 ? 'table-success' : ''}>{c.saldoPendiente?.toFixed(2)}</td>
                <td>{c.fechaInicio}</td>
                <td className={c.fechaVencimiento && c.estado === 'VENCIDO' ? 'table-danger' : ''}>{c.fechaVencimiento || '-'}</td>
                <td>{c.estado}</td>
                <td>
                  <Link to={`/creditos/${c.idCredito}`} className="btn btn-sm btn-primary">Ver</Link>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </Table>
      <Row className="mt-2">
        <Col>
          <Button disabled={page === 0} onClick={() => setPage((p) => Math.max(0, p - 1))}>Anterior</Button>
          <span className="mx-2">Página {page + 1} de {data.totalPages || 1}</span>
          <Button disabled={data.totalPages && page >= data.totalPages - 1} onClick={() => setPage((p) => p + 1)}>Siguiente</Button>
        </Col>
      </Row>
    </div>
  );
}

export default ListarCreditos;


