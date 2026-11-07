import Icone from '@/shared/componentes/Icone.jsx'
import './filtros-cursos.css'

export default function FiltrosCursos({ filtros, alterar, limpar, bloqueado, cursos }) {
  const opcoesUnicas = (campo) =>
    [...new Set(cursos.map((curso) => curso[campo]).filter(Boolean))].sort((a, b) =>
      a.localeCompare(b, 'pt-BR'),
    )
  const campos = [
    ['grau', 'Tipo de grau', opcoesUnicas('grau')],
    ['modalidade', 'Modalidade', opcoesUnicas('modalidade')],
    ['campus', 'Campus', opcoesUnicas('campus')],
  ]
  const grupos = [
    ['areas', 'Área de conhecimento', opcoesUnicas('area'), 'area'],
    ['turnos', 'Turno de oferta', opcoesUnicas('turno'), 'turno'],
    ['duracoes', 'Duração prevista', ['Até 2 anos', '3 a 4 anos', '4 a 5 anos'], 'duracao'],
  ].filter(([, , opcoes]) => opcoes.length)
  const quantidade = Object.values(filtros).reduce(
    (total, valor) => total + (Array.isArray(valor) ? valor.length : Number(Boolean(valor))),
    0,
  )
  function alternarOpcao(campo, valor) {
    alterar(
      campo,
      filtros[campo].includes(valor)
        ? filtros[campo].filter((item) => item !== valor)
        : [...filtros[campo], valor],
    )
  }
  return (
    <aside className="filtros-cursos" aria-label="Filtros de cursos">
      <div className="filtros-cursos__titulo">
        <h2>
          <Icone nome="filtrar-cursos" />
          Filtrar cursos
        </h2>
        <span>{bloqueado ? 'Bloqueado' : `${quantidade} ativos`}</span>
      </div>
      <fieldset disabled={bloqueado} className="filtros-cursos__campos">
        <legend className="somente-leitores">Refinar catálogo</legend>
        {campos.map(([campo, titulo, opcoes]) => (
          <label className="filtros-cursos__selecao" key={campo}>
            {titulo}
            <select
              value={filtros[campo]}
              onChange={(evento) => alterar(campo, evento.target.value)}
            >
              <option value="">Todos</option>
              {opcoes.map((opcao) => (
                <option key={opcao}>{opcao}</option>
              ))}
            </select>
          </label>
        ))}
        {grupos.map(([campo, titulo, opcoes, atributo]) => (
          <details open className="filtros-cursos__grupo" key={campo}>
            <summary>
              {titulo}
              <Icone nome="recolher-cursos" />
            </summary>
            <div>
              {opcoes.map((opcao) => (
                <label className="filtros-cursos__opcao" key={opcao}>
                  <input
                    type="checkbox"
                    checked={filtros[campo].includes(opcao)}
                    onChange={() => alternarOpcao(campo, opcao)}
                  />
                  <span>{opcao}</span>
                  {atributo !== 'duracao' && (
                    <small>{cursos.filter((curso) => curso[atributo] === opcao).length}</small>
                  )}
                </label>
              ))}
            </div>
          </details>
        ))}
        <button className="filtros-cursos__limpar" type="button" onClick={limpar}>
          <Icone nome="redefinir-cursos" />
          Limpar filtros
        </button>
      </fieldset>
      <p className="filtros-cursos__nota">
        <Icone nome="informacao-cursos" />
        {bloqueado
          ? 'Seus filtros foram preservados e serão reativados quando o catálogo estiver disponível.'
          : 'Refine a busca usando os dados cadastrados na API de cursos.'}
      </p>
    </aside>
  )
}
