import { ordenarSubmissoes } from '@/shared/utils/ordenarSubmissoes.js'
import EstadoVazio from '@/shared/componentes/EstadoVazio.jsx'
import Indicadores from '@/shared/componentes/Indicadores.jsx'
import { useMemo, useState } from 'react'
import '@/shared/styles/painel.css'
import './professor.css'
import { enderecoPrivado } from '../../app/rotas.js'

const filtros = [
  'Precisa da sua ação',
  'Todas',
  'Aguardando Orientador',
  'Aguardando Coordenação',
  'Aprovado pelo orientador',
  'Aprovado',
  'Recusado pelo orientador',
  'Publicação recusada',
]

const tonsFiltro = {
  Todas: 'todas',
  'Aguardando Orientador': 'pendente',
  'Aguardando Coordenação': 'analise',
  'Aprovado pelo orientador': 'analise',
  Aprovado: 'aprovado',
  'Recusado pelo orientador': 'recusado',
  'Publicação recusada': 'recusado',
}

function normalizar(txt) {
  return (txt || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}

function orientaSubmissao(item, usuario) {
  const idUsuario = usuario?.professorId || usuario?.id
  if (item.orientadorId && idUsuario) return String(item.orientadorId) === String(idUsuario)
  if (item.orientadorId || !idUsuario) return false
  const nomeOrientador = normalizar(item.orientador)
  const nomeUsuario = normalizar(usuario?.nome)
  return Boolean(nomeOrientador && nomeUsuario && nomeOrientador === nomeUsuario)
}

function nomeDoAutor(item) {
  if (item.autor) return item.autor
  const primeiro = Array.isArray(item.autores) ? item.autores[0] : null
  if (typeof primeiro === 'string') return primeiro
  return primeiro?.nome || 'Aluno'
}

function iniciaisDoAutor(nome = '') {
  return nome
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((parte) => parte[0])
    .join('')
    .toLocaleUpperCase('pt-BR')
}

function tipoParaData(tipo = '') {
  const valor = normalizar(tipo)
  if (valor.includes('tcc')) return 'tcc'
  if (valor.includes('extens')) return 'extensao'
  if (valor.includes('pesquis')) return 'pesquisa'
  if (valor.includes('integrador')) return 'integrador'
  return 'producao'
}

export default function PaginaProfessor({ submissoes, usuario }) {
  const [filtro, mudarFiltro] = useState(() =>
    submissoes.some(
      (item) => item.status === 'Aguardando Orientador' && orientaSubmissao(item, usuario),
    )
      ? 'Precisa da sua ação'
      : 'Todas',
  )
  const [tipoFiltro, mudarTipoFiltro] = useState('Todos')

  const orientacoes = useMemo(
    () => submissoes.filter((item) => orientaSubmissao(item, usuario)),
    [submissoes, usuario],
  )

  const totais = useMemo(
    () => ({
      total: orientacoes.length,
      pendentes: orientacoes.filter((item) => item.status === 'Aguardando Orientador').length,
      analise: orientacoes.filter((item) => item.status === 'Aguardando Coordenação').length,
      aprovados: orientacoes.filter((item) => item.status === 'Aprovado').length,
    }),
    [orientacoes],
  )

  const resultados = useMemo(
    () =>
      ordenarSubmissoes(
        orientacoes.filter(
          (item) =>
            (filtro === 'Todas' ||
              (filtro === 'Precisa da sua ação' && item.status === 'Aguardando Orientador') ||
              item.status === filtro) &&
            (tipoFiltro === 'Todos' || item.tipo === tipoFiltro),
        ),
      ),
    [filtro, orientacoes, tipoFiltro],
  )

  const tipos = ['Todos', ...new Set(orientacoes.map((item) => item.tipo).filter(Boolean))]

  return (
    <main id="conteudo" className="limite pagina-professor">
      <header
        className="pagina-professor__topo"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div>
          <h1>Submissões</h1>
          <p>
            Acompanhe as produções vinculadas à sua orientação e avalie as solicitações pendentes.
          </p>
        </div>
        <div>
          <a className="botao-primario" href="#submeter">
            + Submeter novo projeto
          </a>
        </div>
      </header>

      <Indicadores
        itens={[
          {
            titulo: 'Total de orientações',
            valor: totais.total,
            icone: 'projetos-detalhe',
            tom: 'primario',
          },
          {
            titulo: 'Aguardando aceite',
            valor: totais.pendentes,
            icone: 'relogio-cursos',
            tom: 'pendente',
          },
          {
            titulo: 'Aguardando coordenação',
            valor: totais.analise,
            icone: 'criterios-detalhe',
            tom: 'andamento',
          },
          {
            titulo: 'Aprovado e publicado',
            valor: totais.aprovados,
            icone: 'confirmacao-cursos',
            tom: 'sucesso',
          },
        ]}
      />

      <div className="pagina-professor__layout">
        <aside className="pagina-professor__filtro-painel" aria-label="Filtros de submissões">
          <div className="pagina-professor__filtro-cabecalho">
            <div>
              <strong>Filtrar submissões</strong>
              <p>Encontre trabalhos por etapa da orientação.</p>
            </div>
            <label className="pagina-professor__tipo">
              <span>Tipo de produção</span>
              <select
                value={tipoFiltro}
                onChange={(evento) => mudarTipoFiltro(evento.target.value)}
              >
                {tipos.map((tipo) => (
                  <option value={tipo} key={tipo}>
                    {tipo}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <nav className="pagina-professor__filtros" aria-label="Filtrar por status">
            {filtros.map((opcao) => (
              <button
                className={filtro === opcao ? 'pagina-professor__filtro--ativo' : ''}
                data-tom={tonsFiltro[opcao]}
                type="button"
                key={opcao}
                aria-pressed={filtro === opcao}
                onClick={() => mudarFiltro(opcao)}
              >
                <span className="pagina-professor__filtro-rotulo">
                  {opcao === 'Aguardando Orientador'
                    ? 'Aguardando orientador'
                    : opcao === 'Aprovado'
                      ? 'Aprovado e publicado'
                      : opcao === 'Aguardando Coordenação'
                        ? 'Aguardando coordenação'
                        : opcao}
                </span>
                <small>
                  {opcao === 'Todas'
                    ? orientacoes.length
                    : opcao === 'Precisa da sua ação'
                      ? orientacoes.filter((item) => item.status === 'Aguardando Orientador').length
                      : orientacoes.filter((item) => item.status === opcao).length}
                </small>
              </button>
            ))}
          </nav>
        </aside>

        <section className="pagina-professor__resultados" aria-label="Feed de submissões">
          <div className="pagina-professor__feed-cabecalho">
            <strong>
              {resultados.length} {resultados.length === 1 ? 'submissão' : 'submissões'}
            </strong>
            <span>Ordenadas por data de envio</span>
          </div>

          <div className="lista-submissoes">
            {resultados.map((item, indice) => {
              const status = item.status || 'Aguardando Orientador'
              const statusNormalizado = status.toLowerCase()
              const tomStatus = statusNormalizado.includes('aprov')
                ? 'aprovado'
                : statusNormalizado.includes('análise') || statusNormalizado.includes('analise')
                  ? 'analise'
                  : statusNormalizado.includes('recus')
                    ? 'recusado'
                    : 'pendente'
              const nomeAutor = nomeDoAutor(item)
              const totalCoautores = Array.isArray(item.autores)
                ? Math.max(item.autores.length - 1, 0)
                : 0
              const totalAnexos = item.documentos?.length || 0

              return (
                <article
                  className={`cartao submissao-feed submissao-feed--${tomStatus}`}
                  style={{ '--indice-feed': indice }}
                  data-tipo={tipoParaData(item.tipo)}
                  key={item.identificador}
                >
                  <a
                    href={enderecoPrivado(`professor/submissao/${item.identificador}`)}
                    className="submissao-feed__gatilho"
                    aria-label={`${status === 'Aguardando Orientador' ? 'Avaliar' : 'Ver detalhes'}: ${item.titulo}`}
                  >
                    <span className="submissao-feed__avatar" aria-hidden="true">
                      {iniciaisDoAutor(nomeAutor)}
                    </span>
                    <span className="submissao-feed__conteudo">
                      <span className="submissao-feed__meta">
                        <span className="submissao-feed__autor-nome">{nomeAutor}</span>
                        {totalCoautores > 0 && (
                          <span className="submissao-feed__coautores">
                            +{totalCoautores} {totalCoautores === 1 ? 'coautor' : 'coautores'}
                          </span>
                        )}
                        <span className="submissao-feed__separador" aria-hidden="true">
                          ·
                        </span>
                        <span>
                          enviou {item.enviadoEm ? `em ${item.enviadoEm}` : 'recentemente'}
                        </span>
                      </span>

                      <h2 className="submissao-feed__titulo" title={item.titulo}>
                        {item.titulo}
                      </h2>

                      <span className="submissao-feed__rodape">
                        {item.tipo && <span className="submissao-feed__tipo">{item.tipo}</span>}
                        <span className={`submissao-feed__status status--${tomStatus}`}>
                          <span className="submissao-feed__status-ponto" aria-hidden="true" />
                          {status === 'Aguardando Orientador'
                            ? 'Aguardando orientador'
                            : status === 'Aprovado pelo orientador'
                              ? 'Aprovado pelo orientador'
                              : status === 'Aguardando Coordenação'
                                ? 'Aguardando coordenação'
                                : status === 'Aprovado'
                                  ? 'Aprovado e publicado'
                                  : status}
                        </span>
                        {[
                          item.curso,
                          totalAnexos > 0 &&
                            `${totalAnexos} ${totalAnexos === 1 ? 'anexo' : 'anexos'}`,
                        ]
                          .filter(Boolean)
                          .join(' · ') && (
                          <span className="submissao-feed__metadados">
                            {[
                              item.curso,
                              totalAnexos > 0 &&
                                `${totalAnexos} ${totalAnexos === 1 ? 'anexo' : 'anexos'}`,
                            ]
                              .filter(Boolean)
                              .join(' · ')}
                          </span>
                        )}
                      </span>
                    </span>

                    <span className="submissao-feed__expandir">
                      {status === 'Aguardando Orientador' ? 'Avaliar' : 'Ver detalhes'}
                      <span className="submissao-feed__seta" aria-hidden="true">
                        ↗
                      </span>
                    </span>
                  </a>
                </article>
              )
            })}
          </div>

          {!resultados.length && (
            <EstadoVazio
              titulo={
                orientacoes.length
                  ? 'Nenhuma submissão neste filtro'
                  : 'Nenhuma orientação disponível'
              }
              descricao={
                orientacoes.length
                  ? 'Limpe os filtros para consultar todas as submissões vinculadas a você.'
                  : 'As submissões em que você for indicado como professor orientador aparecerão aqui.'
              }
              acao={orientacoes.length ? 'Limpar filtros' : undefined}
              aoAcionar={() => {
                mudarFiltro('Todas')
                mudarTipoFiltro('Todos')
              }}
            />
          )}
        </section>
      </div>
    </main>
  )
}
