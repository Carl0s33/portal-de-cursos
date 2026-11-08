import './carregamento-detalhe.css'

function Linhas({ quantidade = 3 }) {
  return (
    <div className="esqueleto-detalhe__linhas">
      {Array.from({ length: quantidade }, (_, indice) => (
        <span key={indice} />
      ))}
    </div>
  )
}

export default function CarregamentoDetalhe() {
  return (
    <div className="esqueleto-detalhe" role="status" aria-label="Carregando detalhes do curso">
      <span className="somente-leitores">Carregando detalhes do curso. Aguarde.</span>
      <div aria-hidden="true">
        <section className="esqueleto-detalhe__resumo">
          <div>
            <span className="esqueleto-detalhe__etiqueta" />
            <div className="esqueleto-detalhe__titulo" />
            <div className="esqueleto-detalhe__subtitulo" />
            <Linhas />
          </div>
          <div className="esqueleto-detalhe__acao">
            <Linhas quantidade={2} />
            <span />
            <span />
          </div>
        </section>
        <div className="esqueleto-detalhe__indicadores">
          {Array.from({ length: 6 }, (_, indice) => (
            <div key={indice}>
              <Linhas />
            </div>
          ))}
        </div>
        <div className="esqueleto-detalhe__abas">
          {[0, 1, 2, 3].map((indice) => (
            <span key={indice} />
          ))}
        </div>
        <div className="esqueleto-detalhe__conteudo">
          <div>
            <section>
              <div className="esqueleto-detalhe__subtitulo" />
              <Linhas quantidade={5} />
            </section>
            <section>
              <div className="esqueleto-detalhe__subtitulo" />
              {[0, 1, 2, 3].map((indice) => (
                <div className="esqueleto-detalhe__item" key={indice}>
                  <Linhas quantidade={2} />
                </div>
              ))}
            </section>
            <section>
              <Linhas />
            </section>
          </div>
          <aside>
            <section>
              <Linhas />
              <div className="esqueleto-detalhe__foto" />
            </section>
            <section>
              <Linhas quantidade={4} />
            </section>
          </aside>
        </div>
      </div>
    </div>
  )
}
