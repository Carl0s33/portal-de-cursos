import Icone from '@/shared/components/Icone.jsx'
import './cabecalho-projeto.css'

export default function CabecalhoProjeto({ projeto }) {
  return (
    <article className="cartao-abertura-projeto" aria-labelledby="titulo-projeto">
      <div className="cartao-abertura-projeto__topo">
        <span className="cartao-abertura-projeto__etiqueta-tipo">
          <Icone nome="grau-detalhe" classe="cartao-abertura-projeto__icone-tipo" />
          <span>{projeto.tipo || 'Trabalho de Conclusão de Curso (TCC)'}</span>
        </span>
        {projeto.cursoSigla && (
          <span className="cartao-abertura-projeto__etiqueta-curso">{projeto.cursoSigla}</span>
        )}
      </div>

      <div className="cartao-abertura-projeto__conteudo">
        <h1 id="titulo-projeto" className="cartao-abertura-projeto__titulo">
          {projeto.titulo || 'Sem título'}
        </h1>
        <p className="cartao-abertura-projeto__descricao">
          {projeto.descricao || 'Nenhuma descrição fornecida.'}
        </p>
      </div>

      <dl className="cartao-abertura-projeto__base">
        <div className="cartao-abertura-projeto__quadro">
          <span className="cartao-abertura-projeto__quadro-icone" aria-hidden="true">
            <Icone nome="catalogo-cursos" />
          </span>
          <div>
            <dt className="cartao-abertura-projeto__quadro-rotulo">Curso</dt>
            <dd className="cartao-abertura-projeto__quadro-valor" title={projeto.cursoNome}>
              {projeto.cursoNome || 'Não informado'}
            </dd>
          </div>
        </div>

        <div className="cartao-abertura-projeto__quadro">
          <span className="cartao-abertura-projeto__quadro-icone" aria-hidden="true">
            <Icone nome="duracao-detalhe" />
          </span>
          <div>
            <dt className="cartao-abertura-projeto__quadro-rotulo">Postado em</dt>
            <dd className="cartao-abertura-projeto__quadro-valor">
              {projeto.dataPostagemTexto || 'Não informada'}
            </dd>
          </div>
        </div>
      </dl>
    </article>
  )
}
