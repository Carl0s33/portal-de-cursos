import './formulario-professor.css'
import { useState } from 'react'

export default function FormularioProfessor({
  aoSalvar,
  aoCancelar,
  ocupado,
  erro,
  cursoIdInicial = '',
  cursosVinculados = [],
}) {
  const [erroVinculo, mudarErroVinculo] = useState('')
  const [dados, mudarDados] = useState({
    nome: '',
    email: '',
    username: '',
    senha: '',
    cursoId: String(cursoIdInicial || ''),
    cursoIds: cursoIdInicial ? [String(cursoIdInicial)] : [],
    tipoUsuario: 'PROFESSOR',
    titulacao: 'MESTRADO',
    descricao: '',
  })

  function alterar(campo, valor) {
    mudarDados((atual) => ({ ...atual, [campo]: valor }))
    mudarErroVinculo('')
  }

  function salvar(evento) {
    evento.preventDefault()
    const cursosSelecionados = dados.cursoIds.length ? dados.cursoIds : [dados.cursoId]
    if (!cursosSelecionados.filter(Boolean).length) {
      mudarErroVinculo('Selecione ou informe pelo menos um curso.')
      return
    }
    if (dados.tipoUsuario === 'COORDENADOR' && cursosSelecionados.filter(Boolean).length !== 1) {
      mudarErroVinculo('Um coordenador deve estar vinculado a apenas um curso.')
      return
    }
    mudarErroVinculo('')
    aoSalvar({
      usuario: {
        nome: dados.nome.trim(),
        email: dados.email.trim(),
        username: dados.username.trim(),
        senha: dados.senha,
        tipoUsuario: dados.tipoUsuario,
      },
      cursoId: Number(cursosSelecionados[0]),
      cursoIds: cursosSelecionados.map(Number),
      titulacao: dados.titulacao,
      descricao: dados.descricao.trim(),
    })
  }

  return (
    <form className="gestao-formulario formulario-professor" onSubmit={salvar} aria-busy={ocupado}>
      <h2>Novo professor</h2>

      <section className="gestao-formulario__grupo">
        <header>
          <h3>Dados da conta</h3>
          <p>Informações usadas para identificar e acessar o portal.</p>
        </header>
        <div className="gestao-campos">
          <label>
            Nome completo
            <input
              className="campo"
              type="text"
              required
              maxLength={100}
              value={dados.nome}
              onChange={(e) => alterar('nome', e.target.value)}
              autoComplete="name"
              disabled={ocupado}
            />
          </label>
          <label>
            E-mail
            <input
              className="campo"
              type="email"
              required
              maxLength={150}
              value={dados.email}
              onChange={(e) => alterar('email', e.target.value)}
              autoComplete="email"
              disabled={ocupado}
            />
          </label>
          <label>
            Nome de usuário
            <input
              className="campo"
              type="text"
              required
              minLength={3}
              maxLength={50}
              value={dados.username}
              onChange={(e) => alterar('username', e.target.value)}
              autoComplete="username"
              disabled={ocupado}
            />
          </label>
          <label>
            Senha inicial
            <input
              className="campo"
              type="password"
              required
              minLength={8}
              value={dados.senha}
              onChange={(e) => alterar('senha', e.target.value)}
              autoComplete="new-password"
              disabled={ocupado}
            />
          </label>
        </div>
      </section>

      <section className="gestao-formulario__grupo">
        <header>
          <h3>Vínculo acadêmico</h3>
          <p>Professores podem atuar em vários cursos; a coordenação fica vinculada a um só.</p>
        </header>
        <div className="gestao-campos">
          {cursoIdInicial ? (
            <label>
              Curso vinculado
              <input
                className="campo"
                value={(() => {
                  const encontrado = cursosVinculados.find(
                    (c) => String(c.id) === String(cursoIdInicial),
                  )
                  return encontrado
                    ? encontrado.nome || encontrado.sigla
                    : `Curso ${cursoIdInicial}`
                })()}
                readOnly
              />
            </label>
          ) : cursosVinculados.length ? (
            <label className="gestao-campo-largo">
              Cursos de atuação
              <select
                className="campo"
                multiple
                size={Math.min(Math.max(cursosVinculados.length, 3), 6)}
                value={dados.cursoIds}
                onChange={(e) => {
                  const cursoIds = Array.from(e.target.selectedOptions, (option) => option.value)
                  mudarDados((atual) => ({ ...atual, cursoIds, cursoId: cursoIds[0] || '' }))
                  mudarErroVinculo('')
                }}
                required
                disabled={ocupado}
                aria-describedby="ajuda-cursos-professor"
              >
                {cursosVinculados.map((curso) => (
                  <option key={curso.id} value={String(curso.id)}>
                    {curso.nome || curso.sigla || `Curso ${curso.id}`}
                  </option>
                ))}
              </select>
              <small id="ajuda-cursos-professor" className="gestao-campo-ajuda">
                Para coordenar, selecione somente um curso.
              </small>
            </label>
          ) : (
            <label>
              ID numérico do curso
              <input
                className="campo"
                type="number"
                required
                min={1}
                value={dados.cursoId}
                onChange={(e) => {
                  const valor = e.target.value
                  mudarDados((atual) => ({
                    ...atual,
                    cursoId: valor,
                    cursoIds: valor ? [valor] : [],
                  }))
                  mudarErroVinculo('')
                }}
                disabled={ocupado}
              />
            </label>
          )}
          <label>
            Papel no curso
            <select
              className="campo"
              value={dados.tipoUsuario}
              onChange={(e) => alterar('tipoUsuario', e.target.value)}
              disabled={ocupado || Boolean(cursoIdInicial)}
            >
              <option value="PROFESSOR">Professor</option>
              <option value="COORDENADOR">Coordenador do curso</option>
            </select>
          </label>
        </div>
      </section>

      <section className="gestao-formulario__grupo">
        <header>
          <h3>Perfil profissional</h3>
          <p>Apresentação que ficará associada ao cadastro docente.</p>
        </header>
        <div className="gestao-campos">
          <label>
            Titulação
            <select
              className="campo"
              value={dados.titulacao}
              onChange={(e) => alterar('titulacao', e.target.value)}
              disabled={ocupado}
            >
              {['GRADUACAO', 'ESPECIALIZACAO', 'MESTRADO', 'DOUTORADO', 'POS_DOUTORADO'].map(
                (valor) => (
                  <option key={valor} value={valor}>
                    {
                      {
                        GRADUACAO: 'Graduação',
                        ESPECIALIZACAO: 'Especialização',
                        MESTRADO: 'Mestrado',
                        DOUTORADO: 'Doutorado',
                        POS_DOUTORADO: 'Pós-doutorado',
                      }[valor]
                    }
                  </option>
                ),
              )}
            </select>
          </label>
          <label className="gestao-campo-largo">
            Apresentação
            <textarea
              className="campo"
              required
              maxLength={500}
              rows={3}
              value={dados.descricao}
              onChange={(e) => alterar('descricao', e.target.value)}
              disabled={ocupado}
            />
          </label>
        </div>
      </section>

      {(erro || erroVinculo) && (
        <p className="gestao-aviso" role="alert">
          {erroVinculo || erro}
        </p>
      )}
      <div className="gestao-acoes">
        <button type="submit" className="botao-primario" disabled={ocupado}>
          {ocupado ? 'Cadastrando…' : 'Cadastrar professor'}
        </button>
        <button type="button" className="botao-secundario" onClick={aoCancelar} disabled={ocupado}>
          Cancelar
        </button>
      </div>
    </form>
  )
}
