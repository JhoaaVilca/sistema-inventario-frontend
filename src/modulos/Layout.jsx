import { NavLink, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import '../assets/bootstrap-olive.css';

// Íconos Lucide
import {
    Box, Users, ArrowDownCircle, ArrowUpCircle,
    Menu, LayoutDashboard, Grid3X3, FileText,
    User, UserCheck, CreditCard, Building2, Banknote,
    ChevronDown, ChevronRight
} from 'lucide-react';

function Layout({ children }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [salidasSubmenuOpen, setSalidasSubmenuOpen] = useState(false);
    // eliminado useLocation sin uso
    const navigate = useNavigate();

    // Detectar pantallas pequeñas
    useEffect(() => {
        const checkScreenSize = () => setIsMobile(window.innerWidth < 992);
        checkScreenSize();
        window.addEventListener('resize', checkScreenSize);
        return () => window.removeEventListener('resize', checkScreenSize);
    }, []);

    const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        localStorage.removeItem('role');
        navigate('/login', { replace: true });
    };

    return (
        <div className="bg-light min-vh-100 d-flex">
            {/* === SIDEBAR === */}
            <nav
                className={`position-fixed h-100 border-end sidebar-olive text-white`}
                style={{
                    width: '250px',
                    top: 0,
                    left: 0,
                    transform: isMobile
                        ? sidebarOpen
                            ? 'translateX(0)'
                            : 'translateX(-100%)'
                        : 'translateX(0)',
                    transition: 'transform 0.3s ease-in-out',
                    zIndex: 1040,
                }}
            >
                {/* Header */}
                <div className="p-4 border-0 text-center">
                    <div
                        className="text-white fw-bold"
                        style={{ fontSize: '1.35rem', letterSpacing: '.3px' }}
                    >
                        COMERCIAL YAMISA
                    </div>
                </div>

                {/* === NAVIGATION === */}
                <div className="px-3">
                    <ul className="nav flex-column">

                        {/* Dashboard */}
                        <li className="nav-item mb-2">
                            <NavLink
                                to="/"
                                end
                                className={({ isActive }) =>
                                    `nav-link d-flex align-items-center p-2 rounded ${isActive ? 'active' : 'text-white'
                                    }`
                                }
                                onClick={() => setSidebarOpen(false)}
                            >
                                <LayoutDashboard size={20} className="me-3" />
                                <span>Dashboard</span>
                            </NavLink>
                        </li>

                        {/* === INVENTARIO === */}
                        <li className="section-title mt-3 mb-1 text-uppercase small fw-bold">
                            Inventario
                        </li>
                        <li className="nav-item mb-1">
                            <NavLink to="/productos" className={({ isActive }) => `nav-link d-flex align-items-center p-2 rounded ${isActive ? 'active' : 'text-white'}`}>
                                <Box size={20} className="me-3" /> <span>Productos</span>
                            </NavLink>
                        </li>
                        <li className="nav-item mb-1">
                            <NavLink to="/categorias" className={({ isActive }) => `nav-link d-flex align-items-center p-2 rounded ${isActive ? 'active' : 'text-white'}`}>
                                <Grid3X3 size={20} className="me-3" /> <span>Categorías</span>
                            </NavLink>
                        </li>
                        <li className="nav-item mb-1">
                            <NavLink to="/entradas" className={({ isActive }) => `nav-link d-flex align-items-center p-2 rounded ${isActive ? 'active' : 'text-white'}`}>
                                <ArrowDownCircle size={20} className="me-3" /> <span>Entradas</span>
                            </NavLink>
                        </li>

                        {/* Submenú: Salidas / Ventas */}
                        <li className="nav-item mb-1">
                            <button
                                className="nav-link d-flex align-items-center p-2 rounded w-100 border-0 bg-transparent text-white"
                                onClick={() => setSalidasSubmenuOpen(!salidasSubmenuOpen)}
                            >
                                <ArrowUpCircle size={20} className="me-3" />
                                <span>Salidas / Ventas</span>
                                {salidasSubmenuOpen ? (
                                    <ChevronDown size={16} className="ms-auto" />
                                ) : (
                                    <ChevronRight size={16} className="ms-auto" />
                                )}
                            </button>
                            {salidasSubmenuOpen && (
                                <ul className="nav flex-column ms-4 mt-1">
                                    <li className="nav-item mb-1">
                                        <NavLink to="/salidas" className={({ isActive }) => `nav-link d-flex align-items-center p-2 rounded small ${isActive ? 'active' : 'text-white'}`}>
                                            <ArrowUpCircle size={16} className="me-2" /> Registrar Venta
                                        </NavLink>
                                    </li>
                                    <li className="nav-item mb-1">
                                        <NavLink to="/salidas/caja" className={({ isActive }) => `nav-link d-flex align-items-center p-2 rounded small ${isActive ? 'active' : 'text-white'}`}>
                                            <Banknote size={16} className="me-2" /> Caja del Día
                                        </NavLink>
                                    </li>
                                </ul>
                            )}
                        </li>

                        <li className="nav-item mb-2">
                            <NavLink to="/kardex" className={({ isActive }) => `nav-link d-flex align-items-center p-2 rounded ${isActive ? 'active' : 'text-white'}`}>
                                <FileText size={20} className="me-3" /> <span>Kardex</span>
                            </NavLink>
                        </li>

                        {/* === GESTIÓN === */}
                        <li className="section-title mt-3 mb-1 text-uppercase small fw-bold">
                            Gestión
                        </li>
                        <li className="nav-item mb-1">
                            <NavLink to="/proveedores" className={({ isActive }) => `nav-link d-flex align-items-center p-2 rounded ${isActive ? 'active' : 'text-white'}`}>
                                <Users size={20} className="me-3" /> <span>Proveedores</span>
                            </NavLink>
                        </li>
                        <li className="nav-item mb-1">
                            <NavLink to="/clientes" className={({ isActive }) => `nav-link d-flex align-items-center p-2 rounded ${isActive ? 'active' : 'text-white'}`}>
                                <User size={20} className="me-3" /> <span>Clientes</span>
                            </NavLink>
                        </li>
                        <li className="nav-item mb-2">
                            <NavLink to="/creditos" className={({ isActive }) => `nav-link d-flex align-items-center p-2 rounded ${isActive ? 'active' : 'text-white'}`}>
                                <CreditCard size={20} className="me-3" /> <span>Créditos</span>
                            </NavLink>
                        </li>

                        {/* === CONFIGURACIÓN === */}
                        <li className="section-title mt-3 mb-1 text-uppercase small fw-bold">
                            Configuración
                        </li>
                        <li className="nav-item mb-2">
                            <NavLink to="/empresa" className={({ isActive }) => `nav-link d-flex align-items-center p-2 rounded ${isActive ? 'active' : 'text-white'}`}>
                                <Building2 size={20} className="me-3" /> <span>Empresa</span>
                            </NavLink>
                        </li>

                        {/* === SALIR === */}
                        <li className="nav-item mt-3">
                            <button
                                type="button"
                                className="nav-link d-flex align-items-center p-2 rounded text-white w-100 text-start border-0 bg-transparent"
                                onClick={handleLogout}
                            >
                                <UserCheck size={20} className="me-3" />
                                <span>Salir</span>
                            </button>
                        </li>
                    </ul>
                </div>
            </nav>

            {/* === OVERLAY MÓVIL === */}
            {sidebarOpen && isMobile && (
                <div
                    className="position-fixed d-lg-none"
                    style={{
                        top: 0,
                        left: 0,
                        width: '100vw',
                        height: '100vh',
                        backgroundColor: 'rgba(0,0,0,0.5)',
                        zIndex: 1035,
                    }}
                    onClick={toggleSidebar}
                ></div>
            )}

            {/* === CONTENIDO PRINCIPAL === */}
            <div
                className="bg-white min-vh-100 flex-grow-1"
                style={{ marginLeft: isMobile ? '0' : '250px', position: 'relative' }}
            >
                {isMobile && (
                    <nav
                        className="navbar navbar-dark navbar-olive fixed-top border-0"
                        style={{ zIndex: 1030 }}
                    >
                        <div className="container-fluid">
                            <button
                                className="btn btn-link me-2 text-white-75 text-decoration-none"
                                onClick={toggleSidebar}
                            >
                                <Menu size={22} />
                            </button>
                            <span className="navbar-brand mb-0 fw-bold">COMERCIAL YAMISA</span>
                        </div>
                    </nav>
                )}

                {isMobile && <div style={{ height: '56px' }}></div>}

                <div className="container-fluid p-4">{children}</div>
            </div>
        </div>
    );
}

export default Layout;
