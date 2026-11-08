import { useRef, useState } from 'react'
import {
  Bold,
  Eye,
  Heading2,
  Italic,
  List,
  ListOrdered,
  PenLine,
  Pilcrow,
  Quote,
} from 'lucide-react'
import TextoFormatado from '@/shared/componentes/TextoFormatado.jsx'
import { nomesTiposProjeto, tiposProjeto } from '../constantes.js'

const acoesFormatacao = [
  { tipo: 'negrito', rotulo: 'Negrito', Icone: Bold },
  { tipo: 'italico', rotulo: 'Itálico', Icone: Italic },
  { tipo: 'titulo', rotulo: 'Subtítulo', Icone: Heading2 },
  { tipo: 'marcadores', rotulo: 'Lista com marcadores', Icone: List },
  { tipo: 'numeracao', rotulo: 'Lista numerada', Icone: ListOrdered },
  { tipo: 'citacao', rotulo: 'Citação', Icone: Quote },
  { tipo: 'paragrafo', rotulo: 'Novo parágrafo', Icone: Pilcrow },
]

function EditorTexto({
  campo,
  id,
  titulo,
  ajuda,
  placeholder,
  valor,
  aoAlterar,
  erro,
  erroDoCampo,
  linhas = 5,
  limite,
}) {
  const campoRef = useRef(null)
  const [previsualizando, mudarPrevisualizacao] = useState(false)
  const idAjuda = `${id}-ajuda`
  const idErro = erroDoCampo(campo)

  function inserirFormato(tipo) {
    const campo = campoRef.current
    if (!campo) return

    const texto = valor || ''
    const inicio = campo.selectionStart
    const fim = campo.selectionEnd
    const selecao = texto.slice(inicio, fim)
    let antes = ''
    let inserido = ''
    let depois = ''
    let inicioCursor = 0
    let fimCursor = 0

    if (tipo === 'negrito' || tipo === 'italico') {
      const marcador = tipo === 'negrito' ? '**' : '*'
      const textoPadrao = tipo === 'negrito' ? 'texto em negrito' : 'texto em itálico'
      const textoInterno = selecao || textoPadrao
      antes = texto.slice(0, inicio)
      depois = texto.slice(fim)
      inserido = `${marcador}${textoInterno}${marcador}`
      inicioCursor = antes.length + marcador.length
      fimCursor = inicioCursor + textoInterno.length
    } else if (tipo === 'titulo') {
      antes = texto.slice(0, inicio)
      depois = texto.slice(fim)
      if (antes && !antes.endsWith('\n\n')) antes += antes.endsWith('\n') ? '\n' : '\n\n'
      inserido = selecao ? `## ${selecao}\n` : '## Título da seção\n'
      inicioCursor = antes.length + (selecao ? inserido.length : 3)
      fimCursor = selecao ? inicioCursor : antes.length + '## Título da seção'.length
    } else if (tipo === 'paragrafo') {
      antes = texto.slice(0, inicio)
      depois = texto.slice(fim)
      inserido = '\n\n'
      inicioCursor = antes.length + inserido.length
    } else {
      const marcador =
        tipo === 'numeracao' ? '1. ' : tipo === 'citacao' ? '> ' : '- '
      const linhas = selecao ? selecao.split('\n') : ['']
      inserido = linhas.map((linha, indice) =>
        tipo === 'numeracao' ? `${indice + 1}. ${linha}` : `${marcador}${linha}`,
      ).join('\n')
      antes = texto.slice(0, inicio)
      depois = texto.slice(fim)
      if (antes && !antes.endsWith('\n')) {
        inserido = `\n${inserido}`
        inicioCursor = antes.length + inserido.length
      } else {
        inicioCursor = antes.length + inserido.length
      }
      if (depois && !depois.startsWith('\n')) depois = `\n${depois}`
    }

    const novoTexto = antes + inserido + depois
    aoAlterar(novoTexto)
    window.requestAnimationFrame(() => {
      campo.focus()
      campo.setSelectionRange(inicioCursor, fimCursor || inicioCursor)
    })
  }

  return (
    <div className="editor-texto formulario-submissao__campo-largo">
      <label className="editor-texto__rotulo" htmlFor={id}>
        {titulo} <span aria-hidden="true">*</span>
      </label>
      <p className="editor-texto__ajuda" id={idAjuda}>
        {ajuda}
      </p>
      <div className="editor-texto__barra" role="group" aria-label={`Formatação de ${titulo}`}>
        {!previsualizando &&
          acoesFormatacao.map(({ tipo, rotulo, Icone }) => (
            <button
              className="editor-texto__acao"
              key={tipo}
              type="button"
              onClick={() => inserirFormato(tipo)}
              aria-label={rotulo}
              title={rotulo}
            >
              <Icone size={16} aria-hidden="true" />
              <span>{rotulo}</span>
            </button>
          ))}
        <button
          className="editor-texto__acao editor-texto__acao--previa"
          type="button"
          onClick={() => mudarPrevisualizacao((atual) => !atual)}
          aria-pressed={previsualizando}
        >
          {previsualizando ? (
            <>
              <PenLine size={16} aria-hidden="true" />
              <span>Continuar editando</span>
            </>
          ) : (
            <>
              <Eye size={16} aria-hidden="true" />
              <span>Pré-visualizar</span>
            </>
          )}
        </button>
      </div>
      {previsualizando ? (
        <TextoFormatado
          texto={valor || 'A prévia do texto formatado aparecerá aqui.'}
          className="editor-texto__previa"
        />
      ) : (
        <textarea
          ref={campoRef}
          id={id}
          required
          maxLength={limite}
          aria-invalid={Boolean(erro)}
          aria-describedby={
            [idAjuda, limite ? `${id}-contador` : null, erro ? idErro : null]
              .filter(Boolean)
              .join(' ')
          }
          placeholder={placeholder}
          rows={linhas}
          value={valor}
          onChange={(evento) => aoAlterar(evento.target.value)}
        />
      )}
      {limite && (
        <small className="editor-texto__contador" id={`${id}-contador`}>
          {valor.length}/{limite} caracteres
        </small>
      )}
      {erro && (
        <small id={idErro} className="formulario-submissao__erro-campo">
          {erro}
        </small>
      )}
    </div>
  )
}

export default function EtapaSubmissaoProjeto({ formulario, erros, alterar, erroDoCampo }) {
  return (
    <section className="formulario-submissao__secao" aria-labelledby="dados-projeto">
      <div className="formulario-submissao__cabecalho">
        <span>02</span>
        <div>
          <h2 id="dados-projeto">Projeto</h2>
          <p>Descreva a produção, seu objetivo e o resultado esperado.</p>
        </div>
      </div>
      <div className="formulario-submissao__grade">
        <label>
          Tipo de produção <span aria-hidden="true">*</span>
          <select
            required
            aria-invalid={Boolean(erros.tipo)}
            aria-describedby={erroDoCampo('tipo')}
            value={formulario.tipo}
            onChange={(e) => alterar('tipo', e.target.value)}
          >
            <option value="">Selecione uma opção</option>
            {Object.keys(tiposProjeto).map((tipo) => (
              <option key={tipo} value={tipo}>
                {nomesTiposProjeto[tipo]}
              </option>
            ))}
          </select>
          {erros.tipo && (
            <small id="erro-tipo" className="formulario-submissao__erro-campo">
              {erros.tipo}
            </small>
          )}
        </label>
        <label>
          Título <span aria-hidden="true">*</span>
          <input
            required
            aria-invalid={Boolean(erros.titulo)}
            aria-describedby={erroDoCampo('titulo')}
            placeholder="Título do projeto"
            value={formulario.titulo}
            onChange={(e) => alterar('titulo', e.target.value)}
          />
          {erros.titulo && (
            <small id="erro-titulo" className="formulario-submissao__erro-campo">
              {erros.titulo}
            </small>
          )}
        </label>
        <EditorTexto
          campo="resumo"
          id="campo-resumo"
          titulo="Resumo"
          ajuda="Apresente o problema, a proposta e o contexto do projeto em até 500 caracteres."
          placeholder="Ex.: O projeto busca resolver… Para isso, propõe…"
          valor={formulario.resumo}
          aoAlterar={(valor) => alterar('resumo', valor)}
          erro={erros.resumo}
          erroDoCampo={erroDoCampo}
          linhas={4}
          limite={500}
        />
        <EditorTexto
          campo="objetivos"
          id="campo-objetivos"
          titulo="Objetivos e resultados"
          ajuda="Use verbos de ação e indique o que será feito e qual resultado poderá ser observado."
          placeholder="Ex.: Desenvolver…; avaliar…; entregar…"
          valor={formulario.objetivos}
          aoAlterar={(valor) => alterar('objetivos', valor)}
          erro={erros.objetivos}
          erroDoCampo={erroDoCampo}
          linhas={5}
        />
        {formulario.tipo && (
          <EditorTexto
            campo="informacoesEspecificas"
            id="campo-informacoes-especificas"
            titulo={tiposProjeto[formulario.tipo].campoEspecifico}
            ajuda={
              formulario.tipo === 'Extensão'
                ? 'Indique o público atendido, as atividades, os parceiros e o impacto esperado.'
                : formulario.tipo === 'Pesquisa'
                  ? 'Descreva o método, a hipótese ou pergunta e como os resultados serão analisados.'
                  : formulario.tipo === 'TCC'
                    ? 'Explique o problema de pesquisa, a metodologia e os resultados esperados.'
                    : 'Liste os requisitos principais, delimite o escopo e explique a solução proposta.'
            }
            placeholder="Organize as informações em tópicos ou parágrafos curtos."
            valor={formulario.informacoesEspecificas}
            aoAlterar={(valor) => alterar('informacoesEspecificas', valor)}
            erro={erros.informacoesEspecificas}
            erroDoCampo={erroDoCampo}
            linhas={5}
          />
        )}
      </div>
    </section>
  )
}
