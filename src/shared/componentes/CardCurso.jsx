import Icone from './Icone.jsx'
import './cartao-curso.css'

export default function CardCurso({ curso }) {
  const informacoes = [
    { rotulo: 'Duração', valor: curso.duracao, icone: 'duracao-cursos' },
    { rotulo: 'Modalidade', valor: curso.modalidade, icone: 'modalidade-cursos' },
    {
      rotulo: 'Turno',
      valor: curso.turno,
      icone: curso.turno === 'Noturno' ? 'noturno-cursos' : 'matutino-cursos',
    },
  ]

  return (
    <article className="cartao curso-resumo">
      <div className="curso-resumo__topo">
        <span className="curso-resumo__sigla">{curso.sigla || 'CURSO'}</span>
        {curso.grau && <span className="curso-resumo__grau">{curso.grau}</span>}
      </div>

      <h3 className="curso-resumo__titulo">
        <a className="curso-resumo__link" href={`#curso/${curso.identificador}`}>
          {curso.nome}
        </a>
      </h3>

      <p className="curso-resumo__descricao">{curso.descricao}</p>

      <dl className="curso-resumo__metadados">
        {informacoes.map(({ rotulo, valor, icone }) => (
          <div key={rotulo}>
            <dt>
              <Icone nome={icone} />
              {rotulo}
            </dt>
            <dd>{valor || 'A informar'}</dd>
          </div>
        ))}
      </dl>

      <div className="curso-resumo__base">
        <span className="curso-resumo__acao" aria-hidden="true">
          Conhecer o curso
        </span>
      </div>
    </article>
  )
}
