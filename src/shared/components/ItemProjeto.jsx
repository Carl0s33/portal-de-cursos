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

function extrairIniciais(nome) {
  const limpo = (nome || '').trim()
  if (!limpo) return 'OR'
  const partes = limpo.split(/\s+/).filter(Boolean)
  if (partes.length === 1) return partes[0].slice(0, 2).toUpperCase()
  return `${partes[0][0]}${partes[partes.length - 1][0]}`.toUpperCase()
}

export default function ItemProjeto({ projeto }) {
  const modificador = obterModificadorTipo(projeto.tipo)
  const orientador = projeto.orientador || 'Não informado'
  const curso = (projeto.curso || '').replace(/^Curso\s+/i, '').trim()

  return (
    <article className={`item-projeto item-projeto--${modificador}`}>
      <header className="item-projeto__topo">
        <span className={`etiqueta etiqueta--${modificador}`}>{projeto.tipo || 'TCC'}</span>
        {curso && <span className="item-projeto__curso">{curso}</span>}
      </header>

      <h3 className="item-projeto__titulo">
        <a className="item-projeto__link" href={`#projeto/${projeto.identificador}`}>
          {projeto.nome}
        </a>
      </h3>

      <p className="item-projeto__descricao">{projeto.descricao}</p>

      <footer className="item-projeto__rodape">
        <div className="item-projeto__orientador">
          <span className="item-projeto__avatar" aria-hidden="true">
            {extrairIniciais(orientador)}
          </span>
          <div>
            <small>Orientador</small>
            <strong>{orientador}</strong>
          </div>
        </div>

        <span className="item-projeto__acao" aria-hidden="true">
          Ver projeto
          <Icone nome="seta" />
        </span>
      </footer>
    </article>
  )
}
