import { useEffect, useState } from 'react'
import Icone from '@/shared/components/Icone.jsx'
import ItemProjeto from '@/shared/components/ItemProjeto.jsx'
import { listarProfessores } from '@/api/professores.js'
import { listarCursos } from '@/api/cursos.js'
import { listarCoordenadores } from '@/api/coordenadores.js'
import { consultarProjetosPublicados } from '@/pages/projetos/services/consultarProjetosPublicados.js'
import './perfil-publico.css'

export default function PaginaPerfilProfessor({ idProfessor }) {
  const [professor, mudarProfessor] = useState(null)
  const [cursosAtuacao, mudarCursosAtuacao] = useState([])
  const [projetosOrientados, mudarProjetosOrientados] = useState([])
  const [carregando, mudarCarregando] = useState(true)
  const [ehCoordenador, mudarEhCoordenador] = useState(false)

  useEffect(() => {
    let ativo = true
    const controle = new AbortController()

    async function carregar() {
      mudarCarregando(true)
      try {
        const [professores, cursos, projetos, coordenadores] = await Promise.all([
          listarProfessores(null, {}, controle.signal).catch(() => []),
          listarCursos(controle.signal).catch(() => []),
          consultarProjetosPublicados(controle.signal).catch(() => []),
          listarCoordenadores(null, {}, controle.signal).catch(() => []),
        ])

        if (!ativo) return

        const profEncontrado = professores.find(
          (p) =>
            String(p.id) === String(idProfessor) || String(p.usuario?.id) === String(idProfessor),
        )

        mudarProfessor(profEncontrado || null)

        if (profEncontrado) {
          const listaCoordenadores = Array.isArray(coordenadores)
            ? coordenadores
            : Array.isArray(coordenadores?.coordenadores)
              ? coordenadores.coordenadores
              : []
          const idsProfessor = [profEncontrado.id, profEncontrado.usuario?.id]
            .filter((id) => id !== undefined && id !== null)
            .map(String)
          mudarEhCoordenador(
            listaCoordenadores.some((item) =>
              [item.professorId, item.professor?.id, item.usuarioId, item.usuario?.id, item.id]
                .filter((id) => id !== undefined && id !== null)
                .some((id) => idsProfessor.includes(String(id))),
            ),
          )

          // Identifica cursos em que atua
          const cursosFiltrados = cursos.filter(
            (c) => String(c.id) === String(profEncontrado.cursoId),
          )
          mudarCursosAtuacao(cursosFiltrados.length ? cursosFiltrados : cursos.slice(0, 1))

          // Filtra projetos orientados por este professor
          const projetosDoProf = projetos.filter((proj) => {
            const nomeOrientador = (proj.orientador || '').toLowerCase()
            const nomeProf = (profEncontrado.nome || '').toLowerCase()
            return nomeOrientador.includes(nomeProf) || nomeProf.includes(nomeOrientador)
          })
          mudarProjetosOrientados(projetosDoProf)
        }
      } finally {
        if (ativo) mudarCarregando(false)
      }
    }

    carregar()
    return () => {
      ativo = false
      controle.abort()
    }
  }, [idProfessor])

  if (carregando) {
    return (
      <main id="conteudo" className="limite pagina-perfil-docente">
        <div className="perfil-publico__status-box" role="status">
          <p>Carregando perfil docente…</p>
        </div>
      </main>
    )
  }

  if (!professor) {
    return (
      <main id="conteudo" className="limite pagina-perfil-docente">
        <div className="perfil-publico__status-box" role="alert">
          <h2>Docente não localizado</h2>
          <p>O perfil docente solicitado não está disponível no corpo docente do portal.</p>
          <a className="botao-secundario" href="#cursos">
            Voltar ao catálogo de cursos
          </a>
        </div>
      </main>
    )
  }

  const inicial = professor.nome ? professor.nome.charAt(0).toUpperCase() : 'P'

  return (
    <main id="conteudo" className="limite pagina-perfil-docente">
      {/* Navegação de Trilha */}
      <nav className="detalhe-projeto__trilha" aria-label="Você está aqui">
        <a href="#inicio">Início</a>
        <span aria-hidden="true">/</span>
        <a href="#cursos">Corpo Docente</a>
        <span aria-hidden="true">/</span>
        <span aria-current="page" className="detalhe-projeto__trilha-atual">
          {professor.nome}
        </span>
      </nav>

      {/* Cartão de Identidade Docente */}
      <header
        className={`perfil-publico__cabecalho ${ehCoordenador ? 'perfil-publico__cabecalho--coordenador' : 'perfil-publico__cabecalho--docente'}`}
      >
        <div className="perfil-publico__avatar-docente">{inicial}</div>
        <div className="perfil-publico__identidade">
          <div className="perfil-publico__tags">
            <span className="perfil-publico__badge-docente">Corpo docente IFRN</span>
            {ehCoordenador && (
              <span className="perfil-publico__badge-coordenador">Coordenação de curso</span>
            )}
            {professor.titulacao && (
              <span className="perfil-publico__badge-titulacao">{professor.titulacao}</span>
            )}
          </div>
          <h1 className="perfil-publico__nome">{professor.nome}</h1>
          <p className="perfil-publico__email">{professor.email || 'Docente permanente'}</p>
        </div>
      </header>

      {/* Grid de Informações e Produções */}
      <div className="perfil-publico__grid">
        {/* Coluna Lateral: Biografia e Cursos */}
        <aside className="perfil-publico__sidebar">
          <div className="perfil-publico__bloco">
            <h2>Biografia e áreas de atuação</h2>
            <p className="perfil-publico__descricao-bio">
              {professor.descricao ||
                'Docente atuante no ensino, pesquisa aplicada e orientação de trabalhos de conclusão de curso no IFRN.'}
            </p>
          </div>

          <div className="perfil-publico__bloco">
            <h2>Cursos vinculados</h2>
            <ul className="perfil-publico__cursos-lista">
              {cursosAtuacao.map((curso) => (
                <li key={curso.id}>
                  <a href={`#curso/${curso.identificador || curso.id}`}>
                    <Icone nome="catalogo-cursos" />
                    <div>
                      <strong>{curso.nome}</strong>
                      <small>{curso.sigla || curso.acronimo || 'Curso Superior'}</small>
                    </div>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* Coluna Central: Produções Acadêmicas Orientadas */}
        <section className="perfil-publico__conteudo">
          <div className="perfil-publico__cabecalho-secao">
            <div>
              <h2>Produções orientadas ({projetosOrientados.length})</h2>
              <p>
                Trabalhos de conclusão, pesquisas e projetos de extensão sob esta orientação
                docente.
              </p>
            </div>
          </div>

          {projetosOrientados.length > 0 ? (
            <ul className="lista-projetos">
              {projetosOrientados.map((projeto) => (
                <li key={projeto.identificador}>
                  <ItemProjeto projeto={projeto} />
                </li>
              ))}
            </ul>
          ) : (
            <div className="perfil-publico__bloco-vazio">
              <Icone nome="laboratorio" />
              <p>Nenhuma produção acadêmica orientada foi publicada publicamente ainda.</p>
            </div>
          )}
        </section>
      </div>
    </main>
  )
}
