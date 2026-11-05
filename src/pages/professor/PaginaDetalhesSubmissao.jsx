import EtapasSubmissao from '@/shared/components/EtapasSubmissao.jsx'
import { useState } from 'react'
import '@/shared/styles/painel-informativo.css'
import './professor.css'
import { enderecoPrivado, navegar } from '../../app/rotas.js'
import ConfirmacaoGestao from '@/pages/administracao/components/ConfirmacaoGestao.jsx'
import { baixarDocumentoBlob, obterUrlDownloadDocumento } from '@/api/projetos.js'

const tiposDeProjeto = ['TCC', 'Projeto Integrador', 'Pesquisa', 'Extensão']

function submissaoDoCurso(item, cursoId) {
  if (!item) return false
  if (!cursoId) return true
  return [item.cursoId, item.identificadorCurso]
    .filter((referencia) => referencia !== undefined && referencia !== null)
    .some((referencia) => String(referencia) === String(cursoId))
}

function submetidaAoOrientador(item, usuario) {
  const idUsuario = usuario?.professorId || usuario?.id
  if (item?.orientadorId && idUsuario) {
    return String(item.orientadorId) === String(idUsuario)
  }
  const nomeOrientador = item?.orientador?.toLocaleLowerCase('pt-BR') || ''
  const nomeUsuario = usuario?.nome?.toLocaleLowerCase('pt-BR') || ''
  if (!nomeOrientador || !nomeUsuario) return true
  return Boolean(nomeOrientador.includes(nomeUsuario) || nomeUsuario.includes(nomeOrientador))
}

function rotuloDoTipo(tipoDocumento) {
  if (!tipoDocumento) return 'PDF'
  const texto = String(tipoDocumento)
  if (/link/i.test(texto)) return 'Link'
  return texto.replaceAll('_', ' ').toUpperCase()
}

function textoAutores(autores) {
  return (autores || [])
    .map((autor) =>
      typeof autor === 'string'
        ? autor
        : `${autor.nome || ''}${autor.email ? ` (${autor.email})` : ''}`,
    )
    .join(' · ')
}

function linhasParaLista(texto) {
  return texto
    .split('\n')
    .map((linha) => linha.trim())
    .filter(Boolean)
}

function linhasParaAutores(texto) {
  return texto
    .split('\n')
    .map((linha) => {
      const [, nome = '', email = ''] = linha.match(/^(.*?)(?:\s*<([^<>]*)>)?\s*$/) || []
      return { nome: nome.trim(), email: email.trim() }
    })
    .filter((autor) => autor.nome)
}

export default function PaginaDetalhesSubmissao({
  item,
  tipoUsuario,
  usuario,
  token,
  cursoId,
  decisao,
  aoDecidir,
  aoEditar,
  aoRemover,
}) {
  const [justificativa, definirJustificativa] = useState('')
  const [erro, definirErro] = useState('')
  const [editando, definirEditando] = useState(false)
  const [confirmandoRemocao, definirConfirmandoRemocao] = useState(false)
  const [abrindoDocumento, definirAbrindoDocumento] = useState(false)
  const [edicao, definirEdicao] = useState(() => ({
    titulo: item?.titulo || '',
    resumo: item?.resumo || '',
    objetivo: item?.objetivo || '',
    tipo: item?.tipo || 'TCC',
    orientador: item?.orientador || '',
    autores: (item?.autores || []).map((autor) =>
      typeof autor === 'string' ? { nome: autor, email: '' } : autor,
    ),
    disciplinas: item?.disciplinas || [],
    documentos: (item?.documentos || []).map((d) =>
      typeof d === 'string' ? d : d?.nomeArquivo || d?.nome || '',
    ),
  }))

  const status = decisao?.status || decisao || item?.status || 'Aguardando Orientador'
  const volta = tipoUsuario === 'COORDENADOR' ? 'coordenacao/submissoes' : 'professor/feed'
  const visivel =
    item &&
    (tipoUsuario === 'COORDENADOR'
      ? submissaoDoCurso(item, cursoId)
      : tipoUsuario === 'PROFESSOR' && submetidaAoOrientador(item, usuario))

  if (!visivel) {
    return (
      <main id="conteudo" className="limite pagina-detalhes-submissao">
        <a className="pagina-detalhes-submissao__voltar" href={enderecoPrivado(volta)}>
          Voltar para submissões
        </a>
        <h1>Submissão não encontrada</h1>
        <p>O projeto solicitado não está disponível para esta área.</p>
      </main>
    )
  }

  const avaliacaoOrientador = tipoUsuario === 'PROFESSOR' && status === 'Aguardando Orientador'
  const avaliacaoCoordenador = tipoUsuario === 'COORDENADOR' && status === 'Em análise'

  function atualizar(campo, valor) {
    definirEdicao((atual) => ({ ...atual, [campo]: valor }))
  }

  function registrarDecisao(proximoStatus) {
    if (proximoStatus === 'Recusado' && !justificativa.trim()) {
      definirErro('Explique o motivo antes de recusar o projeto.')
      return
    }
    aoDecidir(proximoStatus, justificativa.trim())
    definirJustificativa('')
    definirErro('')
  }

  function salvarEdicao(evento) {
    evento.preventDefault()
    if (!edicao.titulo.trim() || !edicao.resumo.trim() || !edicao.objetivo.trim()) return
    aoEditar({
      titulo: edicao.titulo.trim(),
      resumo: edicao.resumo.trim(),
      objetivo: edicao.objetivo.trim(),
      tipo: edicao.tipo,
      orientador: edicao.orientador.trim(),
      autores: edicao.autores.map((autor) => ({ ...autor, email: autor.email || '' })),
      disciplinas: edicao.disciplinas.filter(Boolean),
      documentos: edicao.documentos.filter(Boolean),
    })
    definirEditando(false)
  }

  const mensagemStatus =
    status === 'Aprovado'
      ? 'Esta submissão foi aprovada pelo coordenador e está publicada no portal.'
      : status === 'Em análise'
        ? tipoUsuario === 'PROFESSOR'
          ? 'Você já aceitou orientar este projeto. Agora ele aguarda a avaliação da coordenação do curso.'
          : 'O orientador aceitou a submissão e ela aguarda a decisão da coordenação.'
        : status === 'Recusado'
          ? `Esta submissão foi recusada.${decisao?.justificativa ? ` Motivo: ${decisao.justificativa}` : ''}`
          : 'A submissão aguarda aceite inicial do professor orientador.'

  return (
    <main id="conteudo" className="limite pagina-detalhes-submissao">
      <a className="pagina-detalhes-submissao__voltar" href={enderecoPrivado(volta)}>
        Voltar para submissões
      </a>

      <header className="pagina-detalhes-submissao__cabecalho">
        <div>
          <div className="pagina-detalhes-submissao__sinal">
            <span className={`status status--${status.toLowerCase().replaceAll(' ', '-')}`}>
              {status}
            </span>
            <span>{item.tipo}</span>
          </div>
          <h1>{item.titulo}</h1>
          <EtapasSubmissao status={item.status} />
          <p>
            {item.cursoCompleto} · enviado por {item.autor} em {item.enviadoEm}
          </p>
        </div>
        <div className="pagina-detalhes-submissao__marco">
          <span>Orientação</span>
          <strong>{item.orientador}</strong>
        </div>
      </header>

      <div className="pagina-detalhes-submissao__grid">
        <section className="pagina-detalhes-submissao__principal">
          {editando ? (
            <form
              className="avaliacao-submissao avaliacao-submissao--formulario"
              onSubmit={salvarEdicao}
            >
              <h2>Editar submissão</h2>
              <label>
                Título
                <input
                  className="campo"
                  required
                  maxLength={200}
                  value={edicao.titulo}
                  onChange={(evento) => atualizar('titulo', evento.target.value)}
                />
              </label>
              <label>
                Tipo de projeto
                <select
                  className="campo"
                  value={edicao.tipo}
                  onChange={(evento) => atualizar('tipo', evento.target.value)}
                >
                  {tiposDeProjeto.map((tipo) => (
                    <option key={tipo}>{tipo}</option>
                  ))}
                </select>
              </label>
              <label>
                Resumo
                <textarea
                  className="campo"
                  required
                  rows="4"
                  value={edicao.resumo}
                  onChange={(evento) => atualizar('resumo', evento.target.value)}
                />
              </label>
              <label>
                Descrição
                <textarea
                  className="campo"
                  required
                  rows="4"
                  value={edicao.objetivo}
                  onChange={(evento) => atualizar('objetivo', evento.target.value)}
                />
              </label>
              <label>
                Professor orientador
                <input
                  className="campo"
                  required
                  maxLength={200}
                  value={edicao.orientador}
                  onChange={(evento) => atualizar('orientador', evento.target.value)}
                />
              </label>
              <label>
                Integrantes da equipe
                <textarea
                  className="campo"
                  required
                  rows="3"
                  placeholder="Nome completo <email@instituicao.edu.br> (um por linha)"
                  defaultValue={edicao.autores
                    .map((autor) => `${autor.nome || ''}${autor.email ? ` <${autor.email}>` : ''}`)
                    .join('\n')}
                  onChange={(evento) =>
                    atualizar('autores', linhasParaAutores(evento.target.value))
                  }
                />
              </label>
              <label>
                Disciplinas relacionadas
                <textarea
                  className="campo"
                  rows="3"
                  placeholder="Nome da disciplina (uma por linha)"
                  defaultValue={(edicao.disciplinas || []).join('\n')}
                  onChange={(evento) =>
                    atualizar('disciplinas', linhasParaLista(evento.target.value))
                  }
                />
              </label>
              <div className="formulario-submissao__documentos-edicao">
                <label className="campo-rotulo">Documentos anexados (somente PDF)</label>
                <ul className="documentos-submissao-professor">
                  {(edicao.documentos || []).map((doc, idx) => {
                    const nome = typeof doc === 'string' ? doc : doc?.nomeArquivo || doc?.nome || `Documento ${idx + 1}`
                    return (
                      <li key={idx} className="item-documento-estatico">
                        <span className="documento-tipo" aria-hidden="true">PDF</span>
                        <span className="item-documento-nome">{nome}</span>
                      </li>
                    )
                  })}
                </ul>
              </div>
              <div className="avaliacao-submissao__acoes">
                <button className="botao-primario" type="submit">
                  Salvar edição
                </button>
                <button
                  className="botao-secundario"
                  type="button"
                  onClick={() => definirEditando(false)}
                >
                  Cancelar
                </button>
              </div>
            </form>
          ) : (
            <>
              <div>
                <span className="pagina-detalhes-submissao__indice">Sobre o projeto</span>
                <h2>Resumo</h2>
                <p>{item.resumo}</p>
              </div>
              <div>
                <h2>Descrição</h2>
                <p>{item.objetivo}</p>
              </div>
              <div className="pagina-detalhes-submissao__documentos">
                <h2>Documentos enviados</h2>
                <ul className="documentos-submissao-professor">
                  {(item.documentos || []).map((documento, indice) => {
                    const objeto = typeof documento === 'object' && documento !== null
                    const nome = objeto
                      ? documento.nomeArquivo || documento.nome || `Documento ${indice + 1}`
                      : documento
                    const tipo = rotuloDoTipo(objeto ? documento.tipoDocumento : null)
                    const localizacao = objeto ? documento.localizacao : null
                    const ehUrl = localizacao && /^https?:\/\//i.test(localizacao)
                    const urlDestino = ehUrl
                      ? localizacao
                      : item?.id && documento?.id
                        ? obterUrlDownloadDocumento(item.id, documento.id)
                        : null

                    async function manipularCliqueDocumento(e) {
                      if (ehUrl) return
                      e.preventDefault()
                      definirAbrindoDocumento(true)
                      try {
                        const blobUrl = await baixarDocumentoBlob(item.id, documento.id, token)
                        window.open(blobUrl, '_blank', 'noopener,noreferrer')
                      } catch {
                        window.open(urlDestino, '_blank', 'noopener,noreferrer')
                      } finally {
                        definirAbrindoDocumento(false)
                      }
                    }

                    return (
                      <li key={documento?.id || nome || indice}>
                        {urlDestino ? (
                          <a
                            href={urlDestino}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="item-documento-interativo"
                            onClick={manipularCliqueDocumento}
                            title={`Abrir ${nome} em nova guia para pré-visualizar`}
                          >
                            <span className="documento-tipo" aria-hidden="true">
                              {tipo}
                            </span>
                            <span className="item-documento-nome">{nome}</span>
                            <span className="item-documento-gatilho">
                              {abrindoDocumento ? 'Abrindo…' : 'Abrir em nova guia'}{' '}
                              <span className="item-documento-seta" aria-hidden="true">
                                ↗
                              </span>
                            </span>
                          </a>
                        ) : (
                          <div className="item-documento-estatico">
                            <span className="documento-tipo" aria-hidden="true">
                              {tipo}
                            </span>
                            <strong className="item-documento-nome">{nome}</strong>
                            <span className="documento-indisponivel">Arquivo enviado</span>
                          </div>
                        )}
                      </li>
                    )
                  })}
                </ul>
              </div>
            </>
          )}
        </section>

        <aside className="pagina-detalhes-submissao__lateral">
          <div className="pagina-detalhes-submissao__contexto">
            <span className="pagina-detalhes-submissao__indice">Contexto</span>
            <div>
              <h2>Equipe</h2>
              <p>{textoAutores(item.autores)}</p>
            </div>
            {Array.isArray(item.professoresParticipantes) && item.professoresParticipantes.length > 0 && (
              <div>
                <h2>Docentes colaboradores</h2>
                <p>{item.professoresParticipantes.join(', ')}</p>
              </div>
            )}
            <div>
              <h2>Curso</h2>
              <p>{item.cursoCompleto}</p>
            </div>
            {Array.isArray(item.disciplinas) && item.disciplinas.length > 0 && (
              <div>
                <h2>Disciplinas associadas</h2>
                <p>{item.disciplinas.join(', ')}</p>
              </div>
            )}
          </div>

          {avaliacaoOrientador || avaliacaoCoordenador ? (
            <div className="avaliacao-submissao pagina-detalhes-submissao__decisao">
              <span className="pagina-detalhes-submissao__indice">Próxima decisão</span>
              <h2>
                {avaliacaoCoordenador ? 'Avaliação do coordenador' : 'Avaliação do orientador'}
              </h2>
              <p className="pagina-detalhes-submissao__decisao-intro">
                {avaliacaoCoordenador
                  ? 'O orientador aceitou esta submissão. Decida se ela será publicada no portal.'
                  : 'Leia o projeto e indique se poderá acompanhar esta produção. Após o aceite, ela seguirá ao coordenador do curso.'}
              </p>
              <label htmlFor={`justificativa-${item.identificador}`}>
                Motivo da decisão <small>necessário em caso de recusa</small>
                <textarea
                  className="campo"
                  id={`justificativa-${item.identificador}`}
                  rows="4"
                  value={justificativa}
                  onChange={(evento) => {
                    definirJustificativa(evento.target.value)
                    definirErro('')
                  }}
                  placeholder="Explique o que precisa ser revisto..."
                />
              </label>
              {erro && (
                <p className="avaliacao-submissao__erro" role="alert">
                  {erro}
                </p>
              )}
              <div className="avaliacao-submissao__acoes">
                <button
                  type="button"
                  className="botao-primario"
                  onClick={() => registrarDecisao(avaliacaoCoordenador ? 'Aprovado' : 'Em análise')}
                >
                  {avaliacaoCoordenador ? 'Aprovar e publicar' : 'Aceitar como orientador'}
                </button>
                <button
                  type="button"
                  className="botao-secundario"
                  onClick={() => registrarDecisao('Recusado')}
                >
                  Recusar submissão
                </button>
              </div>
            </div>
          ) : tipoUsuario === 'COORDENADOR' ? (
            <div className="avaliacao-submissao pagina-detalhes-submissao__decisao">
              <span className="pagina-detalhes-submissao__indice">Gestão do curso</span>
              <h2>Editar ou remover</h2>
              <p className="pagina-detalhes-submissao__decisao-intro">
                Você pode corrigir ou remover submissões do curso, inclusive as que enviou ou
                orienta.
              </p>
              <div className="avaliacao-submissao__acoes">
                <button
                  type="button"
                  className="botao-primario"
                  onClick={() => definirEditando(true)}
                >
                  Editar submissão
                </button>
                <button
                  type="button"
                  className="botao-secundario"
                  onClick={() => definirConfirmandoRemocao(true)}
                >
                  Remover submissão
                </button>
              </div>
            </div>
          ) : (
            <p
              className={`pagina-detalhes-submissao__aviso pagina-detalhes-submissao__aviso--${status
                .toLowerCase()
                .replaceAll(' ', '-')}`}
              role="status"
            >
              {mensagemStatus}
            </p>
          )}
        </aside>
      </div>

      {confirmandoRemocao && (
        <ConfirmacaoGestao rotulo="titulo-remover-submissao">
          <h2 id="titulo-remover-submissao">Remover esta submissão?</h2>
          <p>Este registro será removido permanentemente do sistema.</p>
          <div className="gestao-acoes">
            <button
              className="botao-secundario"
              type="button"
              onClick={() => definirConfirmandoRemocao(false)}
            >
              Manter submissão
            </button>
            <button
              className="gestao-excluir"
              type="button"
              onClick={() => {
                aoRemover()
                navegar(enderecoPrivado(volta), true)
              }}
            >
              Confirmar remoção
            </button>
          </div>
        </ConfirmacaoGestao>
      )}
    </main>
  )
}
