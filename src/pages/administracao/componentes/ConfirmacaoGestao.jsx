import { useEffect, useRef } from 'react'

export default function ConfirmacaoGestao({ rotulo, children }) {
  const regiao = useRef(null)
  useEffect(() => {
    const anterior = document.activeElement
    regiao.current?.focus()
    return () => {
      if (anterior?.isConnected) anterior.focus()
    }
  }, [])
  return (
    <section ref={regiao} tabIndex={-1} className="gestao-confirmacao" aria-labelledby={rotulo}>
      {children}
    </section>
  )
}
