import { ordenarSubmissoes } from '@/shared/utils/ordenarSubmissoes.js'
import EstadoVazio from '@/shared/components/EstadoVazio.jsx'
import Indicadores from '@/shared/components/Indicadores.jsx'
import { useMemo, useState } from 'react'
import Icone from '@/shared/components/Icone.jsx'
import '@/shared/styles/painel.css'
import './professor.css'
import { enderecoPrivado } from '../../app/rotas.js'

const filtros = ['Todas', 'Aguardando Orientador', 'Em análise', 'Aprovado', 'Recusado']

const iconesFiltro = {
  Todas: 'projetos-detalhe',
  'Aguardando Orientador': 'relogio-cursos',
  'Em análise': 'criterios-detalhe',
  Aprovado: 'confirmacao-cursos',
  Recusado: 'erro-cursos',
}

const tonsFiltro = {
  Todas: 'todas',
  'Aguardando Orientador': 'pendente',
  'Em análise': 'analise',
  Aprovado: 'aprovado',
  Recusado: 'recusado',
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
  if (item.orientadorId && idUsuario && String(item.orientadorId) === String(idUsuario)) {
    return true
  }
  // Verifica se está na lista de professores do projeto (orientador ou participante)
  if (Array.isArray(item.professores) && idUsuario) {
    if (item.professores.some((p) => String(p.professorId || p.id) === String(idUsuario))) {
      return true
    }
  }
  const nomeOrientador = normalizar(item.orientador)
  const nomeUsuario = normalizar(usuario?.nome)
  if (!nomeOrientador || !nomeUsuario) return true
  if (nomeOrientador.includes(nomeUsuario) || nomeUsuario.includes(nomeOrientador)) {
    return true
  }
  if (Array.isArray(item.professores)) {
    return item.professores.some((p) => {
      const pNome = normalizar(p.nome || p.professorNome)
      return pNome && (pNome.includes(nomeUsuario) || nomeUsuario.includes(pNome))
    })
  }
  return false
}

function extrairIniciais(nome) {
  if (!nome) return 'AL'
  const partes = nome.trim().split(/\s+/)
  if (partes.length === 1) return partes[0].slice(0, 2).toUpperCase()
  return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase()
}

function nomeDoAutor(item) {
  if (item.autor) return item.autor
  const primeiro = Array.isArray(item.autores) ? item.autores[0] : null
  if (typeof primeiro === 'string') return primeiro
  return primeiro?.nome || 'Aluno'
}

export default function PaginaProfessor({ submissoes, usuario }) {
  const [filtro, definirFiltro] = useState('Todas')
  const [tipoFiltro, definirTipoFiltro] = useState('Todos')

  const orientacoes = useMemo(
    () => submissoes.filter((item) => orientaSubmissao(item, usuario)),
    [submissoes, usuario],
  )

  const totais = useMemo(
    () => ({
      total: orientacoes.length,
      pendentes: orientacoes.filter((item) => item.status === 'Aguardando Orientador').length,
      analise: orientacoes.filter((item) => item.status === 'Em análise').length,
      aprovados: orientacoes.filter((item) => item.status === 'Aprovado').length,
    }),
    [orientacoes],
  )

  const resultados = useMemo(
    () =>
      ordenarSubmissoes(
        orientacoes.filter(
          (item) =>
            (filtro === 'Todas' || item.status === filtro) &&
            (tipoFiltro === 'Todos' || item.tipo === tipoFiltro),
        ),
      ),
    [filtro, orientacoes, tipoFiltro],
  )

  const tipos = ['Todos', ...new Set(orientacoes.map((item) => item.tipo).filter(Boolean))]

  return (
    <main id="conteudo" className="limite pagina-professor">
      <header className="pagina-professor__topo" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1>Submissões para acompanhar</h1>
          <p>
            Veja as produções em que você consta como orientador ou colaborador e realize avaliações ou submeta novos projetos.
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
          },
          {
            titulo: 'Aguardando aceite',
            valor: totais.pendentes,
            icone: 'relogio-cursos',
          },
          {
            titulo: 'Na coordenação',
            valor: totais.analise,
            icone: 'criterios-detalhe',
          },
          {
            titulo: 'Publicadas',
            valor: totais.aprovados,
            icone: 'confirmacao-cursos',
          },
        ]}
      />

      <div className="pagina-professor__layout">
        <aside className="pagina-professor__filtro-painel" aria-label="Filtros de submissões">
          <div>
            <strong>Filtrar submissões</strong>
            <p>Encontre projetos por tipo ou etapa da orientação.</p>
          </div>
          <nav className="pagina-professor__filtros" aria-label="Filtrar por status">
            {filtros.map((opcao) => (
              <button
                className={filtro === opcao ? 'pagina-professor__filtro--ativo' : ''}
                data-tom={tonsFiltro[opcao]}
                type="button"
                key={opcao}
                aria-pressed={filtro === opcao}
                onClick={() => definirFiltro(opcao)}
              >
                <span className="pagina-professor__filtro-rotulo">
                  <Icone nome={iconesFiltro[opcao]} />
                  <span>{opcao}</span>
                </span>
                <small>
                  {opcao === 'Todas'
                    ? orientacoes.length
                    : orientacoes.filter((item) => item.status === opcao).length}
                </small>
              </button>
            ))}
          </nav>
          <label className="pagina-professor__tipo">
            <span>Tipo de produção</span>
            <select
              value={tipoFiltro}
              onChange={(evento) => definirTipoFiltro(evento.target.value)}
            >
              {tipos.map((tipo) => (
                <option value={tipo} key={tipo}>
                  {tipo}
                </option>
              ))}
            </select>
          </label>
        </aside>

        <section className="pagina-professor__resultados" aria-label="Feed de submissões">
          <div className="pagina-professor__feed-cabecalho">
            <strong>
              {resultados.length} {resultados.length === 1 ? 'submissão' : 'submissões'}
            </strong>
            <span>Prioridade e ordem de chegada</span>
          </div>

          <div className="lista-submissoes">
            {resultados.map((item) => {
              const status = item.status || 'Aguardando Orientador'
              const nomeAutor = nomeDoAutor(item)
              const totalCoautores = Array.isArray(item.autores)
                ? Math.max(item.autores.length - 1, 0)
                : 0
              const totalAnexos = item.documentos?.length || 0

              return (
                <article
                  className={`submissao-feed submissao-feed--${tonsFiltro[status] || 'pendente'}`}
                  key={item.identificador}
                >
                  <a
                    href={enderecoPrivado(`professor/submissao/${item.identificador}`)}
                    className="submissao-feed__gatilho"
                  >
                    <span className="submissao-feed__avatar" aria-hidden="true">
                      {extrairIniciais(nomeAutor)}
                    </span>

                    <span className="submissao-feed__conteudo">
                      <span className="submissao-feed__meta">
                        <span className="submissao-feed__autor-nome">{nomeAutor}</span>
                        {totalCoautores > 0 && (
                          <span className="submissao-feed__coautores-badge">
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

                      <h2 className="submissao-feed__titulo">{item.titulo}</h2>

                      <span className="submissao-feed__rodape">
                        <span
                          className={`status status--${status.toLowerCase().replace(/\s+/g, '-')}`}
                        >
                          {status}
                        </span>
                        {item.tipo && <span className="submissao-feed__chip">{item.tipo}</span>}
                        {item.curso && <span className="submissao-feed__chip">{item.curso}</span>}
                        {totalAnexos > 0 && (
                          <span className="submissao-feed__chip">
                            {totalAnexos} {totalAnexos === 1 ? 'anexo' : 'anexos'}
                          </span>
                        )}
                      </span>
                    </span>

                    <span className="submissao-feed__expandir">Avaliar submissão</span>
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
                definirFiltro('Todas')
                definirTipoFiltro('Todos')
              }}
            />
          )}
        </section>
      </div>
    </main>
  )
}
