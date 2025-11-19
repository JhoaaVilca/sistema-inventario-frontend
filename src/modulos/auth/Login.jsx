import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Lock } from 'lucide-react';
import { Toast, ToastContainer } from 'react-bootstrap';
import apiClient from '../../servicios/apiClient';
import AuthLayout from '../ui/AuthLayout.jsx';
import InputIcon from '../ui/InputIcon.jsx';
import SubmitButton from '../ui/SubmitButton.jsx';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [showExpiredToast, setShowExpiredToast] = useState(false);
  const [showLogoutToast, setShowLogoutToast] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const expired = localStorage.getItem('sessionExpired');
    if (expired === '1') {
      setShowExpiredToast(true);
      localStorage.removeItem('sessionExpired');
      // Ocultar el toast después de 5 segundos
      setTimeout(() => {
        setShowExpiredToast(false);
      }, 5000);
    }
  }, []);

  useEffect(() => {
    const logout = localStorage.getItem('logoutSuccess');
    if (logout === '1') {
      setShowLogoutToast(true);
      localStorage.removeItem('logoutSuccess');
      setTimeout(() => {
        setShowLogoutToast(false);
      }, 3000);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await apiClient.post('/auth/login', { username, password });
      if (data?.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('username', data.username || username);
        localStorage.setItem('role', data.role || 'ADMIN');
        
        // Mostrar mensaje de éxito
        setShowSuccessToast(true);
        setLoading(false);
        
        // Redirigir después de mostrar el mensaje (aumentado a 2 segundos para mejor visibilidad)
        setTimeout(() => {
          navigate('/', { replace: true });
        }, 2000);
      } else {
        setError('Respuesta inválida del servidor');
        setLoading(false);
      }
    } catch (err) {
      setError(err?.response?.data?.error || 'Credenciales inválidas');
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      leftTitle="Bienvenido"
      leftSubtitle="COMERCIAL YAMISA • Inventario"
      leftBg="var(--palette-blue-900)"
      rightBg="var(--palette-blue-600)"
      wedge={true}
    >
      <div className="card border-0 rounded-4" style={{ backgroundColor: 'rgba(255,255,255,.04)', backdropFilter: 'blur(1px)' }}>
        <div className="card-body p-4 p-md-5">
          <div className="mb-4" style={{ fontFamily: 'Poppins, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif' }}>
            <h2 className="fw-semibold mb-1 text-white" style={{ fontSize: '2rem' }}>Login</h2>
          </div>
          {error && (
            <div className="alert alert-danger py-2" role="alert">{error}</div>
          )}
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label fw-semibold text-white-50">Usuario</label>
              <InputIcon
                icon={<User size={18} />}
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Nombre de usuario"
                autoComplete="username"
              />
            </div>
            <div className="mb-4">
              <label className="form-label fw-semibold text-white-50">Contraseña</label>
              <InputIcon
                icon={<Lock size={18} />}
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
              />
            </div>
            {/* <div className="d-flex justify-content-between align-items-center mb-4">
              <span></span>
              <a className="small" href="#" onClick={(e) => e.preventDefault()} style={{ color: 'rgba(255,255,255,.7)' }}>¿Olvidaste tu contraseña?</a>
            </div> */}
            <div className="d-grid">
              <SubmitButton loading={loading}>Ingresar</SubmitButton>
            </div>
          </form>
          
          {/* Toast de éxito */}
          <ToastContainer position="top-center" className="p-3" style={{ zIndex: 9999 }}>
            <Toast
              show={showSuccessToast}
              onClose={() => setShowSuccessToast(false)}
              delay={3000}
              autohide
              bg="success"
            >
              <Toast.Header closeButton className="bg-success text-white border-0">
                <strong className="me-auto">✅ Inicio de sesión exitoso</strong>
              </Toast.Header>
              <Toast.Body className="text-white">
                Bienvenido, {username}. Redirigiendo al dashboard...
              </Toast.Body>
            </Toast>

            {/* Toast de sesión cerrada */}
            <Toast
              show={showLogoutToast}
              onClose={() => setShowLogoutToast(false)}
              delay={3000}
              autohide
              bg="danger"
            >
              <Toast.Header closeButton className="bg-danger text-white border-0">
                <strong className="me-auto">ℹ️ Sesión cerrada</strong>
              </Toast.Header>
              <Toast.Body className="text-white">
                Has cerrado sesión correctamente.
              </Toast.Body>
            </Toast>
            
            {/* Toast de sesión expirada */}
            <Toast
              show={showExpiredToast}
              onClose={() => setShowExpiredToast(false)}
              delay={5000}
              autohide
              bg="warning"
            >
              <Toast.Header closeButton className="bg-warning text-dark border-0">
                <strong className="me-auto">⚠️ Sesión Expirada</strong>
              </Toast.Header>
              <Toast.Body className="text-dark">
                Tu sesión ha expirado. Por favor, inicia sesión nuevamente.
              </Toast.Body>
            </Toast>
          </ToastContainer>
        </div>
      </div>
    </AuthLayout>
  );
}

export default Login;
