import Icone from '@/shared/componentes/Icone.jsx'
import './capa.css'

export default function Capa() {
  return (
    <section
      id="inicio"
      className="hero-inicial hero-inicial--sem-imagem"
      aria-labelledby="titulo-inicial"
    >
      <div className="hero-inicial__texto">
        <h1 id="titulo-inicial">
          Da formação
          <br />à criação.
        </h1>
        <p className="hero-inicial__descricao">
          Da escolha do curso ao projeto publicado, conheça as formações e o que a comunidade
          acadêmica produz.
        </p>
        <div className="hero-inicial__acoes">
          <a className="botao-primario" href="#cursos">
            Explorar cursos
          </a>
          <a className="hero-inicial__acao-secundaria" href="#projetos">
            Conhecer os projetos
          </a>
        </div>
      </div>
      <nav className="hero-inicial__navegacao" aria-label="Explore o portal">
        <ul>
          <li>
            <a href="#cursos">
              <Icone nome="catalogo-cursos" />
              <span>
                <strong>Formações</strong>
                <small>Cursos, duração e modalidade</small>
              </span>
            </a>
          </li>
          <li>
            <a href="#cursos">
              <Icone nome="grade-detalhe" />
              <span>
                <strong>Matrizes curriculares</strong>
                <small>Disciplinas e percurso formativo</small>
              </span>
            </a>
          </li>
          <li>
            <a href="#projetos">
              <Icone nome="laboratorio" />
              <span>
                <strong>Projetos acadêmicos</strong>
                <small>Pesquisas e trabalhos publicados</small>
              </span>
            </a>
          </li>
        </ul>
      </nav>
    </section>
  )
}
