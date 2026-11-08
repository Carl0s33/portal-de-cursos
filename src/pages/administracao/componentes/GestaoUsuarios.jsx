import { useEffect, useMemo, useRef, useState } from 'react'
import { excluirUsuario, listarUsuarios } from '@/api/usuarios.js'
import { listarCursos } from '@/api/cursos.js'
import { excluirAluno, listarAlunos } from '@/api/alunos.js'
import { excluirCoordenador, listarCoordenadores } from '@/api/coordenadores.js'
import { excluirProfessor, listarProfessores } from '../servicos/gerenciarProfessores.js'
import '../estilos/gestao.css'
import '../estilos/usuarios.css'
import '../estilos/geral.css'

export default function GestaoUsuarios({ token, emailAtual }) {
  const [consulta, mudarConsulta] = useState({ estado: 'carregando', itens: [], erro: '' })
  const dialogoExclusao = useRef(null)
  const [contaSelecionada, mudarContaSelecionada] = useState(null)
  const [excluindo, mudarExcluindo] = useState(false)
  const [erroExclusao, mudarErroExclusao] = useState('')
  const [busca, mudarBusca] = useState('')
  const [papel, mudarPapel] = useState('todos')
  const [curso, mudarCurso] = useState('todos')
  const [tentativa, mudarTentativa] = useState(0)
  const [cursosDados, mudarCursosDados] = useState([])

  useEffect(() => {
    const controle = new AbortController()
    listarCursos(controle.signal)
      .then(mudarCursosDados)
      .catch(() => mudarCursosDados([]))
    return () => controle.abort()
  }, [])

  useEffect(() => {
    const controle = new AbortController()
    Promise.all([
      listarUsuarios(token, controle.signal),
      listarProfessores(token, controle.signal).catch(() => []),
    ])
      .then(([itens, professores]) => {
        if (!controle.signal.aborted) {
          const cursosPorEmail = new Map(professores.map((p) => [p.email.toLowerCase(), p.cursoId]))
          const contas = Array.isArray(itens)
            ? itens.map((item) => ({
                ...item,
                cursoId: item.cursoId ?? cursosPorEmail.get(item.email?.toLowerCase()),
              }))
            : null
          mudarConsulta(
            contas
              ? { estado: 'pronto', itens: contas, erro: '' }
              : { estado: 'erro', itens: [], erro: 'A lista de contas recebida é inválida.' },
          )
        }
      })
      .catch((erro) => {
        if (!controle.signal.aborted) {
          mudarConsulta({ estado: 'erro', itens: [], erro: erro.message })
        }
      })
    return () => controle.abort()
  }, [tentativa, token])

  const filtrados = useMemo(
    () =>
      consulta.itens.filter((item) => {
        const termo = `${item.nome || ''} ${item.email || ''} ${item.username || ''} ${item.tipoUsuario || ''}`
        const cursoId = item.cursoId ?? item.professor?.cursoId ?? ''
        return (
          termo.toLocaleLowerCase('pt-BR').includes(busca.trim().toLocaleLowerCase('pt-BR')) &&
          (papel === 'todos' || item.tipoUsuario === papel) &&
          (curso === 'todos' || String(cursoId) === curso)
        )
      }),
    [busca, consulta.itens, papel, curso],
  )
  const cursos = [...new Set(consulta.itens.map((item) => item.cursoId).filter(Boolean))]
  const tiposUsuario = ['ADMIN', 'COORDENADOR', 'PROFESSOR', 'ALUNO']
  const acessoDisponivel = consulta.itens.some(
    (item) => item.status !== undefined || item.ativo !== undefined || item.bloqueado !== undefined,
  )
  const rotuloTipo = (tipo) =>
    ({
      ADMIN: 'Administrador',
      COORDENADOR: 'Coordenador',
      PROFESSOR: 'Professor',
      ALUNO: 'Aluno',
    })[tipo] ||
    tipo ||
    'Não informado'

  useEffect(() => {
    const dialogo = dialogoExclusao.current
    if (contaSelecionada && !dialogo.open) dialogo.showModal()
    if (!contaSelecionada && dialogo.open) dialogo.close()
  }, [contaSelecionada])

  async function aoExcluirConta(item) {
    if (
      excluindo ||
      !item.id ||
      !item.email ||
      item.email?.toLowerCase() === emailAtual?.toLowerCase()
    )
      return

    mudarExcluindo(true)
    mudarErroExclusao('')
    const mesmoEmail = (email) => email?.toLowerCase() === item.email.toLowerCase()
    try {
      if (item.tipoUsuario === 'ALUNO') {
        const alunos = await listarAlunos(token)
        const aluno = alunos.find((registro) => registro.usuario?.id === item.id)
        if (!aluno?.id) throw new Error('Cadastro de aluno não encontrado.')
        await excluirAluno(token, aluno.id)
      } else if (['PROFESSOR', 'COORDENADOR'].includes(item.tipoUsuario)) {
        const [professores, coordenadores] = await Promise.all([
          listarProfessores(token),
          listarCoordenadores(token),
        ])
        const professor = professores.find((registro) => mesmoEmail(registro.email))
        if (!professor?.id) throw new Error('Cadastro de professor não encontrado.')
        const vinculo = coordenadores.find((registro) => registro.professor?.id === professor.id)
        if (vinculo?.id) await excluirCoordenador(token, vinculo.id)
        await excluirProfessor(token, professor.id)
      } else if (item.tipoUsuario === 'ADMIN') {
        await excluirUsuario(token, item.id)
      } else {
        throw new Error('O tipo desta conta não foi reconhecido.')
      }
      mudarContaSelecionada(null)
      mudarConsulta((atual) => ({
        ...atual,
        itens: atual.itens.filter((conta) => conta.id !== item.id),
      }))
    } catch (falha) {
      mudarErroExclusao(falha.message || 'Não foi possível excluir a conta.')
    } finally {
      mudarExcluindo(false)
    }
  }
  return (
    <>
      <header className="painel-titulo">
        <div>
          <h1>Todos os usuários</h1>
          <p>Administradores, coordenadores, professores e alunos.</p>
        </div>
      </header>
      {consulta.estado === 'carregando' && <p role="status">Carregando contas…</p>}
      {consulta.estado === 'erro' && (
        <div className="gestao-aviso" role="alert">
          <p>{consulta.erro}</p>
          <button
            className="botao-secundario"
            type="button"
            onClick={() => {
              mudarConsulta({ estado: 'carregando', itens: [], erro: '' })
              mudarTentativa((valor) => valor + 1)
            }}
          >
            Tentar novamente
          </button>
        </div>
      )}
      {consulta.estado === 'pronto' && (
        <section className="painel-secao">
          <div className="gestao-filtros">
            <label className="gestao-busca">
              Buscar usuário
              <input
                type="search"
                value={busca}
                onChange={(evento) => mudarBusca(evento.target.value)}
                placeholder="Nome ou e-mail"
              />
            </label>
            <div className="gestao-papeis" role="group" aria-label="Filtrar por papel">
              <button
                type="button"
                data-papel="todos"
                aria-pressed={papel === 'todos'}
                onClick={() => mudarPapel('todos')}
              >
                Todos <span>{consulta.itens.length}</span>
              </button>
              {tiposUsuario.map((tipo) => (
                <button
                  type="button"
                  key={tipo}
                  data-papel={tipo.toLowerCase()}
                  aria-pressed={papel === tipo}
                  onClick={() => mudarPapel(tipo)}
                >
                  {rotuloTipo(tipo)}{' '}
                  <span>{consulta.itens.filter((item) => item.tipoUsuario === tipo).length}</span>
                </button>
              ))}
            </div>
            <label className="gestao-busca">
              Curso
              <select value={curso} onChange={(evento) => mudarCurso(evento.target.value)}>
                <option value="todos">Todos os cursos</option>
                {cursos.map((cursoId) => (
                  <option key={cursoId} value={String(cursoId)}>
                    {cursosDados.find((item) => String(item.id) === String(cursoId))?.sigla ||
                      cursosDados.find((item) => String(item.id) === String(cursoId))?.nome ||
                      String(cursoId)}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div
            className="tabela-container"
            role="region"
            aria-label="Contas do portal"
            tabIndex={0}
          >
            <table className="tabela">
              <thead>
                <tr>
                  <th scope="col">Pessoa</th>
                  <th scope="col">Papel</th>
                  <th scope="col">Curso</th>
                  {acessoDisponivel && <th scope="col">Acesso</th>}
                  <th scope="col">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filtrados.map((item) => (
                  <tr key={item.id || item.email}>
                    <th scope="row">
                      <span className="usuario-identificacao__nome">{item.nome || 'Sem nome'}</span>
                      <span className="usuario-identificacao__email">{item.email}</span>
                    </th>
                    <td>
                      <span
                        className={`status usuario-papel usuario-papel--${String(item.tipoUsuario || '').toLowerCase()}`}
                      >
                        {rotuloTipo(item.tipoUsuario)}
                      </span>
                    </td>
                    <td>
                      {cursosDados.find(
                        (cursoItem) => String(cursoItem.id) === String(item.cursoId),
                      )?.sigla ||
                        item.cursoId ||
                        '—'}
                    </td>
                    {acessoDisponivel &&
                      (() => {
                        const acesso =
                          item.status ??
                          (item.bloqueado === true
                            ? 'Bloqueado'
                            : item.ativo === true
                              ? 'Ativo'
                              : item.ativo === false
                                ? 'Inativo'
                                : '—')
                        const normalizado = String(acesso).toLocaleLowerCase('pt-BR')
                        const classe = normalizado.includes('bloque')
                          ? 'bloqueado'
                          : normalizado.includes('inativ')
                            ? 'inativo'
                            : normalizado.includes('ativ')
                              ? 'ativo'
                              : 'indefinido'
                        return (
                          <td>
                            <span className={`usuario-acesso usuario-acesso--${classe}`}>
                              <span aria-hidden="true" />
                              {String(acesso)}
                            </span>
                          </td>
                        )
                      })()}
                    <td>
                      <button
                        className="gestao-excluir usuario-excluir"
                        type="button"
                        disabled={
                          excluindo ||
                          !item.id ||
                          !item.email ||
                          item.email?.toLowerCase() === emailAtual?.toLowerCase()
                        }
                        aria-label={`Excluir conta de ${item.nome || item.email}`}
                        onClick={() => {
                          mudarErroExclusao('')
                          mudarContaSelecionada(item)
                        }}
                      >
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.7"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 11v5m4-5v5" />
                        </svg>
                        Excluir conta
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!filtrados.length && <p className="painel-vazio">Nenhuma conta encontrada.</p>}
        </section>
      )}
      <dialog
        ref={dialogoExclusao}
        className="usuario-dialogo-exclusao"
        aria-labelledby="usuario-exclusao-titulo"
        aria-describedby="usuario-exclusao-descricao"
        onCancel={(evento) => {
          evento.preventDefault()
          if (!excluindo) mudarContaSelecionada(null)
        }}
      >
        <h2 id="usuario-exclusao-titulo">Excluir conta?</h2>
        <p id="usuario-exclusao-descricao">
          A pessoa perderá o acesso ao portal. Essa ação é permanente.
        </p>
        <div className="usuario-dialogo-exclusao__conta">
          <strong>{contaSelecionada?.nome || 'Conta do portal'}</strong>
          <span>{contaSelecionada?.email}</span>
        </div>
        {erroExclusao && <p role="alert">{erroExclusao}</p>}
        <div className="usuario-dialogo-exclusao__acoes">
          <button
            className="botao-secundario"
            type="button"
            autoFocus
            disabled={excluindo}
            onClick={() => mudarContaSelecionada(null)}
          >
            Cancelar
          </button>
          <button
            className="gestao-excluir"
            type="button"
            disabled={excluindo}
            onClick={() => aoExcluirConta(contaSelecionada)}
          >
            {excluindo ? 'Excluindo…' : 'Excluir conta'}
          </button>
        </div>
      </dialog>
      <p className="gestao-nota">
        A lista reúne as contas cadastradas e os vínculos docentes disponíveis no serviço.
      </p>
    </>
  )
}
