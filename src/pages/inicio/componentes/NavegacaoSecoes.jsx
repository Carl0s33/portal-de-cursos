import { useEffect, useState } from 'react'
import './navegacao-secoes.css'

const secoes = [
  { id: 'inicio', rotulo: 'Início' },
  { id: 'sobre', rotulo: 'Sobre' },
  { id: 'projetos', rotulo: 'Projetos' },
  { id: 'tccs', rotulo: 'TCCs' },
  { id: 'cursos', rotulo: 'Cursos' },
  { id: 'chamada-projeto', rotulo: 'Submeter' },
]

export default function NavegacaoSecoes() {
  const [ativa, mudarAtiva] = useState(0)

  useEffect(() => {
    const elementos = secoes.map(({ id }) => document.getElementById(id)).filter(Boolean)
    if (!elementos.length || !('IntersectionObserver' in window)) return

    const observer = new IntersectionObserver(
      (entradas) => {
        const visiveis = entradas
          .filter((entrada) => entrada.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)
        if (!visiveis.length) return
        const indice = secoes.findIndex(({ id }) => id === visiveis[0].target.id)
        if (indice >= 0) mudarAtiva(indice)
      },
      { rootMargin: '-18% 0px -58% 0px', threshold: [0, 0.15, 0.35, 0.6] },
    )

    elementos.forEach((elemento) => observer.observe(elemento))
    return () => observer.disconnect()
  }, [])

  function irPara(indice) {
    const item = secoes[indice]
    if (!item) return
    document.getElementById(item.id)?.scrollIntoView({
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
      block: 'start',
    })
    mudarAtiva(indice)
  }

  return (
    <nav className="navegacao-secoes" aria-label="Navegação pelas seções da página inicial">
      <button
        className="navegacao-secoes__seta"
        type="button"
        aria-label="Ir para a seção anterior"
        disabled={ativa === 0}
        onClick={() => irPara(ativa - 1)}
      >
        <svg viewBox="0 0 16 16" aria-hidden="true">
          <path d="m4 10 4-4 4 4" />
        </svg>
      </button>
      {secoes.map((secao, indice) => (
        <button
          className={`navegacao-secoes__item${ativa === indice ? ' navegacao-secoes__item--ativa' : ''}`}
          type="button"
          key={secao.id}
          aria-label={`Ir para ${secao.rotulo}`}
          aria-current={ativa === indice ? 'location' : undefined}
          onClick={() => irPara(indice)}
        >
          <span className="navegacao-secoes__ponto" aria-hidden="true" />
          <span className="navegacao-secoes__rotulo">{secao.rotulo}</span>
        </button>
      ))}
      <button
        className="navegacao-secoes__seta"
        type="button"
        aria-label="Ir para a próxima seção"
        disabled={ativa === secoes.length - 1}
        onClick={() => irPara(ativa + 1)}
      >
        <svg viewBox="0 0 16 16" aria-hidden="true">
          <path d="m4 6 4 4 4-4" />
        </svg>
      </button>
    </nav>
  )
}
