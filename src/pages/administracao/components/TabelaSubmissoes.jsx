import '../estilos/submissoes.css'
import '../estilos/registros.css'

function prioridadeStatus(status = '') {
  const normalizado = status.toLowerCase()
  if (normalizado.includes('análise') || normalizado.includes('analise')) return 1
  if (normalizado.includes('aguardando')) return 2
  if (normalizado.includes('aprovado') || normalizado.includes('publicado')) return 3
  if (normalizado.includes('recusado')) return 4
  return 5
}

function compararDataRecente(a = '', b = '') {
  // Converte data DD/MM/AAAA para timestamp se aplicável
  const partesA = a.split('/')
  const partesB = b.split('/')
  if (partesA.length === 3 && partesB.length === 3) {
    const dataA = new Date(Number(partesA[2]), Number(partesA[1]) - 1, Number(partesA[0])).getTime()
    const dataB = new Date(Number(partesB[2]), Number(partesB[1]) - 1, Number(partesB[0])).getTime()
    return dataB - dataA
  }
  return 0
}

export default function TabelaSubmissoes({ itens = [], baseDetalhes }) {
  if (!itens.length) {
    return (
      <div className="administracao-vazio" role="status">
        <strong>Nenhuma submissão registrada até o momento.</strong>
        <p>As produções enviadas pelos estudantes aparecerão nesta tabela para acompanhamento.</p>
      </div>
    )
  }

  const itensOrdenados = [...itens].sort((a, b) => {
    const prioridadeA = prioridadeStatus(a.status)
    const prioridadeB = prioridadeStatus(b.status)

    // Se as prioridades de status forem diferentes, status pendente/análise vai para cima
    if (prioridadeA !== prioridadeB) {
      return prioridadeA - prioridadeB
    }

    // Se mesmo status, ordena pela data mais recente (ou id decrescente)
    const diffData = compararDataRecente(a.enviadoEm, b.enviadoEm)
    if (diffData !== 0) return diffData

    return Number(b.id || b.identificador || 0) - Number(a.id || a.identificador || 0)
  })

  return (
    <div className="tabela-submissoes" role="region" aria-label="Lista de submissões" tabIndex={0}>
      <table>
        <caption className="somente-leitores">Acompanhamento de submissões acadêmicas</caption>
        <thead>
          <tr>
            <th scope="col">Projeto</th>
            <th scope="col">Curso</th>
            <th scope="col">Envio</th>
            <th scope="col">Situação</th>
            {baseDetalhes && (
              <th scope="col" className="somente-leitores">
                Ação
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {itensOrdenados.map((item) => {
            const status = item.status || 'Aguardando Orientador'
            const classeStatus = `status status--${status.toLowerCase().replace(/\s+/g, '-')}`
            return (
              <tr key={item.identificador}>
                <th scope="row">
                  {baseDetalhes ? (
                    <a href={`${baseDetalhes}/${encodeURIComponent(item.identificador)}`}>
                      {item.titulo}
                    </a>
                  ) : (
                    item.titulo
                  )}
                  <span>
                    {item.autor}, {item.tipo}
                    {item.orientador ? `, Orientação: ${item.orientador}` : ''}
                  </span>
                </th>
                <td>{item.curso || item.cursoCompleto || '—'}</td>
                <td>{item.enviadoEm || '—'}</td>
                <td>
                  <span className={classeStatus}>{status}</span>
                </td>
                {baseDetalhes && (
                  <td>
                    <a
                      className="tabela-submissoes__abrir"
                      href={`${baseDetalhes}/${encodeURIComponent(item.identificador)}`}
                    >
                      Avaliar
                    </a>
                  </td>
                )}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
