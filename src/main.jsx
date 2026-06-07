import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import { EmpresaProvider } from './shared/contexts/EmpresaContext.jsx'
import 'bootstrap/dist/css/bootstrap.min.css';
import './assets/bootstrap-olive.css';
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <EmpresaProvider>
      <App />
    </EmpresaProvider>
  </StrictMode>,
)
