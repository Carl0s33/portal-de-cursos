export default function EtapaSubmissaoEquipe({
  formulario,
  erros,
  alterar,
  erroDoCampo,
  listaOrientadores,
  adicionarAutor,
  removerAutor,
  alterarAutor,
  adicionarDisciplina,
  disciplinasDisponiveis = [],
  carregandoDisciplinas = false,
}) {
  return (
    <section className="formulario-submissao__secao" aria-labelledby="dados-equipe">
      <div className="formulario-submissao__cabecalho">
        <span>03</span>
        <div>
          <h2 id="dados-equipe">Equipe e orientação</h2>
          <p>Associe o orientador e os demais autores da produção.</p>
        </div>
      </div>
      <div className="formulario-submissao__grade">
        <label className="formulario-submissao__campo-largo">
          Professor orientador <span aria-hidden="true">*</span>
          <select
            required
            disabled={!formulario.curso}
            aria-invalid={Boolean(erros.orientador)}
            aria-describedby={erroDoCampo('orientador')}
            value={formulario.orientador}
            onChange={(e) => alterar('orientador', e.target.value)}
          >
            <option value="">
              {formulario.curso ? 'Selecione o professor orientador' : 'Selecione o curso primeiro'}
            </option>
            {listaOrientadores(formulario.curso).map((orientador) => (
              <option key={orientador.id} value={orientador.nome}>
                {orientador.nome}
              </option>
            ))}
          </select>
          {formulario.curso && !listaOrientadores(formulario.curso).length && (
            <small className="formulario-submissao__erro-campo">
              Não há professor disponível para este curso no momento.
            </small>
          )}
          {erros.orientador && (
            <small id="erro-orientador" className="formulario-submissao__erro-campo">
              {erros.orientador}
            </small>
          )}
        </label>
        <label className="formulario-submissao__campo-largo">
          Adicionar disciplina
          <select
            disabled={!formulario.curso || carregandoDisciplinas}
            value=""
            onChange={(e) => {
              if (e.target.value) {
                adicionarDisciplina(e.target.value)
              }
            }}
          >
            <option value="">
              {!formulario.curso
                ? 'Selecione o curso primeiro na Etapa 1'
                : carregandoDisciplinas
                  ? 'Carregando disciplinas existentes…'
                  : disciplinasDisponiveis.length
                    ? 'Selecione uma disciplina existente para associar…'
                    : 'Nenhuma disciplina cadastrada para este curso'}
            </option>
            {disciplinasDisponiveis
              .filter(
                (disciplina) =>
                  !formulario.disciplinas.includes(disciplina.nome || disciplina.identificador),
              )
              .map((disciplina) => (
                <option
                  key={disciplina.id || disciplina.identificador}
                  value={disciplina.nome || disciplina.identificador}
                >
                  {disciplina.nome}
                  {disciplina.codigo ? ` (${disciplina.codigo})` : ''}
                </option>
              ))}
          </select>
          <input
            style={{ marginTop: '8px' }}
            placeholder="Ou digite o nome de outra disciplina e pressione Enter"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                if (e.currentTarget.value.trim()) {
                  adicionarDisciplina(e.currentTarget.value)
                  e.currentTarget.value = ''
                }
              }
            }}
          />
        </label>
        <div className="etiquetas-submissao formulario-submissao__campo-largo">
          {formulario.disciplinas.map((disciplina) => (
            <button
              key={disciplina}
              type="button"
              onClick={() =>
                alterar(
                  'disciplinas',
                  formulario.disciplinas.filter((item) => item !== disciplina),
                )
              }
            >
              {disciplina} ×
            </button>
          ))}
        </div>
        <div className="autores-submissao formulario-submissao__campo-largo">
          <div className="autores-submissao__cabecalho">
            <strong>Coautores</strong>
            <button type="button" className="botao-secundario" onClick={adicionarAutor}>
              Adicionar coautor
            </button>
          </div>
          {formulario.autores.map((autor, indice) => (
            <div className="autores-submissao__linha" key={indice}>
              <input
                placeholder="Nome do coautor"
                aria-label={`Nome do coautor ${indice + 1}`}
                value={autor.nome}
                onChange={(e) => alterarAutor(indice, 'nome', e.target.value)}
              />
              <input
                placeholder="E-mail"
                type="email"
                aria-label={`E-mail do coautor ${indice + 1}`}
                value={autor.email}
                onChange={(e) => alterarAutor(indice, 'email', e.target.value)}
              />
              <button
                type="button"
                className="botao-remover-autor"
                title="Remover coautor"
                aria-label={`Remover coautor ${autor.nome || indice + 1}`}
                onClick={() => removerAutor(indice)}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
