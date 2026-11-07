import Icone from '@/shared/componentes/Icone.jsx'
import './cartao-catalogo.css'

export default function CardCatalogo({ curso }) {
  const informacoes = [
    ['Duração', curso.duracao, 'duracao-cursos'],
    ['Modalidade', curso.modalidade, 'modalidade-cursos'],
    ['Turno', curso.turno, curso.turno === 'Noturno' ? 'noturno-cursos' : 'matutino-cursos'],
  ]

  return (
    <article className="cartao curso-catalogo">
      <div className="curso-catalogo__topo">
        <span className="curso-catalogo__simbolo" aria-hidden="true">
          <Icone nome="grau-detalhe" />
        </span>
        <span className="curso-catalogo__grau">
          {curso.grau === 'Tecnologia' ? 'Graduação tecnológica' : curso.grau}
        </span>
        <span className="curso-catalogo__sigla">{curso.sigla}</span>
      </div>

      <h2 className="curso-catalogo__titulo">
        <a className="curso-catalogo__link" href={`#curso/${curso.identificador}`}>
          {curso.nome}
        </a>
      </h2>

      <p className="curso-catalogo__descricao">{curso.descricao}</p>

      <dl className="curso-catalogo__metadados">
        {informacoes.map(([rotulo, valor, icone]) => (
          <div key={rotulo}>
            <dt>
              <Icone nome={icone} />
              {rotulo}
            </dt>
            <dd title={valor || 'A informar'}>{valor || 'A informar'}</dd>
          </div>
        ))}
      </dl>

      <div className="curso-catalogo__base">
        {curso.campus && (
          <p className="curso-catalogo__campus">
            <Icone nome="localizacao" />
            <span>{curso.campus}</span>
          </p>
        )}
        <span className="curso-catalogo__acao" aria-hidden="true">
          <span>Conhecer o curso</span>
          <Icone nome="seta-cursos" />
        </span>
      </div>
    </article>
  )
}
