import './carregamento-detalhe-projeto.css'

function Linhas({ quantidade = 3 }) {
  return (
    <div className="esqueleto-detalhe-projeto__linhas">
      {Array.from({ length: quantidade }, (_, indice) => (
        <span key={indice} />
      ))}
    </div>
  )
}

export default function CarregamentoDetalheProjeto() {
  return (
    <div
      className="esqueleto-detalhe-projeto"
      role="status"
      aria-label="Carregando detalhes do projeto"
    >
      <span className="somente-leitores">Carregando detalhes do projeto. Aguarde.</span>
      <div aria-hidden="true">
        {/* Cartão superior esqueleto */}
        <section className="esqueleto-detalhe-projeto__topo">
          <span className="esqueleto-detalhe-projeto__badge" />
          <div className="esqueleto-detalhe-projeto__titulo" />
          <div className="esqueleto-detalhe-projeto__subtitulo" />
          <Linhas quantidade={2} />

          <div className="esqueleto-detalhe-projeto__metadados">
            {Array.from({ length: 3 }, (_, indice) => (
              <div key={indice} className="esqueleto-detalhe-projeto__card">
                <Linhas quantidade={2} />
              </div>
            ))}
          </div>
        </section>

        {/* Grid em duas colunas */}
        <div className="esqueleto-detalhe-projeto__grid">
          <div className="esqueleto-detalhe-projeto__principal">
            <div className="esqueleto-detalhe-projeto__bloco">
              <div className="esqueleto-detalhe-projeto__subtitulo" />
              <Linhas quantidade={8} />
            </div>
          </div>
          <div className="esqueleto-detalhe-projeto__lateral">
            <div className="esqueleto-detalhe-projeto__bloco">
              <div className="esqueleto-detalhe-projeto__subtitulo" />
              <Linhas quantidade={3} />
            </div>
            <div className="esqueleto-detalhe-projeto__bloco">
              <div className="esqueleto-detalhe-projeto__subtitulo" />
              <Linhas quantidade={3} />
            </div>
            <div className="esqueleto-detalhe-projeto__bloco">
              <div className="esqueleto-detalhe-projeto__subtitulo" />
              <Linhas quantidade={3} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
