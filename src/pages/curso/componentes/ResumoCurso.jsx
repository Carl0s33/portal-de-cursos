import Icone from '@/shared/componentes/Icone.jsx'
import './resumo-curso.css'

export default function ResumoCurso({ curso }) {
  const indicadores = [
    ['Duração', curso.duracao, curso.anos, 'duracao-detalhe'],
    ['Modalidade', curso.modalidade, curso.campus, 'modalidade-detalhe'],
    ['Turno', curso.turno, null, 'turno-detalhe'],
    ['Carga horária', curso.cargaHoraria || 'A informar', 'Total integrado', 'carga-detalhe'],
    [
      'Matriz',
      curso.componentes ? `${curso.componentes} componentes` : 'A informar',
      curso.componentes
        ? `${curso.obrigatorias} obrig. + ${curso.optativas} opt.`
        : 'Grade curricular',
      'matriz-detalhe',
    ],
  ]

  return (
    <section className="resumo-curso" aria-labelledby="titulo-curso">
      <div className="resumo-curso__identidade">
        <div>
          <span className="etiqueta">{curso.grau}</span>
          <h1 id="titulo-curso">
            {curso.nome} ({curso.sigla})
          </h1>
          <p>{curso.descricao}</p>
        </div>
      </div>
      <dl className="resumo-curso__indicadores">
        {indicadores.map(([titulo, valor, apoio, icone]) => (
          <div key={titulo}>
            <dt>
              {titulo}
              <Icone nome={icone} />
            </dt>
            <dd>{valor}</dd>
            {apoio && <small>{apoio}</small>}
          </div>
        ))}
      </dl>
    </section>
  )
}
