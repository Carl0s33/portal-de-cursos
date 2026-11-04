import { basePortal, enderecoPrivado } from '@/app/rotas.js'
import logoPortal from '@/assets/marca/logo-portal.png'
import '@/shared/styles/estrutura.css'

export default function Rodape({ pagina = 'inicio' }) {
  return (
    <footer className="rodape">
      <div className="limite">
        <div className="rodape__colunas">
          <div className="rodape__marca-bloco">
            <a className="marca marca--cabecalho" href={`${basePortal}#inicio`}>
              <img className="marca__simbolo" src={logoPortal} alt="" width="28" height="28" />
              <span className="marca__texto">
                Portal de <span className="marca__cursos">Cursos</span>
              </span>
            </a>
            <p>
              Conheça a formação, a estrutura dos cursos e as produções acadêmicas desenvolvidas
              pelos estudantes.
            </p>
          </div>
          <nav aria-label="Navegação no rodapé">
            <h2>Navegação acadêmica</h2>
            <a href="#inicio" aria-current={pagina === 'inicio' ? 'page' : undefined}>
              Página inicial
            </a>
            <a
              href="#cursos"
              aria-current={['cursos', 'detalhes-curso'].includes(pagina) ? 'page' : undefined}
            >
              Catálogo de cursos
            </a>
            <a href="#projetos" aria-current={pagina === 'projetos' ? 'page' : undefined}>
              Produções acadêmicas
            </a>
            <a href="#submeter" aria-current={pagina === 'submissao' ? 'page' : undefined}>
              Enviar projeto
            </a>
          </nav>
          <div className="rodape__acesso">
            <h2>Acesso restrito</h2>
            <a
              href={enderecoPrivado('login')}
              aria-current={pagina === 'acesso' ? 'page' : undefined}
            >
              Entrar no portal <span aria-hidden="true">↗</span>
            </a>
            <p>Os trabalhos são publicados após a aprovação do orientador e da coordenação.</p>
          </div>
        </div>
        <div className="rodape__base">
          <p>© {new Date().getFullYear()} Portal de Cursos. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  )
}
