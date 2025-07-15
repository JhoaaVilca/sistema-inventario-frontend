import { Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

function Layout({ children }) {
    return (
        <div className="d-flex">
            {/* Sidebar */}
            <div className="bg-dark text-white p-3 vh-100" style={{ width: "220px" }}>
                <h4 className="text-center">Comercial Yoli</h4>
                <hr className="bg-light" />
                <ul className="nav flex-column">
                    <li className="nav-item">
                        <Link className="nav-link text-white" to="/productos">Productos</Link>
                    </li>
                    <li className="nav-item">
                        <Link className="nav-link text-white" to="/entradas">Entradas</Link>
                    </li>
                    <li className="nav-item">
                        <Link className="nav-link text-white" to="/salidas">Salidas</Link>
                    </li>
                </ul>
            </div>

            {/* Contenido principal */}
            <div className="flex-grow-1">
                {/* Navbar */}
                <nav className="navbar navbar-expand-lg navbar-light bg-light">
                    <div className="container-fluid">
                        <span className="navbar-brand mb-0 h1">Sistema de Inventario</span>
                    </div>
                </nav>

                {/* Contenido que cambia */}
                <div className="p-4">
                    {children}
                </div>
            </div>
        </div>
    );
}

export default Layout;
