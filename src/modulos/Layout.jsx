import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import '../assets/bootstrap-olive.css';

// Íconos Lucide
import {
    Box, Users, ArrowDownCircle, ArrowUpCircle,
    Menu, LayoutDashboard, Grid3X3, FileText, User, UserCheck
    , CreditCard, Building2, Settings
} from 'lucide-react';

function Layout({ children }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

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

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        localStorage.removeItem('role');
        navigate('/login', { replace: true });
    };

    const routeTitles = {
        '/': 'Dashboard',
        '/productos': 'Productos',
        '/categorias': 'Categorías',
        '/entradas': 'Entradas',
        '/salidas': 'Salidas / Ventas',
        '/kardex': 'Kardex',
        '/proveedores': 'Proveedores',
        '/clientes': 'Clientes',
        '/creditos': 'Créditos',
        '/empresa': 'Configuración de Empresa'
    };

    const getModuleTitle = (pathname) => {
        if (routeTitles[pathname]) return routeTitles[pathname];
        const match = Object.keys(routeTitles).find(p => p !== '/' && pathname.startsWith(p + '/'));
        return match ? routeTitles[match] : 'Módulo';
    };

    return (
        <div className="bg-light min-vh-100">
            {/* Sidebar */}
            <nav className="position-fixed h-100 border-end sidebar-olive text-white"
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
                <div className="p-4 border-0">
                    <div className="text-white text-center mb-0 fw-bold" style={{ fontSize: '1.35rem', letterSpacing: '.3px' }}>
                        Comercial Yoli
                    </div>
                </div>

                {/* Enlaces de navegación */}
                <div className="p-3">
                    <ul className="nav flex-column">

                        {/* Dashboard */}
                        <li className="nav-item mb-2">
                            <NavLink to="/" end className={({ isActive }) => `nav-link d-flex align-items-center p-3 rounded ${isActive ? 'active' : 'text-white'}`}
                                onClick={() => setSidebarOpen(false)}>
                                <LayoutDashboard size={20} className="me-3" />
                                <span>Dashboard</span>
                            </NavLink>
                        </li>

                        {/* Inventario */}
                        <li className="mt-3 mb-2 text-uppercase small fw-bold section-title">Inventario</li>
                        <li className="nav-item mb-2">
                            <NavLink to="/productos" className={({ isActive }) => `nav-link d-flex align-items-center p-3 rounded ${isActive ? 'active' : 'text-white'}`}
                                onClick={() => setSidebarOpen(false)}>
                                <Box size={20} className="me-3" />
                                <span>Productos</span>
                            </NavLink>
                        </li>
                        <li className="nav-item mb-2">
                            <NavLink to="/categorias" className={({ isActive }) => `nav-link d-flex align-items-center p-3 rounded ${isActive ? 'active' : 'text-white'}`}
                                onClick={() => setSidebarOpen(false)}>
                                <Grid3X3 size={20} className="me-3" />
                                <span>Categorías</span>
                            </NavLink>
                        </li>
                        <li className="nav-item mb-2">
                            <NavLink to="/entradas" className={({ isActive }) => `nav-link d-flex align-items-center p-3 rounded ${isActive ? 'active' : 'text-white'}`}
                                onClick={() => setSidebarOpen(false)}>
                                <ArrowDownCircle size={20} className="me-3" />
                                <span>Entradas</span>
                            </NavLink>
                        </li>
                        <li className="nav-item mb-2">
                            <NavLink to="/salidas" className={({ isActive }) => `nav-link d-flex align-items-center p-3 rounded ${isActive ? 'active' : 'text-white'}`}
                                onClick={() => setSidebarOpen(false)}>
                                <ArrowUpCircle size={20} className="me-3" />
                                <span>Salidas / Ventas</span>
                            </NavLink>
                        </li>
                        <li className="nav-item mb-2">
                            <NavLink to="/kardex" className={({ isActive }) => `nav-link d-flex align-items-center p-3 rounded ${isActive ? 'active' : 'text-white'}`}
                                onClick={() => setSidebarOpen(false)}>
                                <FileText size={20} className="me-3" />
                                <span>Kardex</span>
                            </NavLink>
                        </li>

                        {/* Gestión */}
                        <li className="mt-3 mb-2 text-uppercase small fw-bold section-title">Gestión</li>
                        <li className="nav-item mb-2">
                            <NavLink to="/proveedores" className={({ isActive }) => `nav-link d-flex align-items-center p-3 rounded ${isActive ? 'active' : 'text-white'}`}
                                onClick={() => setSidebarOpen(false)}>
                                <Users size={20} className="me-3" />
                                <span>Proveedores</span>
                            </NavLink>
                        </li>
                        <li className="nav-item mb-2">
                            <NavLink to="/clientes" className={({ isActive }) => `nav-link d-flex align-items-center p-3 rounded ${isActive ? 'active' : 'text-white'}`}
                                onClick={() => setSidebarOpen(false)}>
                                <User size={20} className="me-3" />
                                <span>Clientes</span>
                            </NavLink>
                        </li>
                        <li className="nav-item mb-2">
                            <NavLink to="/creditos" className={({ isActive }) => `nav-link d-flex align-items-center p-3 rounded ${isActive ? 'active' : 'text-white'}`}
                                onClick={() => setSidebarOpen(false)}>
                                <CreditCard size={20} className="me-3" />
                                <span>Créditos</span>
                            </NavLink>
                        </li>

                        {/* Configuración */}
                        <li className="mt-3 mb-2 text-uppercase small fw-bold section-title">Configuración</li>
                        <li className="nav-item mb-2">
                            <NavLink to="/empresa" className={({ isActive }) => `nav-link d-flex align-items-center p-3 rounded ${isActive ? 'active' : 'text-white'}`}
                                onClick={() => setSidebarOpen(false)}>
                                <Building2 size={20} className="me-3" />
                                <span>Empresa</span>
                            </NavLink>
                        </li>

                        {/* Salir */}
                        <li className="nav-item mt-3">
                            <button type="button" className="nav-link d-flex align-items-center p-3 rounded text-white w-100 text-start"
                                onClick={handleLogout}>
                                <UserCheck size={20} className="me-3" />
                                <span>Salir</span>
                            </button>
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
            <div className="bg-white min-vh-100" style={{ marginLeft: isMobile ? '0' : '250px', position: 'relative' }}>
                {/* Topbar solo en móviles */}
                {isMobile && (
                    <nav className="navbar navbar-dark navbar-olive fixed-top border-0" style={{ zIndex: 1030 }}>
                        <div className="container-fluid">
                            <button className="btn btn-link me-2 text-white-75 text-decoration-none" onClick={toggleSidebar} aria-label="Abrir menú">
                                <Menu size={22} />
                            </button>
                            <span className="navbar-brand mb-0 fw-bold">Comercial Yoli</span>
                            <div className="ms-auto"></div>
                        </div>
                    </nav>
                )}

                {/* Espaciador bajo topbar móvil */}
                {isMobile && (<div style={{ height: '56px' }}></div>)}

                {/* Contenido */}
                <div className="container-fluid p-4">
                    {children}
                </div>
            </div>
        </div>
    );
}

export default Layout;
