import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import { cargarEjercicios, initAjustes } from './db'
import { pedirAlmacenamientoPersistente } from './lib/almacenamiento'

initAjustes()
cargarEjercicios()
pedirAlmacenamientoPersistente()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
)
