import Capa from './componentes/Capa.jsx'
import SobrePortal from './componentes/SobrePortal.jsx'
import CursosDestaque from './componentes/CursosDestaque.jsx'
import ProjetosDestaque from './componentes/ProjetosDestaque.jsx'
import ChamadaEnviar from './componentes/ChamadaEnviar.jsx'
import NavegacaoSecoes from './componentes/NavegacaoSecoes.jsx'
import './inicio.css'

export default function PaginaInicial() {
  return (
    <main id="conteudo" className="limite pagina-inicial">
      <Capa />
      <SobrePortal />
      <ProjetosDestaque />
      <CursosDestaque />
      <div id="chamada-projeto">
        <ChamadaEnviar />
      </div>
      <NavegacaoSecoes />
    </main>
  )
}
