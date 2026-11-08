import Botao from '@/shared/componentes/Botao.jsx'
import './capa.css'

export default function Capa() {
  return (
    <section id="inicio" className="hero-inicial" aria-label="Apresentação do Portal de Cursos">
      <div className="hero-inicial__sombra" aria-hidden="true" />

      <div className="hero-inicial__conteudo">
        <span className="hero-inicial__tag">Rede Integrada de Ensino e Pesquisa</span>
        
        <h1 className="hero-inicial__titulo-principal">
          Formação acadêmica e produção científica em todos os campi.
        </h1>

        <p className="hero-inicial__descricao">
          Conecte-se aos cursos, matrizes curriculares e projetos de pesquisa, extensão e TCCs 
          desenvolvidos por estudantes e docentes em toda a nossa instituição.
        </p>

        <div className="hero-inicial__acoes">
          <Botao as="a" href="#cursos" className="hero-inicial__cta-primario">
            Explorar cursos
          </Botao>
          <a href="#projetos" className="hero-inicial__cta-secundario">
            Ver projetos e TCCs <span aria-hidden="true">→</span>
          </a>
        </div>
      </div>
    </section>
  )
}
