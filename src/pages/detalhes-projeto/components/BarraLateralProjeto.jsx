import { useState } from 'react'
import Icone from '@/shared/components/Icone.jsx'
import { baixarDocumentoBlob, obterUrlDownloadDocumento } from '@/api/projetos.js'
import './barra-lateral-projeto.css'

function obterTokenSessao() {
  try {
    const salva = JSON.parse(sessionStorage.getItem('portal-cursos-sessao') || 'null')
    return salva && Date.now() < salva.expiraEm ? salva.token : null
  } catch {
    return null
  }
}

function obterIconeDoc(doc) {
  if (doc.ehMemoria || doc.ehUrl) return 'link-externo'
  if (/zip|rar|tar|gz/i.test(doc.extensao)) return 'arquivo-zip'
  return 'documento-destaque'
}

export default function BarraLateralProjeto({ projeto }) {
  const [baixandoId, definirBaixandoId] = useState(null)
  const token = obterTokenSessao()

  const autores = Array.isArray(projeto.autores) ? projeto.autores : []
  const orientadores = Array.isArray(projeto.orientadores) ? projeto.orientadores : []
  const documentos = Array.isArray(projeto.documentos) ? projeto.documentos : []

  async function manipularDownload(e, doc) {
    if (doc.ehUrl) {
      // É um link externo seguro (ex: Repositório Institucional / Memória do TCC)
      return
    }

    e.preventDefault()
    definirBaixandoId(doc.id)

    try {
      const blobUrl = await baixarDocumentoBlob(projeto.id, doc.id, token)
      const link = document.createElement('a')
      link.href = blobUrl
      link.download = doc.nome || 'documento'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(blobUrl)
    } catch {
      const url = obterUrlDownloadDocumento(projeto.id, doc.id)
      window.open(url, '_blank', 'noopener,noreferrer')
    } finally {
      definirBaixandoId(null)
    }
  }

  return (
    <aside className="barra-lateral-projeto" aria-label="Informações complementares do projeto">
      {/* CARTÃO A: AUTORES */}
      <article className="cartao-lateral-projeto" aria-labelledby="titulo-autores">
        <header className="cartao-lateral-projeto__topo">
          <h2 id="titulo-autores" className="cartao-lateral-projeto__titulo">
            Autores
          </h2>
          <span className="cartao-lateral-projeto__contador">
            {autores.length === 1 ? '1 integrante' : `${autores.length} integrantes`}
          </span>
        </header>

        {autores.length > 0 ? (
          <ul className="cartao-lateral-projeto__lista">
            {autores.map((autor, idx) => (
              <li key={autor.id || idx} className="cartao-lateral-projeto__item">
                <div className="cartao-lateral-projeto__icone-container" aria-hidden="true">
                  <Icone nome="usuario" classe="cartao-lateral-projeto__icone" />
                </div>
                <div className="cartao-lateral-projeto__item-detalhe">
                  <strong className="cartao-lateral-projeto__nome">{autor.nome}</strong>
                  <span className="cartao-lateral-projeto__subtexto">
                    {autor.curso || projeto.cursoNome || 'Aluno'}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="cartao-lateral-projeto__vazio">Nenhum autor registrado.</p>
        )}
      </article>

      {/* CARTÃO B: ORIENTAÇÃO */}
      <article className="cartao-lateral-projeto" aria-labelledby="titulo-orientacao">
        <header className="cartao-lateral-projeto__topo">
          <h2 id="titulo-orientacao" className="cartao-lateral-projeto__titulo">
            Orientação
          </h2>
          <span className="cartao-lateral-projeto__contador">Docentes</span>
        </header>

        {orientadores.length > 0 ? (
          <ul className="cartao-lateral-projeto__lista">
            {orientadores.map((prof, idx) => (
              <li key={prof.id || idx} className="cartao-lateral-projeto__item">
                <div className="cartao-lateral-projeto__icone-container" aria-hidden="true">
                  <Icone nome="docentes-detalhe" classe="cartao-lateral-projeto__icone" />
                </div>
                <div className="cartao-lateral-projeto__item-detalhe">
                  <strong className="cartao-lateral-projeto__nome">{prof.nome}</strong>
                  <span className="cartao-lateral-projeto__subtexto">{prof.papel}</span>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="cartao-lateral-projeto__vazio">Orientação não informada.</p>
        )}
      </article>

      {/* CARTÃO C: DOCUMENTOS */}
      <article className="cartao-lateral-projeto" aria-labelledby="titulo-documentos">
        <header className="cartao-lateral-projeto__topo">
          <h2 id="titulo-documentos" className="cartao-lateral-projeto__titulo">
            Documentos
          </h2>
          <span className="cartao-lateral-projeto__contador">
            {documentos.length === 1 ? '1 arquivo' : `${documentos.length} arquivos`}
          </span>
        </header>

        {documentos.length > 0 ? (
          <ul className="cartao-lateral-projeto__lista-docs">
            {documentos.map((doc) => {
              const urlDestino = doc.ehUrl
                ? doc.localizacao
                : projeto.id && doc.id !== undefined
                  ? obterUrlDownloadDocumento(projeto.id, doc.id)
                  : '#'

              const iconeDoc = obterIconeDoc(doc)

              return (
                <li key={doc.id} className="cartao-lateral-projeto__item-doc">
                  <div className="cartao-lateral-projeto__doc-icone-container" aria-hidden="true">
                    <Icone nome={iconeDoc} classe="cartao-lateral-projeto__doc-icone" />
                  </div>

                  <div className="cartao-lateral-projeto__doc-info">
                    <a
                      href={urlDestino}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="cartao-lateral-projeto__doc-link"
                      onClick={(e) => manipularDownload(e, doc)}
                      title={
                        doc.ehUrl
                          ? `Acessar ${doc.nome} (link externo)`
                          : `Baixar ${doc.nome}`
                      }
                    >
                      <span className="cartao-lateral-projeto__doc-nome">
                        {doc.ehMemoria ? 'Memória do TCC' : doc.nome}
                      </span>
                      {doc.ehUrl && (
                        <Icone
                          nome="link-externo"
                          classe="cartao-lateral-projeto__icone-externo"
                        />
                      )}
                    </a>

                    <span className="cartao-lateral-projeto__doc-meta">
                      {baixandoId === doc.id ? 'Baixando arquivo…' : doc.subtitulo}
                    </span>
                  </div>
                </li>
              )
            })}
          </ul>
        ) : (
          <p className="cartao-lateral-projeto__vazio">Nenhum documento disponível.</p>
        )}
      </article>
    </aside>
  )
}
