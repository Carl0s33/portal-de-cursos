import { useEffect, useState } from 'react'

export default function CountUp({ to, duration = 900, suffix = '' }) {
  const [n, setN] = useState(0)

  useEffect(() => {
    const valorAlvo = Number(to) || 0
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setN(valorAlvo)
      return
    }

    let raf
    let start

    const tick = (t) => {
      start ??= t
      const p = Math.min((t - start) / duration, 1)
      setN(Math.round(valorAlvo * (1 - Math.pow(1 - p, 3))))
      if (p < 1) {
        raf = requestAnimationFrame(tick)
      }
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [to, duration])

  return (
    <>
      {n.toLocaleString('pt-BR')}
      {suffix}
    </>
  )
}
