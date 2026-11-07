import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/tokens.css'
import './styles/globais.css'
import './shared/styles/componentes.css'
import './shared/styles/etiqueta.css'
import App from './app/App.jsx'
import './styles/base.css'
import './shared/styles/layout-autenticacao.css'
import './styles/amoled.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
