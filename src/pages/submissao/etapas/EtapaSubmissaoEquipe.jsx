import Icone from '@/shared/components/Icone.jsx'

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
  sessao,
}) {
  const ehDocente = sessao?.tipoUsuario === 'PROFESSOR' || sessao?.tipoUsuario === 'COORDENADOR'
  const orientadoresCurso = listaOrientadores(formulario.curso)

  function adicionarProfessorParticipante(nome) {
    if (!nome) return
    const lista = Array.isArray(formulario.professoresParticipantes)
      ? formulario.professoresParticipantes
      : []
    if (!lista.includes(nome) && nome !== formulario.orientador) {
      alterar('professoresParticipantes', [...lista, nome])
    }
  }

  function removerProfessorParticipante(nome) {
    const lista = Array.isArray(formulario.professoresParticipantes)
      ? formulario.professoresParticipantes
      : []
    alterar(
      'professoresParticipantes',
      lista.filter((p) => p !== nome),
    )
  }

  return (
    <section className="formulario-submissao__secao" aria-labelledby="dados-equipe">
      <div className="formulario-submissao__cabecalho">
        <span>03</span>
        <div>
          <h2 id="dados-equipe">Equipe e orientação</h2>
          <p>Associe o orientador, co-orientadores / docentes e os estudantes da produção.</p>
        </div>
      </div>

      <div className="formulario-submissao__grade">
        {/* Bloco de seleção de modalidade para docentes */}
        {ehDocente && (
          <div className="formulario-submissao__campo-largo equipe-opcao-docente">
            <label className="equipe-opcao-docente__toggle">
              <input
                type="checkbox"
                checked={Boolean(formulario.projetoSemAlunos)}
                onChange={(e) => alterar('projetoSemAlunos', e.target.checked)}
              />
              <span className="equipe-opcao-docente__texto">
                <strong>Projeto de iniciativa docente (sem alunos autores)</strong>
                <small>
                  Marque esta opção caso este projeto de pesquisa ou extensão seja conduzido
                  diretamente pelo corpo docente.
                </small>
              </span>
            </label>
          </div>
        )}

        {/* Professor Orientador */}
        <label className="formulario-submissao__campo-largo">
          Professor orientador <span aria-hidden="true">*</span>
          <select
            required
            disabled={!formulario.curso}
            aria-invalid={Boolean(erros.orientador)}
            aria-describedby={erroDoCampo('orientador')}
            value={formulario.orientador}
            onChange={(e) => {
              const novoOrientador = e.target.value
              alterar('orientador', novoOrientador)
              // Se o novo orientador estava na lista de participantes, remove dele
              if (formulario.professoresParticipantes?.includes(novoOrientador)) {
                removerProfessorParticipante(novoOrientador)
              }
            }}
          >
            <option value="">
              {formulario.curso ? 'Selecione o professor orientador' : 'Selecione o curso primeiro'}
            </option>
            {orientadoresCurso.map((orientador) => (
              <option key={orientador.id} value={orientador.nome}>
                {orientador.nome}
                {orientador.titulacao ? ` (${orientador.titulacao})` : ''}
              </option>
            ))}
          </select>
          {formulario.curso && !orientadoresCurso.length && (
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

        {/* Professores Participantes / Co-orientadores */}
        <div className="formulario-submissao__campo-largo">
          <label>
            Outros professores participantes / colaboradores
            <select
              disabled={!formulario.curso}
              value=""
              onChange={(e) => adicionarProfessorParticipante(e.target.value)}
            >
              <option value="">
                {!formulario.curso
                  ? 'Selecione o curso primeiro'
                  : 'Selecione para adicionar outro professor ao projeto…'}
              </option>
              {orientadoresCurso
                .filter(
                  (orientador) =>
                    orientador.nome !== formulario.orientador &&
                    !formulario.professoresParticipantes?.includes(orientador.nome),
                )
                .map((orientador) => (
                  <option key={orientador.id} value={orientador.nome}>
                    {orientador.nome}
                    {orientador.titulacao ? ` (${orientador.titulacao})` : ''}
                  </option>
                ))}
            </select>
          </label>

          {Array.isArray(formulario.professoresParticipantes) &&
            formulario.professoresParticipantes.length > 0 && (
              <div className="etiquetas-submissao" style={{ marginTop: '10px' }}>
                {formulario.professoresParticipantes.map((profNome) => (
                  <button
                    key={profNome}
                    type="button"
                    title={`Remover ${profNome}`}
                    onClick={() => removerProfessorParticipante(profNome)}
                  >
                    <span>Prof. {profNome}</span>
                    <span aria-hidden="true"> ×</span>
                  </button>
                ))}
              </div>
            )}
        </div>

        {/* Adicionar Disciplinas */}
        <label className="formulario-submissao__campo-largo">
          Adicionar disciplina curricular associada
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

        {/* Se for projeto sem alunos, oculta coautores e mostra aviso */}
        {formulario.projetoSemAlunos ? (
          <div className="formulario-submissao__campo-largo painel-informativo">
            <p>
              <strong>Produção conduzida por docentes:</strong> O projeto será publicado sob a
              titularidade e responsabilidade dos professores orientador e colaboradores indicados.
            </p>
          </div>
        ) : (
          <div className="autores-submissao formulario-submissao__campo-largo">
            <div className="autores-submissao__cabecalho">
              <div>
                <strong>Autores e Coautores (Discentes)</strong>
                <small style={{ display: 'block', color: 'var(--texto-suave)', marginTop: '2px' }}>
                  Ideal para Projetos Integradores, TCCs e pesquisas em equipe com múltiplos alunos.
                </small>
              </div>
              <button type="button" className="botao-secundario" onClick={adicionarAutor}>
                + Adicionar integrante
              </button>
            </div>

            {formulario.autores.length === 0 && (
              <p
                style={{
                  fontSize: '0.875rem',
                  color: 'var(--texto-suave)',
                  margin: '4px 0 0',
                }}
              >
                {sessao?.tipoUsuario === 'ALUNO'
                  ? 'Você já é o autor principal. Clique em "+ Adicionar integrante" se o projeto tiver colegas coautores.'
                  : 'Clique em "+ Adicionar integrante" para inserir os estudantes autores deste projeto.'}
              </p>
            )}

            {formulario.autores.map((autor, indice) => (
              <div className="autores-submissao__linha" key={indice}>
                <input
                  placeholder="Nome do integrante"
                  aria-label={`Nome do integrante ${indice + 1}`}
                  value={autor.nome}
                  onChange={(e) => alterarAutor(indice, 'nome', e.target.value)}
                />
                <input
                  placeholder="E-mail institucional (@escolar.ifrn.edu.br)"
                  type="email"
                  aria-label={`E-mail do integrante ${indice + 1}`}
                  value={autor.email}
                  onChange={(e) => alterarAutor(indice, 'email', e.target.value)}
                />
                <button
                  type="button"
                  className="botao-remover-autor"
                  title="Remover integrante"
                  aria-label={`Remover integrante ${autor.nome || indice + 1}`}
                  onClick={() => removerAutor(indice)}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
