import Indicadores from '@/shared/componentes/Indicadores.jsx'
import './resumo-curso.css'

export default function ResumoCurso({ curso }) {
  const indicadores = [
    ['Duração', curso.duracao, curso.anos],
    ['Modalidade', curso.modalidade, curso.campus],
    ['Turno', curso.turno, null],
    ['Carga horária', curso.cargaHoraria || 'A informar', 'Total integrado'],
    [
      'Matriz',
      curso.componentes ? `${curso.componentes} componentes` : 'A informar',
      curso.componentes
        ? `${curso.obrigatorias} obrig. + ${curso.optativas} opt.`
        : 'Grade curricular',
    ],
  ]

  return (
    <section className="resumo-curso" aria-labelledby="titulo-curso">
      <div className="resumo-curso__identidade">
        <div>
          <p className="resumo-curso__grau">{curso.grau}</p>
          <h1 id="titulo-curso">
            {curso.nome} ({curso.sigla})
          </h1>
          <p>{curso.descricao}</p>
        </div>
      </div>
      <Indicadores
        rotulo="Informações principais do curso"
        itens={indicadores.map(([titulo, valor, detalhe]) => ({ titulo, valor, detalhe }))}
      />
    </section>
  )
}
