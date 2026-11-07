import Capa from './components/Capa.jsx'
import CursosDestaque from './components/CursosDestaque.jsx'
import ProjetosDestaque from './components/ProjetosDestaque.jsx'
import ChamadaEnviar from './components/ChamadaEnviar.jsx'
import './inicio.css'

export default function PaginaInicial() {
  return (
    <main id="conteudo" className="limite pagina-inicial">
      <Capa />
      <CursosDestaque />
      <ProjetosDestaque />
      <ChamadaEnviar />
    </main>
  )
}
