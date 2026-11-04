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
          Da formação
          <br />à criação.
        </h1>
        <p className="hero-inicial__descricao">
          Conheça as formações oferecidas, consulte as matérias e acompanhe os trabalhos acadêmicos
          desenvolvidos pelos estudantes.
        </p>
        <div className="hero-inicial__acoes">
          <a className="botao-primario" href="#cursos">
            Explorar cursos
          </a>
          <a className="hero-inicial__acao-secundaria" href="#projetos">
            Conhecer os projetos
          </a>
        </div>
        <dl className="hero-inicial__numeros">
          <div>
            <dd>{estado === 'pronto' ? cursos.length : '—'}</dd>
            <dt>
              {estado === 'indisponivel' ? 'cursos indisponíveis agora' : 'cursos cadastrados'}
            </dt>
          </div>
        </dl>
      </div>
      <aside className="hero-carrossel hero-carrossel--informativo" aria-label="Sobre o portal">
        <div className="hero-destaque__conteudo">
          <p className="hero-inicial__rotulo">Portal de Cursos</p>
          <h2>Conhecimento que começa no curso e ganha forma em cada projeto.</h2>
          <p className="hero-destaque__resumo">
            Consulte informações acadêmicas mantidas pelos serviços do portal e encontre o caminho
            para a sua formação.
          </p>
          <a className="hero-destaque__acao" href="#cursos">
            Ver formações disponíveis
          </a>
        </div>
      </aside>
    </section>
  )
}
