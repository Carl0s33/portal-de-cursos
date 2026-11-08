import './sobre-portal.css'

const passos = [
  {
    numero: '01',
    titulo: 'Explore os cursos',
    texto:
      'Consulte formações, disciplinas e informações acadêmicas antes de escolher seu percurso.',
  },
  {
    numero: '02',
    titulo: 'Apresente seu projeto',
    texto:
      'Descreva a proposta, indique o orientador e envie os documentos necessários para avaliação.',
  },
  {
    numero: '03',
    titulo: 'Acompanhe a avaliação',
    texto:
      'O orientador indicado faz o aceite inicial; em seguida, a coordenação realiza a avaliação final.',
  },
]

export default function SobrePortal() {
  return (
    <section className="sobre-portal" id="sobre" aria-labelledby="titulo-sobre-portal">
      <div className="sobre-portal__abertura">
        <div className="sobre-portal__chamada">
          <h2 id="titulo-sobre-portal">Cursos e projetos acadêmicos, em um só lugar.</h2>
        </div>
        <div className="sobre-portal__contexto">
          <p>
            Explore as formações e acompanhe projetos desde a submissão até a publicação.
            Estudantes, professores e coordenações encontram aqui as informações e etapas de que
            precisam.
          </p>
          <span>Um espaço para estudantes, docentes e coordenações.</span>
        </div>
      </div>

      <ol className="sobre-portal__fluxo" aria-label="Como o portal funciona">
        {passos.map((passo) => (
          <li className="sobre-portal__passo" data-revelacao key={passo.numero}>
            <span className="sobre-portal__numero" aria-hidden="true">
              {passo.numero}
            </span>
            <span className="somente-leitores">Etapa {passo.numero}</span>
            <h3>{passo.titulo}</h3>
            <p>{passo.texto}</p>
          </li>
        ))}
      </ol>

      <p className="sobre-portal__publicacao">
        <span>
          <strong>Da avaliação à biblioteca.</strong> Trabalhos aprovados pela coordenação passam a
          integrar o acervo público.
        </span>
      </p>
    </section>
  )
}
