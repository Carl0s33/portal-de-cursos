import '../estilos/submissoes.css'
import '../estilos/registros.css'

export default function TabelaSubmissoes({ itens = [], baseDetalhes }) {
  if (!itens.length) {
    return (
      <div className="administracao-vazio" role="status">
        <strong>Nenhuma submissão registrada até o momento.</strong>
        <p>As produções enviadas pelos estudantes aparecerão nesta tabela para acompanhamento.</p>
      </div>
    )
  }

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
          {itens.map((item) => {
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
