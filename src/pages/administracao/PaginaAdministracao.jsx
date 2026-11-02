import GestaoAreas from './components/GestaoAreas.jsx'
import GestaoConteudos from './components/GestaoConteudos.jsx'
import GestaoCampus from './components/GestaoCampus.jsx'
import GestaoProfessores from './components/GestaoProfessores.jsx'
import GestaoUsuarios from './components/GestaoUsuarios.jsx'
import PainelAdministracao from './components/PainelAdministracao.jsx'
import TabelaSubmissoes from './components/TabelaSubmissoes.jsx'
import '@/shared/styles/painel.css'
import './administracao.css'

export default function PaginaAdministracao({
  secao,
  identificador,
  sessao,
  rascunhos,
  aoAlterar,
  submissoes,
}) {
  if (secao === 'campus')
    return (
      <main id="conteudo" className="pagina-painel pagina-painel--administracao">
        <GestaoCampus identificador={identificador} token={sessao.token} />
      </main>
    )
  if (secao === 'areas')
    return (
      <main id="conteudo" className="pagina-painel pagina-painel--administracao">
        <GestaoAreas token={sessao.token} />
      </main>
    )
  if (secao === 'usuarios')
    return (
      <main id="conteudo" className="pagina-painel pagina-painel--administracao">
        <GestaoUsuarios token={sessao.token} />
      </main>
    )
  if (secao === 'professores')
    return (
      <main id="conteudo" className="pagina-painel pagina-painel--administracao">
        <GestaoProfessores token={sessao.token} />
      </main>
    )
  if (['cursos', 'disciplinas', 'projetos'].includes(secao))
    return (
      <main
        id="conteudo"
        className={`pagina-painel pagina-painel--administracao pagina-painel--${secao}`}
      >
        <GestaoConteudos
          key={secao}
          dominio={secao}
          itens={rascunhos[secao]}
          cursos={rascunhos.cursos}
          disciplinas={rascunhos.disciplinas}
          token={sessao.token}
          aoAlterar={(itens) => aoAlterar(secao, itens)}
        />
      </main>
    )
  if (secao === 'submissoes')
    return (
      <main id="conteudo" className="pagina-painel pagina-painel--administracao">
        <header className="painel-titulo administracao-boas-vindas">
          <div>
            <span className="administracao-boas-vindas__rotulo">Acompanhamento acadêmico</span>
            <h1>Submissões do portal</h1>
            <p>Consulte as produções submetidas pelos estudantes em todos os cursos.</p>
          </div>
        </header>
        <section className="painel-secao administracao-registros">
          <header>
            <div>
              <h2>Todas as submissões</h2>
              <p>{submissoes.length} produções registradas no portal.</p>
            </div>
          </header>
          <TabelaSubmissoes itens={submissoes} />
        </section>
      </main>
    )
  return (
    <main id="conteudo" className="pagina-painel pagina-painel--administracao">
      <PainelAdministracao token={sessao.token} />
    </main>
  )
}
