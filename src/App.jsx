import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Layout from './modulos/Layout';
import Dashboard from './modulos/Dashboard';
import ListarProductos from './modulos/productos/ListarProductos';
import ProductosPorCategoria from './modulos/productos/ProductosPorCategoria';
import ListarCategorias from './modulos/categorias/ListarCategorias';
import ListarProveedores from './modulos/proveedores/ListarProveedores';
import ListarClientes from './modulos/clientes/ListarClientes';
import ListarEntradas from './modulos/Entradas/ListarEntradas';
import ListarSalidas from './modulos/Salidas/ListarSalidas';
import CajaDelDia from './modulos/Salidas/CajaDelDia';
import ListarCreditos from './modulos/Creditos/ListarCreditos';
import DetalleCredito from './modulos/Creditos/DetalleCredito';
import ConfiguracionEmpresa from './modulos/empresa/ConfiguracionEmpresa';
import PrivateRoute from './modulos/auth/PrivateRoute';
import Login from './modulos/auth/Login';
import Kardex from './modulos/Kardex/Kardex';

function App() {
    const ProtectedApp = () => (
        <Layout>
            <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/productos" element={<ListarProductos />} />
                <Route path="/categoria/:categoriaId" element={<ProductosPorCategoria />} />
                <Route path="/categorias" element={<ListarCategorias />} />
                <Route path='/proveedores' element={<ListarProveedores />} />
                <Route path='/clientes' element={<ListarClientes />} />
                <Route path='/entradas' element={<ListarEntradas />} />
                <Route path='/salidas' element={<ListarSalidas />} />
                <Route path='/salidas/caja' element={<CajaDelDia />} />
                <Route path='/kardex' element={<Kardex />} />
                <Route path='/creditos' element={<ListarCreditos />} />
                <Route path='/creditos/:id' element={<DetalleCredito />} />
                <Route path='/empresa' element={<ConfiguracionEmpresa />} />
            </Routes>
        </Layout>
    );

    return (
        <Router>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/*" element={<PrivateRoute><ProtectedApp /></PrivateRoute>} />
            </Routes>
        </Router>
    );
}

export default App;