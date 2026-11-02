import { useEffect, useState } from 'react'
import { listarProjetos } from '@/api/projetos.js'
import ItemProjeto from '@/shared/components/ItemProjeto.jsx'
import FiltrosProjetos from './components/FiltrosProjetos.jsx'
import './projetos.css'

export default function PaginaProjetos({ itens = [] }) {
  const [projetosApi, definirProjetosApi] = useState(null)
  const [filtrosAbertos, definirFiltrosAbertos] = useState(false)
  const [ordem, definirOrdem] = useState('nome')
  const [busca, definirBusca] = useState('')
  const [tipo, definirTipo] = useState('')
  const [curso, definirCurso] = useState('')

  useEffect(() => {
    const controle = new AbortController()
    listarProjetos(null, controle.signal)
      .then((dados) => {
        if (Array.isArray(dados)) {
          const mapeados = dados.map((p) => ({
            id: p.id,
            identificador: String(p.id),
            nome: p.nome,
            descricao: p.descricao,
            tipo:
              p.tipoProjeto === 'TCC'
                ? 'TCC'
                : p.tipoProjeto === 'PROJETO_INTEGRADOR'
                  ? 'Projeto integrador'
                  : p.tipoProjeto === 'PROJETO_PESQUISA'
                    ? 'Pesquisa'
                    : p.tipoProjeto === 'PROJETO_EXTENSAO'
                      ? 'Extensão'
                      : p.tipoProjeto || '',
            curso: p.cursoId ? `Curso ${p.cursoId}` : '',
            autores:
              Array.isArray(p.autores) && p.autores.length
                ? p.autores.map((a) => (typeof a === 'string' ? a : a.nome)).join(', ')
                : 'Não informado',
            orientador: (() => {
              if (p.orientador) return p.orientador
              if (p.orientadorId) return `Orientador ${p.orientadorId}`
              const orientador = p.professores?.find((prof) => prof.papel === 'ORIENTADOR')
              if (orientador) return `Orientador ${orientador.professorId}`
              if (p.professores?.length) return `Professor ${p.professores[0].professorId}`
              return 'Não informado'
            })(),
            status: p.statusProjeto,
          }))
          definirProjetosApi(mapeados)
        }
      })
      .catch(() => {
        // Se falhar ou rota não implementada no back, mantém fallback para itens recebidos via props
      })

    return () => controle.abort()
  }, [])

  // O catálogo público exibe apenas projetos que já foram aprovados pela coordenação para publicação (status PUBLICADO)
  // Projetos com status APROVADO (aceitos apenas pelo orientador) aguardam aprovação do coordenador antes de serem exibidos aqui
  const publicados = (projetosApi !== null ? projetosApi : itens).filter((p) => {
    if (!p.status) return true
    return p.status === 'PUBLICADO' || p.status === 'Publicado'
  })

  const normalizar = (texto) =>
    (texto || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()

  const resultados = publicados
    .filter(
      (item) =>
        (!tipo || item.tipo === tipo) &&
        (!curso || item.curso === curso) &&
        normalizar(`${item.nome} ${item.descricao} ${item.orientador}`).includes(
          normalizar(busca.trim()),
        ),
    )
    .sort((a, b) =>
      (ordem === 'curso' ? a.curso : ordem === 'tipo' ? a.tipo : a.nome).localeCompare(
        ordem === 'curso' ? b.curso : ordem === 'tipo' ? b.tipo : b.nome,
        'pt-BR',
      ),
    )

  function limpar() {
    definirBusca('')
    definirTipo('')
    definirCurso('')
  }

  return (
    <main id="conteudo" className="limite pagina-projetos">
      <nav aria-label="Você está aqui">
        <a href="#inicio">Início</a>
        <span aria-hidden="true"> / </span>
        <span aria-current="page">Projetos</span>
      </nav>
      <div className="pagina-projetos__titulo">
        <div>
          <p className="pagina-projetos__rotulo">Produção acadêmica</p>
          <h1>Produções acadêmicas</h1>
          <p>Explore os trabalhos avaliados e aprovados pelos orientadores e coordenadores.</p>
        </div>
        <a className="botao-primario" href="#submeter">
          Submeter projeto
        </a>
      </div>
      <div className="pagina-projetos__grade">
        <div
          className={`pagina-projetos__painel ${filtrosAbertos ? 'pagina-projetos__painel--aberto' : ''}`}
        >
          <button
            className="pagina-projetos__alternar"
            aria-expanded={filtrosAbertos}
            aria-controls="filtros-projetos"
            onClick={() => definirFiltrosAbertos(!filtrosAbertos)}
          >
            {filtrosAbertos ? 'Recolher filtros' : 'Filtrar projetos'}
          </button>
          <div id="filtros-projetos">
            <FiltrosProjetos
              busca={busca}
              definirBusca={definirBusca}
              tipo={tipo}
              definirTipo={definirTipo}
              curso={curso}
              definirCurso={definirCurso}
              publicados={publicados}
              limpar={limpar}
            />
          </div>
        </div>
        <section aria-label="Projetos aprovados">
          <div className="pagina-projetos__resumo">
            <p className="pagina-projetos__contagem" role="status" aria-live="polite">
              {resultados.length}{' '}
              {resultados.length === 1 ? 'projeto encontrado' : 'projetos encontrados'}
            </p>
            <label>
              Ordenar por
              <select value={ordem} onChange={(evento) => definirOrdem(evento.target.value)}>
                <option value="nome">Nome de A a Z</option>
                <option value="curso">Curso</option>
                <option value="tipo">Tipo de trabalho</option>
              </select>
            </label>
          </div>
          {resultados.length ? (
            <div className="lista-projetos">
              {resultados.map((item) => (
                <ItemProjeto key={item.identificador} projeto={item} />
              ))}
            </div>
          ) : (
            <div className="pagina-projetos__vazio">
              <h2>
                {publicados.length
                  ? 'Nenhum projeto encontrado'
                  : 'Ainda não há projetos publicados'}
              </h2>
              <p>
                {publicados.length
                  ? 'Tente outra palavra-chave ou remova os filtros para ampliar a busca.'
                  : 'Os trabalhos publicados aparecerão aqui quando forem cadastrados.'}
              </p>
              <button className="botao-secundario" onClick={limpar}>
                Ver todos os projetos
              </button>
            </div>
          )}
        </section>
      </div>
    </main>
  )
}
