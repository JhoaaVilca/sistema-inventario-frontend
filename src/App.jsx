import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Layout from './modulos/Layout';
import ListarProductos from './modulos/productos/ListarProductos';

function App() {
    return (
        <Router>
            <Layout>
                <Routes>
                    <Route path="/productos" element={<ListarProductos />} />
                </Routes>
            </Layout>
        </Router>
    );
}

export default App;