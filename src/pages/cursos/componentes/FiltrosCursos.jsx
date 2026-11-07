import './filtros-cursos.css'

export default function FiltrosCursos({ filtros, alterar, limpar, bloqueado, cursos }) {
  const opcoesUnicas = (campo) =>
    [...new Set(cursos.map((curso) => curso[campo]).filter(Boolean))].sort((a, b) =>
      a.localeCompare(b, 'pt-BR'),
    )
  const campos = [
    ['grau', 'Grau', opcoesUnicas('grau')],
    ['modalidade', 'Modalidade', opcoesUnicas('modalidade')],
    ['campus', 'Campus', opcoesUnicas('campus')],
  ]
  const grupos = [
    ['areas', 'Área de conhecimento', opcoesUnicas('area'), 'area'],
    ['turnos', 'Turno', opcoesUnicas('turno'), 'turno'],
    ['duracoes', 'Duração', ['Até 2 anos', '3 a 4 anos', '4 a 5 anos'], 'duracao'],
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
      <fieldset disabled={bloqueado} className="filtros-cursos__campos">
        <legend className="somente-leitores">Refinar catálogo de cursos</legend>
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
        {grupos.length > 0 && (
          <details className="filtros-cursos__mais">
            <summary>Mais filtros</summary>
            <div className="filtros-cursos__mais-conteudo">
              {grupos.map(([campo, titulo, opcoes, atributo]) => (
                <fieldset className="filtros-cursos__grupo" key={campo}>
                  <legend>{titulo}</legend>
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
                </fieldset>
              ))}
            </div>
          </details>
        )}
        {quantidade > 0 && (
          <button className="filtros-cursos__limpar" type="button" onClick={limpar}>
            Limpar filtros
          </button>
        )}
      </fieldset>
    </aside>
  )
}
