import { useEffect, useState } from 'react'
import Icone from '@/shared/componentes/Icone.jsx'
import ItemProjeto from '@/shared/componentes/ItemProjeto.jsx'
import Link from '@/shared/componentes/Link.jsx'
import { buscarProjetosDestaque } from '../servicos/buscarProjetosDestaque.js'

const destaques = [
  {
    id: 'projetos',
    filtro: (projeto) => !ehTcc(projeto),
    titulo: 'Projetos acadêmicos',
    descricao:
      'Conheça iniciativas de pesquisa, extensão e projetos integradores da comunidade acadêmica.',
    conviteRotulo: 'Seu projeto pode ser o próximo',
    vazio: 'Os projetos publicados pela coordenação aparecerão aqui.',
  },
  {
    id: 'tccs',
    filtro: ehTcc,
    titulo: 'Trabalhos de conclusão de curso',
    descricao:
      'Explore trabalhos de conclusão desenvolvidos pelos estudantes e aprovados para publicação.',
    conviteRotulo: 'Seu TCC pode ser o próximo',
    vazio: 'Os TCCs publicados pela coordenação aparecerão aqui.',
  },
]

function ehTcc(projeto) {
  return (projeto.tipo || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .includes('tcc')
}

function SecaoDestaque({ item, projetos, estado }) {
  const lista = projetos.filter(item.filtro).slice(0, 3)
  const total = projetos.filter(item.filtro).length
  const contagem =
    item.id === 'tccs'
      ? total === 1
        ? '1 TCC publicado'
        : `${total} TCCs publicados`
      : total === 1
        ? '1 projeto publicado'
        : `${total} projetos publicados`

  return (
    <section id={item.id} className="secao secao-producoes" aria-labelledby={`titulo-${item.id}`}>
      <div className="secao-producoes__introducao">
        <div>
          {estado === 'pronto' && total > 0 && (
            <p className="secao-producoes__sobretitulo">
              <Icone nome="confirmacao-cursos" /> {contagem} após avaliação acadêmica
            </p>
          )}
          <h2 id={`titulo-${item.id}`}>{item.titulo}</h2>
          <p className="secao-producoes__descricao">{item.descricao}</p>
        </div>
        <Link destino="#projetos">Ver todos os trabalhos</Link>
      </div>

      {estado === 'carregando' ? (
        <p className="secao-producoes__estado" role="status">
          Carregando publicações…
        </p>
      ) : estado === 'erro' ? (
        <p className="secao-producoes__estado" role="alert">
          Não foi possível carregar as publicações agora.
        </p>
      ) : lista.length ? (
        <ul className="lista-projetos" data-quantidade={Math.min(lista.length, 3)}>
          {lista.map((projeto) => (
            <li key={projeto.identificador}>
              <ItemProjeto projeto={projeto} />
            </li>
          ))}
          {lista.length === 1 && (
            <li className="convite-envio">
              <p className="convite-envio__rotulo">{item.conviteRotulo}</p>
              <h3>Concluiu seu trabalho? Envie para avaliação e publicação.</h3>
              <a className="botao-primario" href="#submeter">
                Enviar projeto
              </a>
            </li>
          )}
        </ul>
      ) : (
        <div className="secao-producoes__vazio">
          <div>
            <h3>A próxima publicação pode aparecer aqui</h3>
            <p>{item.vazio}</p>
          </div>
          <a className="botao-secundario botao--pequeno" href="#submeter">
            Enviar uma proposta
          </a>
        </div>
      )}
    </section>
  )
}

export default function ProjetosDestaque() {
  const [projetos, mudarProjetos] = useState([])
  const [estado, mudarEstado] = useState('carregando')

  useEffect(() => {
    const controle = new AbortController()
    buscarProjetosDestaque(controle.signal)
      .then((publicados) => {
        if (controle.signal.aborted) return
        mudarProjetos(publicados)
        mudarEstado('pronto')
      })
      .catch(() => {
        if (!controle.signal.aborted) {
          mudarProjetos([])
          mudarEstado('erro')
        }
      })
    return () => controle.abort()
  }, [])

  return destaques.map((item) => (
    <SecaoDestaque key={item.id} item={item} projetos={projetos} estado={estado} />
  ))
}
