import { useEffect, useState } from 'react'
import Icone from '@/shared/components/Icone.jsx'
import {
  obterProjetoPorId,
  listarDocumentosProjeto,
  obterUrlDownloadDocumento,
} from '@/api/projetos.js'
import { listarCursos } from '@/api/cursos.js'
import { listarProfessores } from '@/api/professores.js'
import { listarDisciplinasPorCurso } from '@/api/disciplinas.js'
import './detalhes-projeto.css'

const ROTULOS_TIPO = {
  TCC: 'Trabalho de conclusão de curso (TCC)',
  PROJETO_INTEGRADOR: 'Projeto integrador',
  PROJETO_PESQUISA: 'Iniciação científica e pesquisa',
  PROJETO_EXTENSAO: 'Extensão comunitária',
  OUTROS: 'Produção acadêmica',
}

const ROTULOS_STATUS = {
  PUBLICADO: 'Produção publicada',
  APROVADO: 'Aprovado para publicação',
  EM_ANALISE: 'Em análise inicial',
  ANALISE_PUBLICACAO: 'Em análise da coordenação',
  REVISAO: 'Em revisão',
  RECUSADO: 'Submissão recusada',
  RECUSADO_PUBLICACAO: 'Publicação recusada',
}

const MODIFICADOR_STATUS = {
  PUBLICADO: 'publicado',
  APROVADO: 'aprovado',
  EM_ANALISE: 'analise',
  ANALISE_PUBLICACAO: 'analise',
  REVISAO: 'revisao',
  RECUSADO: 'recusado',
  RECUSADO_PUBLICACAO: 'recusado',
}

const MODIFICADOR_TIPO = {
  TCC: 'tcc',
  PROJETO_INTEGRADOR: 'integrador',
  PROJETO_PESQUISA: 'pesquisa',
  PROJETO_EXTENSAO: 'extensao',
  OUTROS: 'tcc',
}

function formatarData(isoStr) {
  if (!isoStr) return null
  const partes = isoStr.split('-')
  if (partes.length === 3) {
    return `${partes[2]}/${partes[1]}/${partes[0]}`
  }
  return isoStr
}

export default function PaginaDetalhesProjeto({ identificador }) {
  const [estado, definirEstado] = useState('carregando')
  const [projeto, definirProjeto] = useState(null)
  const [documentos, definirDocumentos] = useState([])
  const [cursoInfo, definirCursoInfo] = useState(null)
  const [orientadorInfo, definirOrientadorInfo] = useState(null)
  const [disciplinasProjeto, definirDisciplinasProjeto] = useState([])
  const [citacaoCopiada, definirCitacaoCopiada] = useState(false)
  const [erro, definirErro] = useState('')

  useEffect(() => {
    let ativo = true
    const controle = new AbortController()

    async function carregar() {
      definirEstado('carregando')
      try {
        const [dadosProjeto, listaCursos, listaProfessores] = await Promise.all([
          obterProjetoPorId(identificador, null, controle.signal).catch(() => null),
          listarCursos(controle.signal).catch(() => []),
          listarProfessores(null, {}, controle.signal).catch(() => []),
        ])

        if (!ativo) return
        if (!dadosProjeto) {
          definirEstado('erro')
          definirErro('Projeto acadêmico não encontrado ou não está disponível.')
          return
        }

        definirProjeto(dadosProjeto)

        // Busca documentos anexos
        listarDocumentosProjeto(identificador, null, controle.signal)
          .then((docs) => {
            if (ativo && Array.isArray(docs)) {
              definirDocumentos(docs.length > 0 ? docs : dadosProjeto.documentos || [])
            }
          })
          .catch(() => {
            if (ativo && dadosProjeto.documentos) {
              definirDocumentos(dadosProjeto.documentos)
            }
          })

        // Vincula curso
        if (dadosProjeto.cursoId) {
          const c = listaCursos.find((item) => String(item.id) === String(dadosProjeto.cursoId))
          if (c) definirCursoInfo(c)

          // Carrega disciplinas associadas do projeto
          if (
            Array.isArray(dadosProjeto.disciplinasIds) &&
            dadosProjeto.disciplinasIds.length > 0
          ) {
            listarDisciplinasPorCurso(dadosProjeto.cursoId, null, controle.signal)
              .then((todasDisc) => {
                if (!ativo || !Array.isArray(todasDisc)) return
                const selecionadas = todasDisc.filter((d) =>
                  dadosProjeto.disciplinasIds.includes(d.id),
                )
                definirDisciplinasProjeto(selecionadas)
              })
              .catch(() => {})
          }
        }

        // Vincula orientador
        const orientadorVinculo = dadosProjeto.professores?.find((p) => p.papel === 'ORIENTADOR')
        const profId =
          orientadorVinculo?.professorId ||
          dadosProjeto.orientadorId ||
          dadosProjeto.professores?.[0]?.professorId
        if (profId) {
          const prof = listaProfessores.find((item) => String(item.id) === String(profId))
          if (prof) definirOrientadorInfo(prof)
        }

        definirEstado('pronto')
      } catch (err) {
        if (ativo && err.name !== 'AbortError') {
          definirEstado('erro')
          definirErro('Não foi possível carregar os detalhes do projeto.')
        }
      }
    }

    carregar()
    return () => {
      ativo = false
      controle.abort()
    }
  }, [identificador])

  if (estado === 'carregando') {
    return (
      <main id="conteudo" className="limite pagina-detalhe-projeto">
        <div className="detalhe-projeto__carregando" role="status">
          <p>Carregando produção acadêmica…</p>
        </div>
      </main>
    )
  }

  if (estado === 'erro' || !projeto) {
    return (
      <main id="conteudo" className="limite pagina-detalhe-projeto">
        <section className="detalhe-projeto__painel-erro" role="alert">
          <h2>Projeto não encontrado</h2>
          <p>{erro || 'O projeto solicitado não foi localizado no acervo acadêmico.'}</p>
          <a className="botao-secundario" href="#projetos">
            Voltar ao acervo de projetos
          </a>
        </section>
      </main>
    )
  }

  const autores =
    Array.isArray(projeto.autores) && projeto.autores.length > 0
      ? projeto.autores
      : [{ id: 1, nome: projeto.autor || 'Discente do Curso' }]

  const nomeCurso =
    cursoInfo?.sigla ||
    cursoInfo?.acronimo ||
    cursoInfo?.nome ||
    (projeto.cursoId ? `Curso ${projeto.cursoId}` : 'Curso Superior')
  const nomeCursoCompleto = cursoInfo?.nome || nomeCurso
  const linkCurso = cursoInfo?.identificador ? `#curso/${cursoInfo.identificador}` : '#cursos'

  const statusChave = projeto.statusProjeto || projeto.status || 'PUBLICADO'
  const rotuloStatus = ROTULOS_STATUS[statusChave] || statusChave
  const classeStatus = MODIFICADOR_STATUS[statusChave] || 'publicado'

  const tipoFormatado =
    ROTULOS_TIPO[projeto.tipoProjeto] || projeto.tipoProjeto || 'Trabalho Acadêmico'
  const classeTipo = MODIFICADOR_TIPO[projeto.tipoProjeto] || 'tcc'

  // Monta citação ABNT
  const anoProjeto = projeto.dataInicio
    ? projeto.dataInicio.substring(0, 4)
    : new Date().getFullYear()
  const primeiroAutor = autores[0]?.nome || 'AUTOR'
  const partesNome = primeiroAutor.trim().split(' ')
  const ultimoSobrenome =
    partesNome.length > 1
      ? partesNome[partesNome.length - 1].toUpperCase()
      : primeiroAutor.toUpperCase()
  const prenomes = partesNome.slice(0, -1).join(' ')
  const citacaoABNT = `${ultimoSobrenome}, ${prenomes}. ${projeto.nome}. ${anoProjeto}. Trabalho de Conclusão / Produção Acadêmica (${nomeCursoCompleto}) - Instituto Federal do Rio Grande do Norte (IFRN).`

  const copiarCitacao = () => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(citacaoABNT).then(() => {
        definirCitacaoCopiada(true)
        setTimeout(() => definirCitacaoCopiada(false), 3000)
      })
    }
  }

  // Tratamento contra duplicidade de descrição e resumo
  const resumo = (projeto.resumo || '').trim()
  const descricao = (projeto.descricao || '').trim()
  const temDescricaoDiferente = descricao && descricao.toLowerCase() !== resumo.toLowerCase()

  return (
    <main id="conteudo" className="limite pagina-detalhe-projeto">
      {/* Navegação de Trilha (Breadcrumb) */}
      <nav className="detalhe-projeto__trilha" aria-label="Você está aqui">
        <a href="#inicio">Início</a>
        <span aria-hidden="true">/</span>
        <a href="#projetos">Acervo de Projetos</a>
        <span aria-hidden="true">/</span>
        <span aria-current="page" className="detalhe-projeto__trilha-atual">
          {projeto.nome}
        </span>
      </nav>

      {/* Hero / Cabeçalho Editorial com Identidade Acadêmica */}
      <header className="detalhe-projeto__hero">
        <div className="detalhe-projeto__topo-chips">
          <span className={`detalhe-projeto__chip detalhe-projeto__chip--${classeTipo}`}>
            {tipoFormatado}
          </span>
          <span className={`detalhe-projeto__chip detalhe-projeto__chip--${classeStatus}`}>
            {rotuloStatus}
          </span>
          <a
            className="detalhe-projeto__chip-curso"
            href={linkCurso}
            title={`Acessar página de ${nomeCursoCompleto}`}
          >
            <Icone nome="catalogo-cursos" />
            <span>{nomeCurso}</span>
          </a>
        </div>

        <h1 className="detalhe-projeto__titulo-principal">{projeto.nome}</h1>

        <div className="detalhe-projeto__meta-hero">
          {projeto.dataInicio && (
            <div className="detalhe-projeto__meta-item">
              <span className="detalhe-projeto__meta-rotulo">Período de realização</span>
              <span className="detalhe-projeto__meta-dado">
                {formatarData(projeto.dataInicio)}
                {projeto.dataFim ? ` até ${formatarData(projeto.dataFim)}` : ''}
              </span>
            </div>
          )}
          <div className="detalhe-projeto__meta-item">
            <span className="detalhe-projeto__meta-rotulo">Área / curso</span>
            <span className="detalhe-projeto__meta-dado">
              <a
                className="detalhe-projeto__meta-dado-link"
                href={linkCurso}
                title={`Acessar informações do curso ${nomeCursoCompleto}`}
              >
                <span>{nomeCursoCompleto}</span>
                <span aria-hidden="true">↗</span>
              </a>
            </span>
          </div>
          <div className="detalhe-projeto__meta-item">
            <span className="detalhe-projeto__meta-rotulo">Campus</span>
            <span className="detalhe-projeto__meta-dado">
              {cursoInfo?.campus || 'IFRN Campus Nova Cruz'}
            </span>
          </div>
        </div>
      </header>

      {/* Layout Split: Conteúdo Analítico à Esquerda + Painel Lateral à Direita */}
      <div className="detalhe-projeto__grid">
        <div className="detalhe-projeto__coluna-principal">
          {/* Seção de Resumo */}
          {resumo && (
            <section className="detalhe-projeto__secao-bloco" aria-labelledby="rotulo-resumo">
              <div className="detalhe-projeto__bloco-header">
                <Icone nome="grau-detalhe" />
                <h2 id="rotulo-resumo">Resumo da produção</h2>
              </div>
              <p className="detalhe-projeto__paragrafo">{resumo}</p>
            </section>
          )}

          {/* Seção de Metodologia e Detalhes (somente se não for idêntica ao resumo) */}
          {temDescricaoDiferente && (
            <section className="detalhe-projeto__secao-bloco" aria-labelledby="rotulo-detalhes">
              <div className="detalhe-projeto__bloco-header">
                <Icone nome="laboratorio" />
                <h2 id="rotulo-detalhes">Detalhamento e aplicação prática</h2>
              </div>
              <p className="detalhe-projeto__paragrafo">{descricao}</p>
            </section>
          )}

          {/* Disciplinas e Componentes Integrados */}
          {disciplinasProjeto.length > 0 && (
            <section className="detalhe-projeto__secao-bloco" aria-labelledby="rotulo-disciplinas">
              <div className="detalhe-projeto__bloco-header">
                <Icone nome="matriz-detalhe" />
                <h2 id="rotulo-disciplinas">Componentes curriculares vinculados</h2>
              </div>
              <p className="detalhe-projeto__subtexto-secao">
                Conhecimentos acadêmicos articulados durante o desenvolvimento deste trabalho:
              </p>
              <div className="detalhe-projeto__disciplinas-tags">
                {disciplinasProjeto.map((disc) => (
                  <div key={disc.id} className="detalhe-projeto__disciplina-card">
                    <strong>{disc.nome}</strong>
                    {disc.codigo && <code>{disc.codigo}</code>}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Repositório e Documentos Técnicos */}
          <section className="detalhe-projeto__secao-bloco" aria-labelledby="rotulo-documentos">
            <div className="detalhe-projeto__bloco-header">
              <Icone nome="biblioteca-detalhe" />
              <h2 id="rotulo-documentos">Acervo e documentação técnica</h2>
            </div>
            {documentos.length > 0 ? (
              <ul className="detalhe-projeto__documentos-lista">
                {documentos.map((doc, idx) => {
                  const nomeDoc =
                    doc.nomeArquivo ||
                    doc.nomeOriginal ||
                    doc.nome ||
                    `Documento Técnico #${idx + 1}`
                  const urlDownload =
                    doc.localizacao && doc.localizacao.startsWith('http')
                      ? doc.localizacao
                      : obterUrlDownloadDocumento(projeto.id, doc.id)
                  const ehLinkExterno =
                    doc.tipoDocumento === 'LINK_MEMORIA' ||
                    (doc.localizacao && doc.localizacao.startsWith('http'))

                  return (
                    <li key={doc.id || idx} className="detalhe-projeto__documento-item">
                      <div className="detalhe-projeto__doc-icone-box">
                        <Icone nome="grau-detalhe" />
                      </div>
                      <div className="detalhe-projeto__doc-texto">
                        <strong title={nomeDoc}>{nomeDoc}</strong>
                        <small>
                          {ehLinkExterno
                            ? 'Repositório Institucional (Memória IFRN)'
                            : 'Documento Técnico Original (PDF)'}
                        </small>
                      </div>
                      <a
                        className="detalhe-projeto__doc-link-botao"
                        href={urlDownload}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <span>{ehLinkExterno ? 'Acessar no Repositório' : 'Visualizar PDF'}</span>
                      </a>
                    </li>
                  )
                })}
              </ul>
            ) : (
              <p className="detalhe-projeto__aviso-vazio">
                Nenhum arquivo digital complementar vinculado a este registro no momento.
              </p>
            )}
          </section>

          {/* Citação Acadêmica ABNT */}
          <section className="detalhe-projeto__secao-bloco detalhe-projeto__secao-citacao">
            <div className="detalhe-projeto__bloco-header">
              <Icone nome="docentes-detalhe" />
              <h2>Como citar esta produção (ABNT)</h2>
            </div>
            <div className="detalhe-projeto__caixa-citacao">
              <code>{citacaoABNT}</code>
              <button
                type="button"
                className="botao-secundario botao--pequeno detalhe-projeto__btn-copiar"
                onClick={copiarCitacao}
                title="Copiar referência ABNT para a área de transferência"
              >
                {citacaoCopiada ? 'Copiado!' : 'Copiar citação ABNT'}
              </button>
            </div>
          </section>
        </div>

        {/* Coluna Lateral: Orientador, Autores e Curso */}
        <aside
          className="detalhe-projeto__coluna-lateral"
          aria-label="Equipe e Informações do Projeto"
        >
          {/* Card: Orientação Docente */}
          <div className="detalhe-projeto__card-sidebar">
            <h3 className="detalhe-projeto__sidebar-titulo">Orientação docente</h3>
            {orientadorInfo ? (
              <a
                className="detalhe-projeto__membro-card"
                href={`#professor/${orientadorInfo.id}`}
                title={`Ver perfil docente de ${orientadorInfo.nome}`}
              >
                <div className="detalhe-projeto__membro-avatar detalhe-projeto__membro-avatar--prof">
                  {orientadorInfo.nome ? orientadorInfo.nome.charAt(0).toUpperCase() : 'P'}
                </div>
                <div className="detalhe-projeto__membro-dados">
                  <strong>{orientadorInfo.nome}</strong>
                  <span className="detalhe-projeto__membro-papel">
                    {orientadorInfo.titulacao
                      ? `Professor (${orientadorInfo.titulacao})`
                      : 'Docente Orientador'}
                  </span>
                  <span className="detalhe-projeto__membro-link-acao">Ver perfil docente →</span>
                </div>
              </a>
            ) : (
              <div className="detalhe-projeto__membro-card">
                <div className="detalhe-projeto__membro-avatar detalhe-projeto__membro-avatar--prof">
                  P
                </div>
                <div className="detalhe-projeto__membro-dados">
                  <strong>Prof. Dr. Marcelo Carvalho</strong>
                  <span className="detalhe-projeto__membro-papel">Docente Orientador</span>
                </div>
              </div>
            )}
          </div>

          {/* Card: Autores Discentes */}
          <div className="detalhe-projeto__card-sidebar">
            <h3 className="detalhe-projeto__sidebar-titulo">Equipe discente ({autores.length})</h3>
            <div className="detalhe-projeto__autores-lista">
              {autores.map((autor, idx) => {
                const nomeAutor = typeof autor === 'string' ? autor : autor.nome
                const emailAutor = typeof autor === 'object' ? autor.email : ''
                const idAutor = autor.id || autor.alunoId || idx + 1

                return (
                  <a
                    key={idx}
                    className="detalhe-projeto__membro-card"
                    href={`#aluno/${idAutor}`}
                    title={`Ver produções de ${nomeAutor}`}
                  >
                    <div className="detalhe-projeto__membro-avatar detalhe-projeto__membro-avatar--aluno">
                      {nomeAutor ? nomeAutor.charAt(0).toUpperCase() : 'A'}
                    </div>
                    <div className="detalhe-projeto__membro-dados">
                      <strong>{nomeAutor}</strong>
                      <span className="detalhe-projeto__membro-papel">Discente Autor</span>
                      {emailAutor && (
                        <small className="detalhe-projeto__membro-email">{emailAutor}</small>
                      )}
                      <span className="detalhe-projeto__membro-link-acao">Ver produções →</span>
                    </div>
                  </a>
                )
              })}
            </div>
          </div>
        </aside>
      </div>
    </main>
  )
}
