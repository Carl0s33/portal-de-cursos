import { useMemo, useState } from 'react'
import './professor.css'
import { basePortal, enderecoPrivado } from '../../app/rotas.js'

const filtros = ['Todas', 'Aguardando Orientador', 'Em análise', 'Aprovado', 'Recusado']

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
  const nomeOrientador = normalizar(item.orientador)
  const nomeUsuario = normalizar(usuario?.nome)
  if (!nomeOrientador || !nomeUsuario) return true
  return nomeOrientador.includes(nomeUsuario) || nomeUsuario.includes(nomeOrientador)
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
    () =>
      submissoes.filter(
        (item) =>
          orientaSubmissao(item, usuario) &&
          item.tipoAutor !== 'PROFESSOR' &&
          item.tipoAutor !== 'COORDENADOR',
      ),
    [submissoes, usuario],
  )

  const resultados = useMemo(
    () =>
      orientacoes.filter(
        (item) =>
          (filtro === 'Todas' || item.status === filtro) &&
          (tipoFiltro === 'Todos' || item.tipo === tipoFiltro),
      ),
    [filtro, orientacoes, tipoFiltro],
  )

  const tipos = ['Todos', ...new Set(orientacoes.map((item) => item.tipo).filter(Boolean))]

  return (
    <main id="conteudo" className="limite pagina-professor">
      <div className="pagina-professor__topo">
        <div>
          <h1>Submissões para acompanhar</h1>
          <p>
            Veja somente as submissões em que você consta como orientador e faça a avaliação
            inicial.
          </p>
        </div>
        <a className="botao-primario" href={`${basePortal}#submeter`}>
          Submeter projeto
        </a>
      </div>

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
                type="button"
                key={opcao}
                aria-pressed={filtro === opcao}
                onClick={() => definirFiltro(opcao)}
              >
                <span>{opcao}</span>
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
            <span>mais recentes</span>
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
                <article className="submissao-feed" key={item.identificador}>
                  <a
                    href={enderecoPrivado(`professor/submissao/${item.identificador}`)}
                    className="submissao-feed__gatilho"
                  >
                    <span className="cabecalho__iniciais submissao-feed__avatar" aria-hidden="true">
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

                    <span className="submissao-feed__expandir">Abrir projeto →</span>
                  </a>
                </article>
              )
            })}
          </div>

          {!resultados.length && (
            <div className="pagina-professor__vazio">
              <h2>Nenhuma submissão neste filtro</h2>
              <p>Escolha outro status para continuar a revisão.</p>
            </div>
          )}
        </section>
      </div>
    </main>
  )
}
