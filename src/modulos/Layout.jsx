import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

// Íconos Lucide
import { Box, Users, ArrowDownCircle, ArrowUpCircle, Menu, LayoutDashboard } from 'lucide-react';

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
                        <li className="nav-item mb-2">
                            <Link to="/" className="nav-link text-white d-flex align-items-center p-3 rounded" 
                                  onClick={() => setSidebarOpen(false)}
                                  style={{ 
                                      transition: 'all 0.3s ease',
                                      textDecoration: 'none'
                                  }}
                                  onMouseEnter={(e) => e.target.classList.add('bg-secondary')}
                                  onMouseLeave={(e) => e.target.classList.remove('bg-secondary')}>
                                <LayoutDashboard size={20} className="me-3" /> 
                                <span>Dashboard</span>
                            </Link>
                        </li>
                        <li className="nav-item mb-2">
                            <Link to="/productos" className="nav-link text-white d-flex align-items-center p-3 rounded" 
                                  onClick={() => setSidebarOpen(false)}
                                  style={{ 
                                      transition: 'all 0.3s ease',
                                      textDecoration: 'none'
                                  }}
                                  onMouseEnter={(e) => e.target.classList.add('bg-secondary')}
                                  onMouseLeave={(e) => e.target.classList.remove('bg-secondary')}>
                                <Box size={20} className="me-3" /> 
                                <span>Productos</span>
                            </Link>
                        </li>
                        <li className="nav-item mb-2">
                            <Link to="/proveedores" className="nav-link text-white d-flex align-items-center p-3 rounded" 
                                  onClick={() => setSidebarOpen(false)}
                                  style={{ 
                                      transition: 'all 0.3s ease',
                                      textDecoration: 'none'
                                  }}
                                  onMouseEnter={(e) => e.target.classList.add('bg-secondary')}
                                  onMouseLeave={(e) => e.target.classList.remove('bg-secondary')}>
                                <Users size={20} className="me-3" /> 
                                <span>Proveedores</span>
                            </Link>
                        </li>
                        <li className="nav-item mb-2">
                            <Link to="/entradas" className="nav-link text-white d-flex align-items-center p-3 rounded" 
                                  onClick={() => setSidebarOpen(false)}
                                  style={{ 
                                      transition: 'all 0.3s ease',
                                      textDecoration: 'none'
                                  }}
                                  onMouseEnter={(e) => e.target.classList.add('bg-secondary')}
                                  onMouseLeave={(e) => e.target.classList.remove('bg-secondary')}>
                                <ArrowDownCircle size={20} className="me-3" /> 
                                <span>Entradas</span>
                            </Link>
                        </li>
                        <li className="nav-item mb-2">
                            <Link to="/salidas" className="nav-link text-white d-flex align-items-center p-3 rounded" 
                                  onClick={() => setSidebarOpen(false)}
                                  style={{ 
                                      transition: 'all 0.3s ease',
                                      textDecoration: 'none'
                                  }}
                                  onMouseEnter={(e) => e.target.classList.add('bg-secondary')}
                                  onMouseLeave={(e) => e.target.classList.remove('bg-secondary')}>
                                <ArrowUpCircle size={20} className="me-3" /> 
                                <span>Salidas</span>
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
            <div className="bg-white min-vh-100" style={{ 
                marginLeft: isMobile ? '0' : '250px'
            }}>
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
