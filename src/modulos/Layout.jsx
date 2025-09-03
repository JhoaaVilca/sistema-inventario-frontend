import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

// Íconos Lucide
import {
    Box, Users, ArrowDownCircle, ArrowUpCircle,
    Menu, LayoutDashboard, Grid3X3, FileText, User, UserCheck
} from 'lucide-react';

function Layout({ children }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkScreenSize = () => {
            setIsMobile(window.innerWidth < 992);
        };

        checkScreenSize();
        window.addEventListener('resize', checkScreenSize);
        return () => window.removeEventListener('resize', checkScreenSize);
    }, []);

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

    return (
        <div className="bg-light min-vh-100">
            {/* Sidebar */}
            <nav className="position-fixed h-100 border-end border-secondary bg-dark text-white"
                style={{
                    width: '250px',
                    zIndex: 1040,
                    top: 0,
                    left: 0,
                    transform: isMobile ? (sidebarOpen ? 'translateX(0)' : 'translateX(-100%)') : 'translateX(0)',
                    transition: 'transform 0.3s ease-in-out',
                    boxShadow: '2px 0 10px rgba(0,0,0,0.1)'
                }}>

                {/* Header del sidebar */}
                <div className="p-3 border-bottom border-secondary">
                    <h5 className="text-white text-center mb-0">Comercial Yoli</h5>
                </div>

                {/* Enlaces de navegación */}
                <div className="p-3">
                    <ul className="nav flex-column">

                        {/* Dashboard */}
                        <li className="nav-item mb-2">
                            <Link to="/" className="nav-link text-white d-flex align-items-center p-3 rounded"
                                onClick={() => setSidebarOpen(false)}>
                                <LayoutDashboard size={20} className="me-3" />
                                <span>Dashboard</span>
                            </Link>
                        </li>

                        {/* Inventario */}
                        <li className="mt-3 mb-2 text-uppercase small text-secondary fw-bold">Inventario</li>
                        <li className="nav-item mb-2">
                            <Link to="/productos" className="nav-link text-white d-flex align-items-center p-3 rounded"
                                onClick={() => setSidebarOpen(false)}>
                                <Box size={20} className="me-3" />
                                <span>Productos</span>
                            </Link>
                        </li>
                        <li className="nav-item mb-2">
                            <Link to="/categorias" className="nav-link text-white d-flex align-items-center p-3 rounded"
                                onClick={() => setSidebarOpen(false)}>
                                <Grid3X3 size={20} className="me-3" />
                                <span>Categorías</span>
                            </Link>
                        </li>
                        <li className="nav-item mb-2">
                            <Link to="/entradas" className="nav-link text-white d-flex align-items-center p-3 rounded"
                                onClick={() => setSidebarOpen(false)}>
                                <ArrowDownCircle size={20} className="me-3" />
                                <span>Entradas</span>
                            </Link>
                        </li>
                        <li className="nav-item mb-2">
                            <Link to="/salidas" className="nav-link text-white d-flex align-items-center p-3 rounded"
                                onClick={() => setSidebarOpen(false)}>
                                <ArrowUpCircle size={20} className="me-3" />
                                <span>Salidas / Ventas</span>
                            </Link>
                        </li>
                        <li className="nav-item mb-2">
                            <Link to="/kardex" className="nav-link text-white d-flex align-items-center p-3 rounded"
                                onClick={() => setSidebarOpen(false)}>
                                <FileText size={20} className="me-3" />
                                <span>Kardex</span>
                            </Link>
                        </li>

                        {/* Gestión */}
                        <li className="mt-3 mb-2 text-uppercase small text-secondary fw-bold">Gestión</li>
                        <li className="nav-item mb-2">
                            <Link to="/proveedores" className="nav-link text-white d-flex align-items-center p-3 rounded"
                                onClick={() => setSidebarOpen(false)}>
                                <Users size={20} className="me-3" />
                                <span>Proveedores</span>
                            </Link>
                        </li>
                        <li className="nav-item mb-2">
                            <Link to="/clientes" className="nav-link text-white d-flex align-items-center p-3 rounded"
                                onClick={() => setSidebarOpen(false)}>
                                <User size={20} className="me-3" />
                                <span>Clientes</span>
                            </Link>
                        </li>
                    </ul>
                </div>
            </nav>

            {/* Overlay para cerrar sidebar en móviles */}
            {sidebarOpen && isMobile && (
                <div
                    className="position-fixed d-lg-none"
                    style={{
                        top: 0,
                        left: 0,
                        width: '100vw',
                        height: '100vh',
                        backgroundColor: 'rgba(0,0,0,0.5)',
                        zIndex: 1035
                    }}
                    onClick={toggleSidebar}
                ></div>
            )}

            {/* Contenido principal */}
            <div className="bg-white min-vh-100" style={{ marginLeft: isMobile ? '0' : '250px' }}>
                {/* Navbar superior */}
                <nav className="navbar navbar-expand-lg fixed-top shadow-sm bg-white border-bottom" style={{
                    zIndex: 1030,
                    marginLeft: isMobile ? '0' : '250px',
                    width: isMobile ? '100%' : 'calc(100% - 250px)'
                }}>
                    <div className="container-fluid">
                        <button
                            className="btn btn-link d-lg-none me-3 text-muted text-decoration-none"
                            onClick={toggleSidebar}
                        >
                            <Menu size={24} />
                        </button>
                        <span className="navbar-brand mb-0 h4 fw-bold text-dark">
                            Sistema de Inventario
                        </span>
                    </div>
                </nav>

                {/* Espaciador para compensar el navbar fijo */}
                <div style={{ height: '80px' }}></div>

                {/* Contenido */}
                <div className="p-4">
                    {children}
                </div>
            </div>
        </div>
    );
}

export default Layout;
