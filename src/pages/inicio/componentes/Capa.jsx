import { useEffect, useState } from 'react'
import { listarCursos } from '@/api/cursos.js'
import Botao from '@/shared/componentes/Botao.jsx'
import { buscarProjetosDestaque } from '../servicos/buscarProjetosDestaque.js'
import './capa.css'

function Contagem({ alvo }) {
  const [valor, definirValor] = useState(0)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      definirValor(alvo)
      return undefined
    }

    let quadro
    const inicio = performance.now()
    const animar = (agora) => {
      const progresso = Math.min((agora - inicio) / 900, 1)
      definirValor(Math.round(alvo * (1 - (1 - progresso) ** 3)))
      if (progresso < 1) quadro = requestAnimationFrame(animar)
    }
    quadro = requestAnimationFrame(animar)
    return () => cancelAnimationFrame(quadro)
  }, [alvo])

  return <b className="mapa__numero">{String(valor).padStart(2, '0')}</b>
}

export default function Capa() {
  const [contagens, definirContagens] = useState({ cursos: 0, disciplinas: 0, projetos: 0 })

  useEffect(() => {
    const controle = new AbortController()
    Promise.allSettled([
      listarCursos(controle.signal),
      buscarProjetosDestaque(controle.signal),
    ]).then(([resultadoCursos, resultadoProjetos]) => {
        if (controle.signal.aborted) return
        const cursos = resultadoCursos.status === 'fulfilled' ? resultadoCursos.value : []
        const projetos = resultadoProjetos.status === 'fulfilled' ? resultadoProjetos.value : []
        definirContagens({
          cursos: cursos.length,
          disciplinas: cursos.reduce(
            (total, curso) =>
              total +
              (Number(curso.qtdDisciplinasObrigatorias) || 0) +
              (Number(curso.qtdDisciplinasOptativas) || 0),
            0,
          ),
          projetos: projetos.length,
        })
      })
    return () => controle.abort()
  }, [])

  const mapa = [
    {
      href: '#cursos',
      numero: contagens.cursos,
      titulo: 'Formações',
      texto: 'Cursos, duração e modalidade',
    },
    {
      href: '#cursos',
      numero: contagens.disciplinas,
      titulo: 'Matrizes curriculares',
      texto: 'Disciplinas e percurso formativo',
    },
    {
      href: '#projetos',
      numero: contagens.projetos,
      titulo: 'Projetos acadêmicos',
      texto: 'Pesquisas e trabalhos publicados',
    },
  ]

  return (
    <section
      id="inicio"
      className="hero-inicial hero-inicial--sem-imagem"
      aria-labelledby="titulo-inicial"
    >
      <div className="hero-inicial__titulo">
        <h1 id="titulo-inicial">
          Conhecimento
          <br />
          em movimento.
        </h1>
      </div>
      <div className="hero-inicial__apoio">
        <p className="hero-inicial__descricao">
          Descubra formações, explore TCCs e projetos e acompanhe o que a comunidade acadêmica
          transforma em conhecimento.
        </p>
        <div className="hero-inicial__acoes">
          <Botao as="a" href="#cursos">
            Explorar cursos
          </Botao>
          <a className="hero-inicial__acao-secundaria" href="#projetos">
            Explorar projetos
          </a>
        </div>
      </div>
      <nav className="hero-inicial__mapa" aria-label="Explore o portal">
        <ul>
          {mapa.map((item, indice) => (
            <li
              key={item.titulo}
              style={{ '--atraso': `${indice * 100 + 500}ms` }}
            >
              <a href={item.href}>
                <Contagem alvo={item.numero} />
                <span>
                  <strong>{item.titulo}</strong>
                  <small>{item.texto}</small>
                </span>
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </section>
  )
}
