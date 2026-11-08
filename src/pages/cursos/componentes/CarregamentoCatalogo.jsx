import './estados-catalogo.css'

export default function CarregamentoCatalogo() {
  return (
    <div className="carregamento-catalogo" role="status" aria-label="Carregando cursos">
      <span className="somente-leitores">Carregando cursos. Aguarde.</span>
      {[0, 1].map((item) => (
        <div className="esqueleto-catalogo" aria-hidden="true" key={item}>
          <div className="esqueleto-catalogo__etiqueta" />
          <div className="esqueleto-catalogo__titulo" />
          <div className="esqueleto-catalogo__subtitulo" />
          <div className="esqueleto-catalogo__linha" />
          <div className="esqueleto-catalogo__linha" />
          <div className="esqueleto-catalogo__linha esqueleto-catalogo__linha--curta" />
          <div className="esqueleto-catalogo__metadados">
            <span />
            <span />
            <span />
          </div>
          <div className="esqueleto-catalogo__acao" />
        </div>
      ))}
    </div>
  )
}
