import './cartao-catalogo.css'

export default function CardCatalogo({ curso }) {
  const informacoes = [
    ['Duração', curso.duracao],
    ['Modalidade', curso.modalidade],
    ['Turno', curso.turno],
  ].filter(([, valor]) => valor)

  return (
    <article className="cartao cartao--clicavel curso-catalogo">
      <div className="curso-catalogo__topo">
        <span className="curso-catalogo__grau">
          {curso.grau === 'Tecnologia' ? 'Graduação tecnológica' : curso.grau}
        </span>
        <span className="curso-catalogo__sigla">{curso.sigla}</span>
      </div>

      <h2 className="curso-catalogo__titulo">
        <a
          className="curso-catalogo__link"
          href={`#curso/${curso.identificador}`}
          aria-label={`Conhecer ${curso.nome}`}
        >
          {curso.nome}
        </a>
      </h2>

      <p className="curso-catalogo__descricao">{curso.descricao}</p>

      <dl className="curso-catalogo__metadados">
        {informacoes.map(([rotulo, valor]) => (
          <div key={rotulo}>
            <dt>{rotulo}</dt>
            <dd title={valor || 'A informar'}>{valor || 'A informar'}</dd>
          </div>
        ))}
      </dl>

      <div className="curso-catalogo__base">
        {curso.campus && <p className="curso-catalogo__campus">{curso.campus}</p>}
        <span className="curso-catalogo__acao" aria-hidden="true">
          <span>Conhecer o curso</span>
          <span aria-hidden="true">↗</span>
        </span>
      </div>
    </article>
  )
}
