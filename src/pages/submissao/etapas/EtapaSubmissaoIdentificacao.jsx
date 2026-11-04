export default function EtapaSubmissaoIdentificacao({
  cursos,
  carregandoCadastros,
  formulario,
  erros,
  autorSessao,
  alterar,
  erroDoCampo,
}) {
  return (
    <section className="formulario-submissao__secao" aria-labelledby="dados-identificacao">
      <div className="formulario-submissao__cabecalho">
        <span>1</span>
        <div>
          <h2 id="dados-identificacao">Identificação</h2>
          <p>Diga quem você é e a qual curso o projeto pertence.</p>
        </div>
      </div>
      <div className="formulario-submissao__grade">
        <label>
          Nome completo <span aria-hidden="true">*</span>
          <input
            required
            aria-invalid={Boolean(erros.nome)}
            aria-describedby={erroDoCampo('nome')}
            placeholder="Seu nome completo"
            value={formulario.nome}
            readOnly={autorSessao}
            onChange={(e) => alterar('nome', e.target.value)}
          />
          {erros.nome && (
            <small id="erro-nome" className="formulario-submissao__erro-campo">
              {erros.nome}
            </small>
          )}
        </label>
        <label>
          E-mail <span aria-hidden="true">*</span>
          <input
            required
            type="email"
            aria-invalid={Boolean(erros.email)}
            aria-describedby={erroDoCampo('email')}
            placeholder="voce@email.com"
            value={formulario.email}
            readOnly={autorSessao}
            onChange={(e) => alterar('email', e.target.value)}
          />
          {erros.email && (
            <small id="erro-email" className="formulario-submissao__erro-campo">
              {erros.email}
            </small>
          )}
        </label>
        <label className="formulario-submissao__campo-largo">
          Curso <span aria-hidden="true">*</span>
          <select
            required
            aria-invalid={Boolean(erros.curso)}
            aria-describedby={erroDoCampo('curso')}
            value={formulario.curso}
            disabled={autorSessao}
            onChange={(e) => {
              alterar('curso', e.target.value)
              alterar('orientador', '')
            }}
          >
            <option value="">
              {carregandoCadastros ? 'Carregando cursos…' : 'Selecione o curso'}
            </option>
            {cursos.map((curso) => (
              <option key={curso.id} value={String(curso.id)}>
                {curso.nome}
                {curso.sigla ? ` (${curso.sigla})` : ''}
              </option>
            ))}
          </select>
          {!carregandoCadastros && !cursos.length && (
            <small className="formulario-submissao__erro-campo" role="status">
              Os cursos não puderam ser carregados agora.
            </small>
          )}
          {erros.curso && (
            <small id="erro-curso" className="formulario-submissao__erro-campo">
              {erros.curso}
            </small>
          )}
        </label>
        <p className="formulario-submissao__privacidade formulario-submissao__campo-largo">
          Usamos seu nome e e-mail somente para identificar sua submissão e permitir o contato sobre
          a avaliação.
        </p>
      </div>
    </section>
  )
}
