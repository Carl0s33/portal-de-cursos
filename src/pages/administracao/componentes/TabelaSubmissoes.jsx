import '../estilos/submissoes.css'
import '../estilos/registros.css'

export default function TabelaSubmissoes({
  itens = [],
  baseDetalhes,
  ocultarCurso = false,
  textoVazio,
  acaoVaziaHref,
}) {
  if (!itens.length) {
    return (
      <div className="administracao-vazio" role="status">
        <strong>{textoVazio || 'Nenhuma submissão registrada até o momento.'}</strong>
        <p>
          {acaoVaziaHref ? (
            <a href={acaoVaziaHref}>Consultar todas as produções →</a>
          ) : (
            'As produções enviadas pelos estudantes aparecerão nesta tabela para acompanhamento.'
          )}
        </p>
      </div>
    )
  }

  return (
    <div className="tabela-container" role="region" aria-label="Lista de submissões" tabIndex={0}>
      <table className="tabela">
        <caption className="somente-leitores">Acompanhamento de submissões acadêmicas</caption>
        <thead>
          <tr>
            <th scope="col">Projeto</th>
            {!ocultarCurso && <th scope="col">Curso</th>}
            <th scope="col">Envio</th>
            <th scope="col">Situação</th>
            {baseDetalhes && <th scope="col">Ação</th>}
          </tr>
        </thead>
        <tbody>
          {itens.map((item) => {
            const status = item.status || 'Aguardando Orientador'
            const chaveStatus =
              {
                'Aprovado pelo orientador': 'aprovado-pelo-orientador',
                'Aguardando Coordenação': 'aguardando-coordenação',
                'Recusado pelo orientador': 'recusado-pelo-orientador',
                'Publicação recusada': 'publicação-recusada',
                'Precisa de revisão': 'em-análise',
              }[status] || status.toLowerCase().replace(/\s+/g, '-')
            const classeStatus = `status status--${chaveStatus}`
            const rotuloStatus =
              status === 'Aguardando Orientador'
                ? 'Aguardando orientador'
                : status === 'Aprovado pelo orientador'
                  ? 'Aprovado pelo orientador'
                  : status === 'Aguardando Coordenação'
                    ? 'Aguardando coordenação'
                    : status === 'Aprovado'
                      ? 'Aprovado e publicado'
                      : status === 'Recusado pelo orientador'
                        ? 'Recusado pelo orientador'
                        : status === 'Publicação recusada'
                          ? 'Publicação recusada'
                          : status
            return (
              <tr key={item.identificador}>
                <th scope="row">
                  <span className="tabela__titulo">
                    {baseDetalhes ? (
                      <a href={`${baseDetalhes}/${encodeURIComponent(item.identificador)}`}>
                        {item.titulo}
                      </a>
                    ) : (
                      item.titulo
                    )}
                  </span>
                  <span className="tabela__descricao">
                    {item.autor} · {item.tipo}
                    {item.orientador ? ` · Orientação: ${item.orientador}` : ''}
                  </span>
                </th>
                {!ocultarCurso && (
                  <td data-label="Curso">{item.curso || item.cursoCompleto || '—'}</td>
                )}
                <td data-label="Envio">{item.enviadoEm || '—'}</td>
                <td data-label="Situação">
                  <span className={classeStatus}>{rotuloStatus}</span>
                </td>
                {baseDetalhes && (
                  <td data-label="Ação">
                    <a
                      className={
                        status === 'Aguardando Coordenação'
                          ? 'tabela-submissoes__abrir tabela-submissoes__avaliar'
                          : 'tabela-submissoes__abrir'
                      }
                      href={`${baseDetalhes}/${encodeURIComponent(item.identificador)}`}
                    >
                      {status === 'Aguardando Coordenação' ? 'Avaliar' : 'Ver detalhes'}
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
