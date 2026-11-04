import './resumo-projeto.css'

export default function ResumoProjeto({ projeto }) {
  const resumoTexto = projeto.resumo || projeto.descricao || ''

  return (
    <article className="cartao-resumo-projeto" aria-labelledby="titulo-resumo">
      <header className="cartao-resumo-projeto__topo">
        <h2 id="titulo-resumo" className="cartao-resumo-projeto__titulo">
          Resumo
        </h2>
      </header>

      <div className="cartao-resumo-projeto__corpo">
        {resumoTexto ? (
          resumoTexto
            .split('\n\n')
            .filter(Boolean)
            .map((paragrafo, idx) => (
              <p key={idx} className="cartao-resumo-projeto__paragrafo">
                {paragrafo}
              </p>
            ))
        ) : (
          <p className="cartao-resumo-projeto__vazio">
            Nenhum resumo detalhado disponível para este projeto.
          </p>
        )}
      </div>
    </article>
  )
}
