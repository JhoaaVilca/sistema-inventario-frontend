import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Layout from './modulos/Layout';
import Dashboard from './modulos/Dashboard';
import ListarProductos from './modulos/productos/ListarProductos';
import ListarCategorias from './modulos/categorias/ListarCategorias';
import ListarProveedores from './modulos/proveedores/ListarProveedores';
import ListarEntradas from './modulos/Entradas/ListarEntradas';

function App() {
    return (
        <Router>
            <Layout>
                <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/productos" element={<ListarProductos />} />
                    <Route path="/categorias" element={<ListarCategorias />} />
                    <Route path='/proveedores' element={<ListarProveedores/>}/>
                    <Route path='/entradas' element={<ListarEntradas/>}/>
                </Routes>
            </Layout>
        </Router>
    );
}

export default App;