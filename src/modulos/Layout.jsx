import { Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

// Íconos Lucide
import { Box, Users, ArrowDownCircle, ArrowUpCircle } from 'lucide-react';

function Layout({ children }) {
    return (
        <div className="d-flex flex-column flex-lg-row min-vh-100">
            {/* Sidebar */}
            <nav className="navbar navbar-dark bg-dark p-3 flex-lg-column flex-row align-items-start">
                <div className="d-flex justify-content-between w-100 d-lg-none mb-2">
                    <span className="navbar-brand mb-0 h4 text-white">COMERCIAL YOLI</span>
                    <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#sidebarMenu">
                        <span className="navbar-toggler-icon"></span>
                    </button>
                </div>
                
                <div className="collapse d-lg-block w-100" id="sidebarMenu">
                    <h5 className="text-white text-center d-none d-lg-block">Comercial Yoli</h5>
                    <ul className="nav flex-column w-100">
                        <li className="nav-item">
                            <Link to="/productos" className="nav-link text-white">
                                <Box size={18} className="me-2" /> Productos
                            </Link>
                        </li>
                        <li className="nav-item">
                            <Link to="/proveedores" className="nav-link text-white">
                                <Users size={18} className="me-2" /> Proveedores
                            </Link>
                        </li>
                        <li className="nav-item">
                            <Link to="/entradas" className="nav-link text-white">
                                <ArrowDownCircle size={18} className="me-2" /> Entradas
                            </Link>
                        </li>
                        <li className="nav-item">
                            <Link to="/salidas" className="nav-link text-white">
                                <ArrowUpCircle size={18} className="me-2" /> Salidas
                            </Link>
                        </li>
                    </ul>
                </div>
            </nav>

            {/* Contenido principal */}
            <div className="flex-grow-1">
                <nav className="navbar navbar-light bg-light">
                    <div className="container-fluid">
                        <span className="navbar-brand mb-0 h1">Sistema de Inventario</span>
                    </div>
                </nav>

                <div className="p-4">
                    {children}
                </div>
            </div>
        </div>
    );
}

export default Layout;
