import Icone from './Icone.jsx'
import '@/shared/styles/projetos.css'

function obterModificadorTipo(tipo) {
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

function obterIconeTipo(modificador) {
  switch (modificador) {
    case 'integrador':
      return 'projetos-cursos'
    case 'pesquisa':
      return 'laboratorio'
    case 'extensao':
      return 'docentes-detalhe'
    case 'tcc':
    default:
      return 'grau-detalhe'
  }
}

export default function ItemProjeto({ projeto }) {
  const modificador = obterModificadorTipo(projeto.tipo)
  const orientador = projeto.orientador || 'Não informado'
  const cursoBruto = (projeto.curso || '').replace(/^Curso\s*#?/i, '').trim()
  const curso = /^#?\d+$/.test(cursoBruto) ? '' : cursoBruto
  const iconeTipo = obterIconeTipo(modificador)

  const informacoes = [
    ['Tipo', projeto.tipo || 'TCC', iconeTipo],
    ['Curso', curso || 'Geral', 'catalogo-cursos'],
    ['Orientador', orientador, 'usuario'],
  ]

  const classeChip = `item-projeto__tipo-rotulo item-projeto__tipo-rotulo--${modificador}`

  return (
    <article className="item-projeto">
      <div className="item-projeto__topo">
        <span className="item-projeto__simbolo" aria-hidden="true">
          <Icone nome={iconeTipo} />
        </span>
        <span className={classeChip}>{projeto.tipo || 'TCC'}</span>
        {curso && <span className="item-projeto__sigla">{curso}</span>}
      </div>

      <h3 className="item-projeto__titulo">
        <a className="item-projeto__link" href={`#projeto/${projeto.identificador}`}>
          {projeto.nome}
        </a>
      </h3>

      <p className="item-projeto__descricao">{projeto.descricao}</p>

      <dl className="item-projeto__metadados">
        {informacoes.map(([rotulo, valor, icone]) => (
          <div key={rotulo}>
            <dt>
              <Icone nome={icone} />
              {rotulo}
            </dt>
            <dd title={valor}>{valor}</dd>
          </div>
        ))}
      </dl>

      <div className="item-projeto__base">
        <span className="item-projeto__acao" aria-hidden="true">
          <span>Ver projeto</span>
          <Icone nome="seta-cursos" />
        </span>
      </div>
    </article>
  )
}
