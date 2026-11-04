import { tiposProjeto } from '../constantes.js'

export default function EtapaSubmissaoDocumentos({
  formulario,
  erros,
  alterar,
  erroDoCampo,
  alterarDocumentos,
}) {
  return (
    <section className="formulario-submissao__secao" aria-labelledby="dados-documentos">
      <div className="formulario-submissao__cabecalho">
        <span>4</span>
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
            return (
              <label className="campo-arquivo" key={documento.id}>
                <span className="campo-arquivo__icone" aria-hidden="true">
                  ↑
                </span>
                <strong>
                  {arquivo
                    ? Array.isArray(arquivo)
                      ? `${arquivo.length} arquivo(s)`
                      : arquivo.name
                    : documento.nome}
                </strong>
                <small>
                  {documento.obrigatorio ? 'Obrigatório' : 'Opcional'} ·{' '}
                  {documento.multiplo ? 'vários arquivos' : 'um PDF'}
                </small>
                <input
                  required={documento.obrigatorio}
                  type="file"
                  multiple={documento.multiplo}
                  accept="application/pdf,.pdf"
                  aria-invalid={Boolean(erros[documento.id])}
                  aria-describedby={erroDoCampo(documento.id)}
                  onChange={(e) => alterarDocumentos(documento, e.target.files)}
                />
                {erros[documento.id] && (
                  <small id={`erro-${documento.id}`} className="formulario-submissao__erro-campo">
                    {erros[documento.id]}
                  </small>
                )}
              </label>
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
