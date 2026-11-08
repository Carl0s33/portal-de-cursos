import TextoFormatado from './TextoFormatado.jsx'
import '@/shared/styles/projetos.css'

function pegarModificadorTipo(tipo) {
  const normalizado = (tipo || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()

  if (normalizado.includes('integrador')) return 'integrador'
  if (normalizado.includes('pesquisa')) return 'pesquisa'
  if (normalizado.includes('extensao')) return 'extensao'
  return 'tcc'
}

export default function ItemProjeto({ projeto }) {
  const modificador = pegarModificadorTipo(projeto.tipo)
  const orientador = projeto.orientador || 'Não informado'
  const cursoBruto = (projeto.curso || '').replace(/^Curso\s*#?/i, '').trim()
  const curso = /^#?\d+$/.test(cursoBruto) ? '' : cursoBruto
  const informacoes = [
    ['Curso', curso || 'Geral'],
    ['Orientador', orientador],
  ]

  const classeChip = `item-projeto__tipo-rotulo item-projeto__tipo-rotulo--${modificador}`

  return (
    <article
      className={`cartao cartao--clicavel item-projeto item-projeto--${modificador}`}
      data-tipo={modificador}
    >
      <div className="item-projeto__topo">
        <span className={classeChip}>{projeto.tipo || 'TCC'}</span>
      </div>

      <h3 className="item-projeto__titulo">
        <a
          className="item-projeto__link"
          href={`#projeto/${projeto.identificador}`}
          title={projeto.titulo}
        >
          {projeto.nome}
        </a>
      </h3>

      <TextoFormatado texto={projeto.resumo} className="item-projeto__descricao" />

      <dl className="item-projeto__metadados">
        {informacoes.map(([rotulo, valor]) => (
          <div key={rotulo}>
            <dt>{rotulo}</dt>
            <dd title={valor}>{valor}</dd>
          </div>
        ))}
      </dl>

      <div className="item-projeto__base">
        <span className="item-projeto__acao" aria-hidden="true">
          Ver projeto
        </span>
      </div>
    </article>
  )
}
