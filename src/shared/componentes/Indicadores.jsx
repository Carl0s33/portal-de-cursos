import Icone from './Icone.jsx'
import './indicadores.css'

export default function Indicadores({ itens, rotulo = 'Resumo' }) {
  return (
    <div className="indicadores" role="region" aria-label={rotulo}>
      {itens.map(({ titulo, valor, detalhe, destino, icone }) => {
        const conteudo = (
          <>
            <div className="indicadores__topo">
              {icone && (
                <span className="indicadores__icone" aria-hidden="true">
                  <Icone nome={icone} />
                </span>
              )}
              <span className="indicadores__titulo">{titulo}</span>
              <span className="indicadores__valor">{valor}</span>
            </div>
            {detalhe && <span className="indicadores__detalhe">{detalhe}</span>}
          </>
        )

        return destino ? (
          <a key={titulo} href={destino} className="indicadores__cartao indicadores__cartao--link">
            {conteudo}
          </a>
        ) : (
          <div key={titulo} className="indicadores__cartao">
            {conteudo}
          </div>
        )
      })}
    </div>
  )
}
