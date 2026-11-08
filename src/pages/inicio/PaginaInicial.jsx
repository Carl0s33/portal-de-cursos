import { useEffect, useRef } from 'react'
import Capa from './componentes/Capa.jsx'
import SobrePortal from './componentes/SobrePortal.jsx'
import CursosDestaque from './componentes/CursosDestaque.jsx'
import ProjetosDestaque from './componentes/ProjetosDestaque.jsx'
import ChamadaEnviar from './componentes/ChamadaEnviar.jsx'
import NavegacaoSecoes from './componentes/NavegacaoSecoes.jsx'
import './inicio.css'

export default function PaginaInicial() {
  const inicio = useRef(null)

  useEffect(() => {
    if (
      !window.IntersectionObserver ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    )
      return
    const observador = new IntersectionObserver(
      (entradas) => {
        entradas.forEach(({ target, isIntersecting }) => {
          if (!isIntersecting) return
          target.classList.add('inicio-revelado')
          observador.unobserve(target)
        })
      },
      { threshold: 0.01 },
    )

    inicio.current
      .querySelectorAll('section[id]:not(#inicio), #chamada-projeto')
      .forEach((secao) => {
        observador.observe(secao)
      })
    return () => observador.disconnect()
  }, [])
  return (
    <main ref={inicio} id="conteudo" className="limite pagina-inicial">
      <Capa />
      <SobrePortal />
      <ProjetosDestaque />
      <CursosDestaque />
      <div id="chamada-projeto">
        <ChamadaEnviar />
      </div>
      <NavegacaoSecoes />
    </main>
  )
}
