import { useEffect, useMemo, useState } from 'react'
import { consultarUsuarios } from '@/api/usuarios.js'
import { listarCursos } from '@/api/cursos.js'
import { listarProfessores } from '../services/gerenciarProfessores.js'
import '../estilos/gestao.css'
import '../estilos/usuarios.css'
import '../estilos/geral.css'

export default function GestaoUsuarios({ token }) {
  const [consulta, definirConsulta] = useState({ estado: 'carregando', itens: [], erro: '' })
  const [busca, definirBusca] = useState('')
  const [papel, definirPapel] = useState('todos')
  const [curso, definirCurso] = useState('todos')
  const [tentativa, definirTentativa] = useState(0)
  const [cursosDados, definirCursosDados] = useState([])

  useEffect(() => {
    const controle = new AbortController()
    listarCursos(controle.signal)
      .then(definirCursosDados)
      .catch(() => definirCursosDados([]))
    return () => controle.abort()
  }, [])

  useEffect(() => {
    const controle = new AbortController()
    Promise.all([
      consultarUsuarios(token, controle.signal),
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
          definirConsulta(
            contas
              ? { estado: 'pronto', itens: contas, erro: '' }
              : { estado: 'erro', itens: [], erro: 'A lista de contas recebida é inválida.' },
          )
        }
      })
      .catch((erro) => {
        if (!controle.signal.aborted) {
          definirConsulta({ estado: 'erro', itens: [], erro: erro.message })
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
              definirConsulta({ estado: 'carregando', itens: [], erro: '' })
              definirTentativa((valor) => valor + 1)
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
                onChange={(evento) => definirBusca(evento.target.value)}
                placeholder="Nome ou e-mail"
              />
            </label>
            <div className="gestao-papeis" role="group" aria-label="Filtrar por papel">
              <button
                type="button"
                data-papel="todos"
                aria-pressed={papel === 'todos'}
                onClick={() => definirPapel('todos')}
              >
                Todos <span>{consulta.itens.length}</span>
              </button>
              {tiposUsuario.map((tipo) => (
                <button
                  type="button"
                  key={tipo}
                  data-papel={tipo.toLowerCase()}
                  aria-pressed={papel === tipo}
                  onClick={() => definirPapel(tipo)}
                >
                  {rotuloTipo(tipo)}{' '}
                  <span>{consulta.itens.filter((item) => item.tipoUsuario === tipo).length}</span>
                </button>
              ))}
            </div>
            <label className="gestao-busca">
              Curso
              <select value={curso} onChange={(evento) => definirCurso(evento.target.value)}>
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!filtrados.length && <p className="painel-vazio">Nenhuma conta encontrada.</p>}
        </section>
      )}
      <p className="gestao-nota">
        A lista reúne as contas cadastradas e os vínculos docentes disponíveis no serviço.
      </p>
    </>
  )
}
