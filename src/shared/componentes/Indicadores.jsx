import './indicadores.css'

const tons = {
  primario: 'var(--azul)',
  andamento: 'var(--azul)',
  pendente: 'var(--aviso)',
  sucesso: 'var(--sucesso)',
  erro: 'var(--erro)',
  neutro: 'var(--borda)',
}

export default function Indicadores({ itens, rotulo = 'Resumo' }) {
  return (
    <dl className="indicadores" aria-label={rotulo}>
      {itens.map(({ titulo, valor, detalhe, destino, tom = 'primario' }) => (
        <div key={titulo} style={{ '--cor-indicador': tons[tom] || tons.primario }}>
          <dt>{destino ? <a href={destino}>{titulo}</a> : titulo}</dt>
          <dd className="indicadores__valor">{valor}</dd>
          {detalhe && <dd className="indicadores__detalhe">{detalhe}</dd>}
        </div>
      ))}
    </dl>
  )
}
