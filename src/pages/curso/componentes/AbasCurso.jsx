import './abas-curso.css'

const abas = [
  ['visao-geral', 'Visão geral'],
  ['grade-curricular', 'Grade curricular'],
]

export default function AbasCurso({ selecionada, selecionar }) {
  function navegarTeclado(evento, indice) {
    let proximo
    if (evento.key === 'ArrowRight') proximo = (indice + 1) % abas.length
    if (evento.key === 'ArrowLeft') proximo = (indice + abas.length - 1) % abas.length
    if (evento.key === 'Home') proximo = 0
    if (evento.key === 'End') proximo = abas.length - 1
    if (proximo === undefined) return
    evento.preventDefault()
    selecionar(abas[proximo][0])
    document.getElementById(`aba-curso-${abas[proximo][0]}`).focus()
  }

  return (
    <div className="abas-curso">
      <div role="tablist" aria-label="Informações do curso">
        {abas.map(([identificador, titulo], indice) => (
          <button
            key={identificador}
            type="button"
            id={`aba-curso-${identificador}`}
            role="tab"
            aria-selected={selecionada === identificador}
            aria-controls={`painel-curso-${identificador}`}
            tabIndex={selecionada === identificador ? 0 : -1}
            onClick={() => selecionar(identificador)}
            onKeyDown={(evento) => navegarTeclado(evento, indice)}
          >
            {titulo}
          </button>
        ))}
      </div>
    </div>
  )
}
