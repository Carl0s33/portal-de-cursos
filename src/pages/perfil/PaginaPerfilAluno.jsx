import { useEffect, useState } from 'react'
import Icone from '@/shared/components/Icone.jsx'
import ItemProjeto from '@/shared/components/ItemProjeto.jsx'
import { listarCursos } from '@/api/cursos.js'
import { buscarProjetosPublicados } from '@/pages/projetos/services/buscarProjetosPublicados.js'
import './perfil-publico.css'

export default function PaginaPerfilAluno({ idAluno }) {
  const [aluno, mudarAluno] = useState(null)
  const [cursoInfo, mudarCursoInfo] = useState(null)
  const [projetosAutor, mudarProjetosAutor] = useState([])
  const [carregando, mudarCarregando] = useState(true)

  useEffect(() => {
    let ativo = true
    const controle = new AbortController()

    async function carregar() {
      mudarCarregando(true)
      try {
        const [cursos, projetos] = await Promise.all([
          listarCursos(controle.signal).catch(() => []),
          buscarProjetosPublicados(controle.signal).catch(() => []),
        ])

        if (!ativo) return

        // Localiza projetos em que este discente participa como autor
        const projetosDoAluno = projetos.filter((proj) => {
          if (String(proj.autorId) === String(idAluno)) return true
          const autorStr = (proj.autores || '').toLowerCase()
          return (
            autorStr.includes(String(idAluno).toLowerCase()) ||
            (proj.id && String(proj.id) === String(idAluno))
          )
        })

        const projReferencia = projetosDoAluno[0] || projetos[0]
        const autoresReferencia = projReferencia?.autores
        const primeiroAutor = Array.isArray(autoresReferencia)
          ? autoresReferencia[0]
          : autoresReferencia || projReferencia?.autor
        const nomeDiscente =
          typeof primeiroAutor === 'string'
            ? primeiroAutor
            : primeiroAutor?.nome ||
              (String(idAluno) === '1' ? 'Carlos Eduardo Santos Vitor' : 'Lucas Ribeiro Mendes')
        const emailDiscente =
          typeof primeiroAutor === 'object' && primeiroAutor?.email
            ? primeiroAutor.email
            : `${nomeDiscente
                .toLowerCase()
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '')
                .replace(/[^a-z0-9]+/g, '.')
                .replace(/^\.|\.$/g, '')}@escolar.ifrn.edu.br`

        mudarAluno({
          id: idAluno,
          nome: nomeDiscente,
          email: emailDiscente,
          curso: projReferencia?.curso || 'TADS',
        })

        if (projReferencia?.cursoId) {
          const c = cursos.find((item) => String(item.id) === String(projReferencia.cursoId))
          if (c) mudarCursoInfo(c)
        } else if (cursos.length > 0) {
          mudarCursoInfo(cursos[0])
        }

        mudarProjetosAutor(
          projetosDoAluno.length > 0 ? projetosDoAluno : projReferencia ? [projReferencia] : [],
        )
      } finally {
        if (ativo) mudarCarregando(false)
      }
    }

    carregar()
    return () => {
      ativo = false
      controle.abort()
    }
  }, [idAluno])

  if (carregando) {
    return (
      <main id="conteudo" className="limite pagina-perfil-discente">
        <div className="perfil-publico__status-box" role="status">
          <p>Carregando perfil discente…</p>
        </div>
      </main>
    )
  }

  const inicial = aluno?.nome ? aluno.nome.charAt(0).toUpperCase() : 'A'

  return (
    <main id="conteudo" className="limite pagina-perfil-discente">
      {/* Navegação de Trilha */}
      <nav className="detalhe-projeto__trilha" aria-label="Você está aqui">
        <a href="#inicio">Início</a>
        <span aria-hidden="true">/</span>
        <a href="#projetos">Acervo de Projetos</a>
        <span aria-hidden="true">/</span>
        <span aria-current="page" className="detalhe-projeto__trilha-atual">
          {aluno.nome}
        </span>
      </nav>

      {/* Cartão de Identidade Discente */}
      <header className="perfil-publico__cabecalho perfil-publico__cabecalho--discente">
        <div className="perfil-publico__avatar-discente">{inicial}</div>
        <div className="perfil-publico__identidade">
          <div className="perfil-publico__tags">
            <span className="perfil-publico__badge-discente">Discente / autor</span>
            {cursoInfo && (
              <span className="perfil-publico__badge-curso">
                {cursoInfo.sigla || cursoInfo.acronimo || 'TADS'}
              </span>
            )}
          </div>
          <h1 className="perfil-publico__nome">{aluno.nome}</h1>
          <p className="perfil-publico__email">{aluno.email}</p>
        </div>
      </header>

      {/* Grid de Informações e Produções */}
      <div className="perfil-publico__grid">
        {/* Coluna Lateral: Curso de Formação */}
        <aside className="perfil-publico__sidebar">
          <div className="perfil-publico__bloco">
            <h2>Formação acadêmica</h2>
            {cursoInfo ? (
              <div className="perfil-publico__curso-card">
                <strong>{cursoInfo.nome}</strong>
                <p>
                  {cursoInfo.descricao ||
                    'Formação acadêmica superior e tecnológica de excelência no IFRN.'}
                </p>
                <a
                  className="botao-secundario botao--pequeno"
                  href={`#curso/${cursoInfo.identificador || cursoInfo.id}`}
                >
                  Conhecer matriz curricular
                </a>
              </div>
            ) : (
              <p className="perfil-publico__descricao-bio">
                Discente matriculado em curso de graduação no Instituto Federal do Rio Grande do
                Norte.
              </p>
            )}
          </div>
        </aside>

        {/* Coluna Central: Produções Acadêmicas Desenvolvidas */}
        <section className="perfil-publico__conteudo">
          <div className="perfil-publico__cabecalho-secao">
            <div>
              <h2>Trabalhos e produções publicadas ({projetosAutor.length})</h2>
              <p>
                Produções científicas, projetos integradores e pesquisas desenvolvidas pelo
                estudante.
              </p>
            </div>
          </div>

          {projetosAutor.length > 0 ? (
            <ul className="lista-projetos">
              {projetosAutor.map((projeto) => (
                <li key={projeto.identificador}>
                  <ItemProjeto projeto={projeto} />
                </li>
              ))}
            </ul>
          ) : (
            <div className="perfil-publico__bloco-vazio">
              <Icone nome="grau-detalhe" />
              <p>Nenhuma produção acadêmica deste discente foi publicada publicamente ainda.</p>
            </div>
          )}
        </section>
      </div>
    </main>
  )
}
