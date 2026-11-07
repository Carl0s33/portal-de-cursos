import { useEffect, useState } from 'react'
import Icone from '@/shared/components/Icone.jsx'
import ItemProjeto from '@/shared/components/ItemProjeto.jsx'
import FiltrosProjetos from './components/FiltrosProjetos.jsx'
import { buscarProjetosPublicados } from './services/buscarProjetosPublicados.js'
import './projetos.css'

export default function PaginaProjetos() {
  const [erroCarregamento, mudarErroCarregamento] = useState(false)
  const [publicados, mudarPublicados] = useState([])
  const [filtrosAbertos, mudarFiltrosAbertos] = useState(false)
  const [ordem, mudarOrdem] = useState('nome')
  const [busca, mudarBusca] = useState('')
  const [tipo, mudarTipo] = useState('')
  const [curso, mudarCurso] = useState('')

  useEffect(() => {
    const controle = new AbortController()
    buscarProjetosPublicados(controle.signal)
      .then((registros) => {
        if (!controle.signal.aborted) mudarPublicados(registros)
      })
      .catch(() => {
        if (!controle.signal.aborted) {
          mudarPublicados([])
          mudarErroCarregamento(true)
        }
      })

    return () => controle.abort()
  }, [])

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
    mudarBusca('')
    mudarTipo('')
    mudarCurso('')
  }

  return (
    <main id="conteudo" className="limite pagina-projetos">
      {erroCarregamento && (
        <p role="alert">
          Não foi possível carregar os projetos. Verifique se o serviço está disponível e recarregue
          a página.
        </p>
      )}
      <nav aria-label="Você está aqui">
        <a href="#inicio">Início</a>
        <span aria-hidden="true"> / </span>
        <span aria-current="page">Projetos</span>
      </nav>
      <div className="pagina-projetos__titulo">
        <div>
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
            onClick={() => mudarFiltrosAbertos(!filtrosAbertos)}
          >
            {filtrosAbertos ? 'Recolher filtros' : 'Filtrar projetos'}
          </button>
          <div id="filtros-projetos">
            <FiltrosProjetos
              busca={busca}
              mudarBusca={mudarBusca}
              tipo={tipo}
              mudarTipo={mudarTipo}
              curso={curso}
              mudarCurso={mudarCurso}
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
              <select value={ordem} onChange={(evento) => mudarOrdem(evento.target.value)}>
                <option value="nome">Nome de A a Z</option>
                <option value="curso">Curso</option>
                <option value="tipo">Tipo de trabalho</option>
              </select>
            </label>
          </div>
          {resultados.length ? (
            <ul className="lista-projetos">
              {resultados.map((item) => (
                <li key={item.identificador}>
                  <ItemProjeto projeto={item} />
                </li>
              ))}
            </ul>
          ) : (
            <div className="pagina-projetos__vazio" role="status">
              <span className="pagina-projetos__vazio-icone" aria-hidden="true">
                <Icone nome="vazio-projetos-detalhe" />
              </span>
              <h2>
                {publicados.length
                  ? 'Nenhum projeto encontrado'
                  : 'Ainda não há projetos publicados'}
              </h2>
              <p>
                {publicados.length
                  ? 'Tente outra palavra-chave ou remova os filtros para ampliar a busca.'
                  : 'Os trabalhos publicados aparecerão aqui quando forem aprovados pela coordenação.'}
              </p>
              {publicados.length > 0 && (
                <button className="botao-secundario" type="button" onClick={limpar}>
                  Ver todos os projetos
                </button>
              )}
            </div>
          )}
        </section>
      </div>
    </main>
  )
}
