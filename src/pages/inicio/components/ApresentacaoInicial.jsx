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
    <section id="inicio" className="hero-inicial hero-inicial--sem-imagem" aria-labelledby="titulo-inicial">
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
      </div>
      <dl className="hero-inicial__numeros" aria-live="polite">
        <div>
          <dd>{estado === 'pronto' ? cursos.length : '—'}</dd>
          <dt>
            {estado === 'indisponivel' ? 'cursos indisponíveis agora' : 'cursos cadastrados'}
          </dt>
        </div>
      </dl>
    </section>
  )
}
