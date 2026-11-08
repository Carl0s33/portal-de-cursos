import { enderecoPrivado } from '@/app/rotas.js'
import './rodape-catalogo.css'

export default function RodapeCatalogo({ pagina = 'cursos' }) {
  return (
    <footer className="rodape-catalogo">
      <div className="limite">
        <div className="rodape-catalogo__principal">
          <div>
            <a className="marca" href="#inicio">
              Portal de Cursos
            </a>
            <p>Cursos, pessoas e produções acadêmicas em um só lugar.</p>
          </div>
          <nav aria-label="Navegação no rodapé">
            <a href="#inicio">Início</a>
            <a
              href="#cursos"
              aria-current={['cursos', 'detalhes-curso'].includes(pagina) ? 'page' : undefined}
            >
              Cursos
            </a>
            <a href="#projetos" aria-current={pagina === 'projetos' ? 'page' : undefined}>
              Projetos
            </a>
            <a href="#submeter">Enviar projeto</a>
            <a href={enderecoPrivado('login')}>Entrar no portal</a>
          </nav>
        </div>
        <div className="rodape-catalogo__base">
          <small>Formação e produção acadêmica</small>
          <small>
            © {new Date().getFullYear()} Portal de Cursos. Todos os direitos reservados.
          </small>
        </div>
      </div>
    </footer>
  )
}
