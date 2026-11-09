import { useState } from 'react'
import { Eye, FileText, Trash2, Upload } from 'lucide-react'
import { tiposProjeto } from '../constantes.js'
import './EtapaSubmissaoDocumentos.css'

function formatarTamanho(tamanho) {
  if (tamanho < 1024 * 1024) return `${Math.max(1, Math.round(tamanho / 1024))} KB`
  return `${(tamanho / (1024 * 1024)).toFixed(1).replace('.', ',')} MB`
}

function prepararListaArquivos(arquivos) {
  return Array.isArray(arquivos) ? arquivos : arquivos ? [arquivos] : []
}

export default function EtapaSubmissaoDocumentos({
  formulario,
  erros,
  alterar,
  erroDoCampo,
  alterarDocumentos,
}) {
  const [documentoArrastado, mudarDocumentoArrastado] = useState('')

  return (
    <section className="formulario-submissao__secao" aria-labelledby="dados-documentos">
      <div className="formulario-submissao__cabecalho">
        <span>04</span>
        <div>
          <h2 id="dados-documentos">Documentos e revisão</h2>
          <p>
            {formulario.tipo === 'TCC'
              ? 'Informe o link do repositório e confirme a publicação.'
              : 'Anexe o material e confirme as condições de publicação.'}
          </p>
        </div>
      </div>
      {formulario.tipo === 'TCC' ? (
        <div className="formulario-submissao__grade">
          <label className="formulario-submissao__campo-largo">
            Link do repositório Memória <span aria-hidden="true">*</span>
            <input
              required
              type="url"
              aria-invalid={Boolean(erros.linkMemoria)}
              aria-describedby={erroDoCampo('linkMemoria')}
              placeholder="https://memoria.ifsc.edu.br/..."
              value={formulario.linkMemoria}
              onChange={(e) => alterar('linkMemoria', e.target.value)}
            />
            {erros.linkMemoria && (
              <small id="erro-linkMemoria" className="formulario-submissao__erro-campo">
                {erros.linkMemoria}
              </small>
            )}
          </label>
          <p className="formulario-submissao__privacidade formulario-submissao__campo-largo">
            O TCC deve estar depositado no repositório institucional Memória antes do envio. Informe
            a URL pública do trabalho.
          </p>
        </div>
      ) : (
        <div className="documentos-submissao">
          {(tiposProjeto[formulario.tipo]?.documentos || []).map((documento) => {
            const arquivo = formulario.documentos[documento.id]
            const arquivos = prepararListaArquivos(arquivo)
            const temErro = Boolean(erros[documento.id])
            const idDaZona = `arquivo-${documento.id}`
            return (
              <div
                className={`campo-arquivo-wrapper ${temErro ? 'campo-arquivo-wrapper--erro' : ''} ${
                  documentoArrastado === documento.id ? 'campo-arquivo-wrapper--arrastando' : ''
                }`}
                key={documento.id}
                onDragOver={(evento) => {
                  evento.preventDefault()
                  mudarDocumentoArrastado(documento.id)
                }}
                onDragLeave={(evento) => {
                  if (!evento.currentTarget.contains(evento.relatedTarget)) {
                    mudarDocumentoArrastado('')
                  }
                }}
                onDrop={(evento) => {
                  evento.preventDefault()
                  mudarDocumentoArrastado('')
                  alterarDocumentos(documento, evento.dataTransfer.files)
                }}
              >
                <label className="campo-arquivo" htmlFor={idDaZona}>
                  <span className="campo-arquivo__icone" aria-hidden="true">
                    <Upload size={21} strokeWidth={1.9} />
                  </span>
                  <div className="campo-arquivo__conteudo">
                    <strong>{documento.nome}</strong>
                    <small>
                      {documento.obrigatorio ? 'Obrigatório' : 'Opcional'} ·{' '}
                      {documento.multiplo ? 'vários arquivos' : 'um PDF'}
                    </small>
                    <span className="campo-arquivo__acao">
                      {documentoArrastado === documento.id
                        ? 'Solte o PDF para anexar'
                        : 'Arraste o PDF para cá ou clique para escolher'}
                    </span>
                  </div>
                  <span className="campo-arquivo__selecionar">
                    <Upload size={16} aria-hidden="true" />
                    Escolher arquivo
                  </span>
                  <input
                    id={idDaZona}
                    required={documento.obrigatorio}
                    type="file"
                    multiple={documento.multiplo}
                    accept="application/pdf,.pdf"
                    aria-invalid={temErro}
                    aria-describedby={erroDoCampo(documento.id)}
                    onChange={(evento) => {
                      alterarDocumentos(documento, evento.currentTarget.files)
                      evento.currentTarget.value = ''
                    }}
                  />
                </label>
                {arquivos.length > 0 && (
                  <ul className="campo-arquivo__lista" aria-label={`Arquivos de ${documento.nome}`}>
                    {arquivos.map((arquivoSelecionado, indice) => (
                      <li
                        className="campo-arquivo__arquivo"
                        key={`${arquivoSelecionado.name}-${arquivoSelecionado.lastModified}-${indice}`}
                      >
                        <span className="campo-arquivo__tipo" aria-hidden="true">
                          <FileText size={19} strokeWidth={1.8} />
                          <span>PDF</span>
                        </span>
                        <span className="campo-arquivo__detalhe">
                          <strong title={arquivoSelecionado.name}>{arquivoSelecionado.name}</strong>
                          <small>{formatarTamanho(arquivoSelecionado.size)}</small>
                        </span>
                        <span className="campo-arquivo__acoes">
                          <button
                            className="campo-arquivo__botao"
                            type="button"
                            onClick={() => {
                              const url = URL.createObjectURL(arquivoSelecionado)
                              window.open(url, '_blank', 'noopener,noreferrer')
                              window.setTimeout(() => URL.revokeObjectURL(url), 60_000)
                            }}
                            aria-label={`Pré-visualizar ${arquivoSelecionado.name}`}
                          >
                            <Eye size={16} aria-hidden="true" />
                            Pré-visualizar
                          </button>
                          <button
                            className="campo-arquivo__botao campo-arquivo__botao--remover"
                            type="button"
                            onClick={() => {
                              alterarDocumentos(
                                documento,
                                arquivos.filter((_, indiceAtual) => indiceAtual !== indice),
                              )
                            }}
                            aria-label={`Remover ${arquivoSelecionado.name}`}
                          >
                            <Trash2 size={16} aria-hidden="true" />
                            Remover
                          </button>
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
                {erros[documento.id] && (
                  <span id={`erro-${documento.id}`} className="formulario-submissao__erro-campo">
                    {erros[documento.id]}
                  </span>
                )}
              </div>
            )
          })}
        </div>
      )}
      <label
        className={`consentimento-submissao ${
          formulario.aceitaPublicacao ? 'consentimento-submissao--ativo' : ''
        }`}
      >
        <input
          type="checkbox"
          checked={formulario.aceitaPublicacao}
          aria-describedby={erroDoCampo('aceitaPublicacao')}
          onChange={(e) => alterar('aceitaPublicacao', e.target.checked)}
        />
        <span className="consentimento-submissao__texto">
          <strong>Autorizar publicação</strong>
          <span>
            O projeto será avaliado pelo professor orientador e pela coordenação do curso antes de
            ser publicado no portal.
          </span>
        </span>
      </label>
      {erros.aceitaPublicacao && (
        <small id="erro-aceitaPublicacao" className="formulario-submissao__erro-campo">
          {erros.aceitaPublicacao}
        </small>
      )}
    </section>
  )
}
