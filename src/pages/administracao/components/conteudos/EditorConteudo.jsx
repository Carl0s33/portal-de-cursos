import { useEffect, useRef, useState } from 'react'
import { explicacoesCampos, gruposFormulario } from './configuracoes.js'

export default function EditorConteudo({
  item,
  configuracao,
  aoSalvar,
  aoCancelar,
  curso,
  cursoId,
  bloquearCurso,
  dominio,
  professores = [],
  alunos = [],
  cursos = [],
  disciplinas = [],
  campus = [],
  areas = [],
  salvando = false,
}) {
  const formulario = useRef(null)
  const [dados, definirDados] = useState(() =>
    Object.fromEntries(
      configuracao.campos.map(([chave, , opcoes]) => {
        if (item?.[chave] !== undefined && item?.[chave] !== null) return [chave, item[chave]]
        if (['alunos', 'disciplinas', 'professores'].includes(opcoes)) return [chave, []]
        if (chave === 'cursoId') return [chave, String(curso?.id || cursoId || '')]
        if (chave === 'coordenadorId') return [chave, '']
        if (chave === 'obrigatoria') return [chave, item?.[chave] === false ? 'false' : 'true']
        if (['campusId', 'areaId'].includes(chave)) return [chave, '']
        return [
          chave,
          Array.isArray(opcoes)
            ? typeof opcoes[0] === 'object'
              ? opcoes[0].valor
              : opcoes[0]
            : '',
        ]
      }),
    ),
  )
  useEffect(() => {
    const botaoDeOrigem = document.activeElement
    formulario.current?.querySelector('h2')?.focus()
    return () => {
      if (botaoDeOrigem?.isConnected) botaoDeOrigem.focus()
    }
  }, [])
  return (
    <form
      ref={formulario}
      className="gestao-formulario"
      onSubmit={(evento) => {
        evento.preventDefault()
        aoSalvar({
          ...item,
          ...Object.fromEntries(
            Object.entries(dados).map(([chave, valor]) => [
              chave,
              typeof valor === 'string' ? valor.trim() : valor,
            ]),
          ),
        })
      }}
    >
      <h2 tabIndex={-1}>
        {item ? 'Editar' : 'Novo'} {configuracao.singular}
      </h2>
      <p className="gestao-formulario__orientacao">
        Os campos com * precisam ser preenchidos. Leia a explicação abaixo de cada campo se tiver
        dúvida.
      </p>
      <div className="gestao-relacao" aria-label="Relações deste registro">
        <span>
          {dominio === 'cursos' ? 'Curso' : dominio === 'disciplinas' ? 'Curso' : 'Projeto'}
        </span>
        <span aria-hidden="true">→</span>
        <span>
          {dominio === 'cursos'
            ? 'Oferta acadêmica'
            : dominio === 'disciplinas'
              ? 'Classificação'
              : 'Disciplinas, professores e alunos opcionais'}
        </span>
        {dominio === 'projetos' && (
          <>
            <span aria-hidden="true">→</span>
            <span>Professores</span>
          </>
        )}
      </div>
      <div className="gestao-relacao__resumo" aria-live="polite">
        {dominio === 'cursos' && (
          <>
            <span>
              {disciplinas.filter(
                (disciplina) =>
                  String(disciplina.cursoId ?? disciplina.identificadorCurso ?? '') ===
                  String(item?.identificador ?? item?.id ?? ''),
              ).length ||
                item?.componentes ||
                0}{' '}
              matérias incluídas
            </span>
          </>
        )}
        {dominio !== 'cursos' && (
          <span>
            {cursos.find(
              (itemCurso) =>
                String(
                  ['disciplinas', 'projetos'].includes(dominio)
                    ? itemCurso.id
                    : itemCurso.identificador || itemCurso.id,
                ) === String(dados.cursoId) ||
                (dominio === 'projetos' &&
                  String(itemCurso.identificador) === String(dados.identificadorCurso)),
            )?.nome || 'Curso ainda não selecionado'}
          </span>
        )}
        {dominio === 'projetos' && (
          <>
            <span>
              {(dados.disciplinaIds || []).length} disciplina
              {(dados.disciplinaIds || []).length === 1 ? '' : 's'}
            </span>
            <span>
              {(dados.alunoIds || []).length} aluno
              {(dados.alunoIds || []).length === 1 ? '' : 's'} participante
              {(dados.alunoIds || []).length === 1 ? '' : 's'}
            </span>
            <span>
              {(dados.professorIds || []).length} professor
              {(dados.professorIds || []).length === 1 ? '' : 'es'} orientador
              {(dados.professorIds || []).length === 1 ? '' : 'es'}
            </span>
          </>
        )}
      </div>
      {gruposFormulario[dominio].map((grupo) => (
        <section className="gestao-formulario__grupo" key={grupo.titulo}>
          <header>
            <h3>{grupo.titulo}</h3>
            <p>{grupo.descricao}</p>
          </header>
          <div className="gestao-campos">
            {grupo.campos
              .map((campo) => configuracao.campos.find(([chave]) => chave === campo))
              .map(([chave, rotulo, opcoes]) => {
                const idCampo = `${dominio}-${chave}`
                const idAjuda = `${idCampo}-ajuda`
                const obrigatorio =
                  dominio === 'cursos' || dominio === 'disciplinas'
                    ? true
                    : opcoes !== 'optional' &&
                      (!['alunos', 'disciplinas', 'professores'].includes(opcoes) ||
                        (dominio === 'projetos' && opcoes === 'professores'))
                const explicacao = explicacoesCampos[dominio]?.[chave]
                return (
                  <div
                    key={chave}
                    className={
                      opcoes === 'textarea' ? 'gestao-campo gestao-campo-largo' : 'gestao-campo'
                    }
                  >
                    <label htmlFor={idCampo}>
                      {rotulo}
                      {obrigatorio ? ' *' : ' (opcional)'}
                    </label>
                    {['campus', 'areas'].includes(opcoes) ? (
                      <select
                        id={idCampo}
                        aria-describedby={idAjuda}
                        required
                        disabled={opcoes === 'campus' && Boolean(item?.id)}
                        value={dados[chave]}
                        onChange={(e) => definirDados({ ...dados, [chave]: e.target.value })}
                      >
                        <option value="">
                          Selecione {opcoes === 'campus' ? 'um campus' : 'uma área'}
                        </option>
                        {(opcoes === 'campus' ? campus : areas).map((registro) => (
                          <option key={registro.id} value={String(registro.id)}>
                            {registro.nome}
                          </option>
                        ))}
                      </select>
                    ) : opcoes === 'cursos' ? (
                      <select
                        id={idCampo}
                        aria-describedby={idAjuda}
                        required
                        value={dados[chave]}
                        disabled={chave === 'cursoId' && bloquearCurso}
                        onChange={(e) =>
                          definirDados({
                            ...dados,
                            [chave]: e.target.value,
                            ...(chave === 'cursoId' && dominio === 'projetos'
                              ? { alunoIds: [], disciplinaIds: [] }
                              : {}),
                          })
                        }
                      >
                        <option value="">Selecione um curso</option>
                        {cursos.map((itemCurso) => (
                          <option
                            key={itemCurso.id || itemCurso.identificador}
                            value={String(
                              ['disciplinas', 'projetos'].includes(dominio)
                                ? itemCurso.id
                                : itemCurso.identificador || itemCurso.id,
                            )}
                          >
                            {itemCurso.nome} · {itemCurso.sigla}
                          </option>
                        ))}
                      </select>
                    ) : ['alunos', 'disciplinas', 'professores'].includes(opcoes) ? (
                      <>
                        <select
                          id={idCampo}
                          aria-describedby={idAjuda}
                          multiple
                          size={Math.min(
                            Math.max(
                              (opcoes === 'alunos'
                                ? alunos
                                : opcoes === 'disciplinas'
                                  ? disciplinas
                                  : professores
                              ).length,
                              3,
                            ),
                            6,
                          )}
                          value={dados[chave]}
                          required={dominio === 'projetos' && opcoes === 'professores'}
                          onChange={(e) =>
                            definirDados({
                              ...dados,
                              [chave]: Array.from(
                                e.target.selectedOptions,
                                (option) => option.value,
                              ),
                            })
                          }
                        >
                          {(opcoes === 'alunos'
                            ? alunos
                            : opcoes === 'disciplinas'
                              ? disciplinas
                              : professores
                          )
                            .filter((registro) => {
                              if (!['disciplinas', 'alunos'].includes(opcoes) || !dados.cursoId)
                                return true
                              const idCursoDisciplina =
                                registro.cursoId ??
                                registro.curso?.id ??
                                registro.identificadorCurso
                              return String(idCursoDisciplina ?? '') === String(dados.cursoId)
                            })
                            .map((registro) => (
                              <option
                                key={registro.id || registro.identificador}
                                value={String(registro.id || registro.identificador)}
                              >
                                {registro.nome || registro.titulo}{' '}
                                {registro.email ? `· ${registro.email}` : ''}
                              </option>
                            ))}
                        </select>
                        <small className="gestao-campo-ajuda">
                          {opcoes === 'alunos'
                            ? alunos.length
                              ? 'A lista mostra estudantes vinculados ao curso escolhido.'
                              : 'Nenhuma conta de aluno foi encontrada.'
                            : opcoes === 'disciplinas'
                              ? disciplinas.length
                                ? 'As disciplinas são filtradas pelo curso selecionado.'
                                : 'Cadastre disciplinas para criar este vínculo.'
                              : professores.length
                                ? dominio === 'projetos'
                                  ? 'Selecione um ou mais professores para orientar o projeto.'
                                  : 'Selecione os professores que ministram esta disciplina.'
                                : 'Nenhum professor disponível.'}
                        </small>
                      </>
                    ) : opcoes === 'orientador' ? (
                      <select
                        id={idCampo}
                        aria-describedby={idAjuda}
                        value={dados[chave]}
                        onChange={(e) => definirDados({ ...dados, [chave]: e.target.value })}
                      >
                        <option value="">Selecione um professor</option>
                        {professores.map((professor) => (
                          <option key={professor.id} value={String(professor.id)}>
                            {professor.nome} · {professor.email}
                          </option>
                        ))}
                      </select>
                    ) : opcoes === 'coordenador' ? (
                      <select
                        id={idCampo}
                        aria-describedby={idAjuda}
                        required={!bloquearCurso && professores.length > 0}
                        value={dados[chave]}
                        disabled={bloquearCurso}
                        onChange={(e) =>
                          definirDados({
                            ...dados,
                            [chave]: e.target.value,
                            professorIds: [
                              ...new Set([...(dados.professorIds || []), e.target.value]),
                            ],
                          })
                        }
                      >
                        <option value="">Selecione um professor</option>
                        {professores.map((professor) => (
                          <option key={professor.id} value={professor.id}>
                            {professor.nome} · {professor.email}
                          </option>
                        ))}
                      </select>
                    ) : Array.isArray(opcoes) ? (
                      <select
                        required
                        id={idCampo}
                        aria-describedby={idAjuda}
                        value={dados[chave]}
                        onChange={(e) => definirDados({ ...dados, [chave]: e.target.value })}
                      >
                        {opcoes.map((opcao) => (
                          <option
                            key={typeof opcao === 'object' ? opcao.valor : opcao}
                            value={typeof opcao === 'object' ? opcao.valor : opcao}
                          >
                            {typeof opcao === 'object' ? opcao.rotulo : opcao}
                          </option>
                        ))}
                      </select>
                    ) : opcoes === 'textarea' ? (
                      <textarea
                        id={idCampo}
                        aria-describedby={idAjuda}
                        rows={4}
                        required
                        maxLength={1500}
                        value={dados[chave]}
                        onChange={(e) => definirDados({ ...dados, [chave]: e.target.value })}
                      />
                    ) : (
                      <input
                        id={idCampo}
                        aria-describedby={idAjuda}
                        required={opcoes !== 'optional'}
                        type={
                          [
                            'cargaHoraria',
                            'disciplinasObrigatorias',
                            'disciplinasOptativas',
                          ].includes(chave)
                            ? 'number'
                            : 'text'
                        }
                        min={
                          [
                            'cargaHoraria',
                            'disciplinasObrigatorias',
                            'disciplinasOptativas',
                          ].includes(chave)
                            ? 0
                            : undefined
                        }
                        maxLength={200}
                        value={dados[chave]}
                        readOnly={chave === 'curso' && bloquearCurso}
                        onChange={(e) => definirDados({ ...dados, [chave]: e.target.value })}
                      />
                    )}
                    {explicacao && (
                      <small className="gestao-campo-ajuda" id={idAjuda}>
                        {explicacao}
                      </small>
                    )}
                  </div>
                )
              })}
          </div>
        </section>
      ))}
      <div className="gestao-acoes">
        <button className="botao-primario" type="submit" disabled={salvando}>
          {salvando
            ? 'Salvando…'
            : item
              ? 'Salvar alterações'
              : dominio === 'projetos'
                ? 'Salvar projeto como rascunho'
                : `Cadastrar ${configuracao.singular}`}
        </button>
        <button className="botao-secundario" type="button" onClick={aoCancelar}>
          Cancelar
        </button>
      </div>
    </form>
  )
}
