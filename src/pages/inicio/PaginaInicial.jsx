import Capa from './componentes/Capa.jsx'
import CursosDestaque from './componentes/CursosDestaque.jsx'
import ProjetosDestaque from './componentes/ProjetosDestaque.jsx'
import ChamadaEnviar from './componentes/ChamadaEnviar.jsx'
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
