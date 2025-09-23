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

function App() {
    return (
        <Router>
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
                </Routes>
            </Layout>
        </Router>
    );
}

export default App;