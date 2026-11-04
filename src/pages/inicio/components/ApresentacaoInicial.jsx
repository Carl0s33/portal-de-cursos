import { useEffect, useState } from 'react'
import { listarCursos } from '@/api/cursos.js'
import './apresentacao-inicial.css'

export default function ApresentacaoInicial() {
  const [cursos, definirCursos] = useState([])
  const [estado, definirEstado] = useState('carregando')

  useEffect(() => {
    const controller = new AbortController()
    listarCursos(controller.signal)
      .then((registros) => {
        if (controller.signal.aborted) return
        definirCursos(registros)
        definirEstado('pronto')
      })
      .catch(() => {
        if (!controller.signal.aborted) definirEstado('indisponivel')
      })
    return () => controller.abort()
  }, [])

  return (
    <section id="inicio" className="hero-inicial" aria-labelledby="titulo-inicial">
      <div className="hero-inicial__texto">
        <h1 id="titulo-inicial">
          Encontre seu curso e veja o que os estudantes produzem.
        </h1>
        <p className="hero-inicial__descricao">
          Consulte matrizes curriculares, projetos integradores e trabalhos de conclusão desenvolvidos no portal acadêmico.
        </p>
        <div className="hero-inicial__acoes">
          <a className="botao-primario" href="#cursos">
            Explorar catálogo de cursos
          </a>
          <a className="hero-inicial__acao-secundaria" href="#projetos">
            Ver produções acadêmicas
          </a>
        </div>
        <dl className="hero-inicial__numeros">
          <div>
            <dd>{estado === 'pronto' ? cursos.length : '—'}</dd>
            <dt>
              {estado === 'indisponivel' ? 'cursos indisponíveis no momento' : 'cursos cadastrados'}
            </dt>
          </div>
        </dl>
      </div>

      <aside className="hero-catalogo" aria-label="Cursos cadastrados">
        <div className="hero-catalogo__cabecalho">
          <span className="hero-catalogo__rotulo">Cursos</span>
          <p className="hero-catalogo__subtitulo">Formações ofertadas no portal</p>
        </div>

        {estado === 'carregando' && (
          <div className="hero-catalogo__estado" role="status">
            <p>Carregando cursos…</p>
          </div>
        )}

        {estado === 'indisponivel' && (
          <div className="hero-catalogo__estado hero-catalogo__estado--aviso" role="status">
            <p>Não foi possível carregar os cursos agora.</p>
            <a href="#cursos" className="hero-catalogo__link-catalogo">Consultar catálogo completo</a>
          </div>
        )}

        {estado === 'pronto' && (
          cursos.length > 0 ? (
            <ul className="hero-catalogo__lista">
              {cursos.slice(0, 4).map((curso) => (
                <li key={curso.identificador} className="hero-catalogo__item">
                  <a href={`#curso/${curso.identificador}`} className="hero-catalogo__link">
                    <div className="hero-catalogo__info">
                      <strong className="hero-catalogo__nome">{curso.nome}</strong>
                      <span className="hero-catalogo__detalhes">
                        {[curso.grau, curso.turno].filter(Boolean).join(', ')}
                      </span>
                    </div>
                    {curso.sigla && (
                      <span className="etiqueta hero-catalogo__sigla">{curso.sigla}</span>
                    )}
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <div className="hero-catalogo__estado" role="status">
              <p>Nenhum curso cadastrado no momento.</p>
            </div>
          )
        )}

        {estado === 'pronto' && cursos.length > 4 && (
          <div className="hero-catalogo__rodape">
            <a href="#cursos" className="hero-catalogo__ver-todos">
              Ver todos os {cursos.length} cursos
            </a>
          </div>
        )}
      </aside>
    </section>
  )
}
