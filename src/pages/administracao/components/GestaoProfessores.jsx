import EstadoErro from '@/shared/components/EstadoErro.jsx'
import { Fragment, useEffect, useState } from 'react'
import {
  cadastrarProfessor,
  excluirProfessor,
  listarProfessores,
} from '../services/gerenciarProfessores.js'
import { listarCursos } from '@/api/cursos.js'
import FormularioProfessor from './FormularioProfessor.jsx'
import ConfirmacaoGestao from './ConfirmacaoGestao.jsx'
import '../estilos/gestao.css'
import '../estilos/geral.css'

export default function GestaoProfessores({ token, cursoId }) {
  const [consulta, mudarConsulta] = useState({ estado: 'carregando', dados: [], erro: '' })
  const [listaCursos, mudarListaCursos] = useState([])
  const [tentativa, mudarTentativa] = useState(0)
  const [busca, mudarBusca] = useState('')
  const [criando, mudarCriando] = useState(false)
  const [exclusao, mudarExclusao] = useState(null)
  const [ocupado, mudarOcupado] = useState(false)
  const [erro, mudarErro] = useState('')
  const [mensagem, mudarMensagem] = useState('')

  useEffect(() => {
    const controle = new AbortController()

    Promise.allSettled([
      listarProfessores(token, controle.signal),
      listarCursos(controle.signal, token),
    ]).then(([resProfessores, resCursos]) => {
      if (controle.signal.aborted) return

      if (resCursos.status === 'fulfilled' && Array.isArray(resCursos.value)) {
        mudarListaCursos(resCursos.value)
      }

      if (resProfessores.status === 'fulfilled') {
        mudarConsulta({ estado: 'pronto', dados: resProfessores.value, erro: '' })
      } else {
        mudarConsulta({
          estado: 'erro',
          dados: [],
          erro: resProfessores.reason?.message || 'Erro ao carregar professores',
        })
      }
    })

    return () => controle.abort()
  }, [token, tentativa])
  async function salvar(dados) {
    if (ocupado) return
    mudarOcupado(true)
    mudarErro('')
    mudarMensagem('')
    try {
      const professor = await cadastrarProfessor(token, dados)
      mudarConsulta((atual) => ({ ...atual, dados: [...atual.dados, professor] }))
      mudarCriando(false)
      mudarMensagem('Professor cadastrado.')
    } catch (falha) {
      mudarErro(falha.message)
    } finally {
      mudarOcupado(false)
    }
  }
  async function remover() {
    if (ocupado || !exclusao) return
    mudarOcupado(true)
    mudarErro('')
    mudarMensagem('')
    try {
      await excluirProfessor(token, exclusao.id)
      mudarConsulta((atual) => ({
        ...atual,
        dados: atual.dados.filter((item) => item.id !== exclusao.id),
      }))
      mudarExclusao(null)
      mudarMensagem('Professor excluído.')
    } catch (falha) {
      mudarErro(falha.message)
    } finally {
      mudarOcupado(false)
    }
  }
  const mapaCursos = new Map(listaCursos.map((c) => [String(c.id), c]))

  const itens = consulta.dados
    .filter((item) => !cursoId || String(item.cursoId) === String(cursoId))
    .filter((item) =>
      `${item.nome} ${item.email}`
        .toLocaleLowerCase('pt-BR')
        .includes(busca.trim().toLocaleLowerCase('pt-BR')),
    )
  const cursosVinculados =
    listaCursos.length > 0
      ? listaCursos
      : [
          ...new Map(
            consulta.dados
              .filter((item) => item.cursoId)
              .map((item) => [
                String(item.cursoId),
                { id: item.cursoId, nome: `Curso ${item.cursoId}` },
              ]),
          ).values(),
        ]
  return (
    <>
      <header className="painel-titulo">
        <div>
          <h1>Professores</h1>
          <p>
            {cursoId
              ? 'Cadastre e gerencie os professores vinculados ao seu curso.'
              : 'Cadastre docentes e acompanhe os vínculos acadêmicos.'}
          </p>
        </div>
        <button
          className="botao-primario"
          onClick={() => {
            mudarCriando(true)
            mudarErro('')
            mudarExclusao(null)
          }}
          disabled={ocupado || consulta.estado !== 'pronto'}
          aria-expanded={criando}
          aria-controls="cadastro-professor"
        >
          {criando ? 'Fechar cadastro' : 'Novo professor'}
        </button>
      </header>
      {mensagem && (
        <p className="gestao-aviso" role="status">
          {mensagem}
        </p>
      )}
      {criando && (
        <div className="gestao-expansao gestao-expansao--novo" id="cadastro-professor">
          <FormularioProfessor
            aoSalvar={salvar}
            aoCancelar={() => {
              mudarCriando(false)
              mudarErro('')
            }}
            ocupado={ocupado}
            erro={erro}
            cursoIdInicial={cursoId || ''}
            cursosVinculados={cursosVinculados}
          />
        </div>
      )}
      {consulta.estado === 'carregando' && <p role="status">Carregando professores…</p>}
      {consulta.estado === 'erro' && (
        <EstadoErro
          titulo="A lista de professores não foi carregada"
          mensagem={consulta.erro}
          aoTentarNovamente={() => {
            mudarConsulta({ estado: 'carregando', dados: [], erro: '' })
            mudarTentativa((valor) => valor + 1)
          }}
        />
      )}
      {consulta.estado === 'pronto' && (
        <section className="painel-secao">
          <div className="painel__cabecalho gestao-professores__busca">
            <label className="gestao-busca">
              Buscar professor
              <input
                className="campo"
                type="search"
                value={busca}
                onChange={(e) => mudarBusca(e.target.value)}
                placeholder="Nome ou e-mail"
              />
            </label>
            <span className="painel-contagem">
              {itens.length} {itens.length === 1 ? 'professor' : 'professores'}
            </span>
          </div>
          <div
            className="tabela-container"
            role="region"
            aria-label="Professores cadastrados"
            tabIndex={0}
          >
            <table className="tabela">
              <thead>
                <tr>
                  <th scope="col">Professor</th>
                  <th scope="col">Titulação</th>
                  <th scope="col">Curso</th>
                  <th scope="col">Ações</th>
                </tr>
              </thead>
              <tbody>
                {itens.map((item) => (
                  <Fragment key={item.id}>
                    <tr>
                      <th scope="row">
                        <span className="tabela__titulo">{item.nome}</span>
                        <span className="tabela__descricao">{item.email}</span>
                      </th>
                      <td>
                        {{
                          MESTRADO: 'Mestrado',
                          DOUTORADO: 'Doutorado',
                          ESPECIALIZACAO: 'Especialização',
                          GRADUACAO: 'Graduação',
                        }[item.titulacao] || item.titulacao}
                      </td>
                      <td>
                        {(() => {
                          const c = mapaCursos.get(String(item.cursoId))
                          return c
                            ? c.sigla || c.acronimo || c.nome
                            : item.cursoId
                              ? `Curso ${item.cursoId}`
                              : '—'
                        })()}
                      </td>
                      <td>
                        <button
                          className="gestao-excluir"
                          aria-expanded={exclusao?.id === item.id}
                          aria-controls={`excluir-professor-${item.id}`}
                          onClick={() => {
                            mudarExclusao(exclusao?.id === item.id ? null : item)
                            mudarCriando(false)
                            mudarErro('')
                          }}
                          disabled={ocupado}
                        >
                          Excluir<span className="somente-leitores"> {item.nome}</span>
                        </button>
                      </td>
                    </tr>
                    {exclusao?.id === item.id && (
                      <tr className="gestao-linha-expandida">
                        <td colSpan={4} id={`excluir-professor-${item.id}`}>
                          <ConfirmacaoGestao rotulo={`titulo-excluir-professor-${item.id}`}>
                            <h2 id={`titulo-excluir-professor-${item.id}`}>Excluir {item.nome}?</h2>
                            <p>O cadastro será removido. Esta ação não pode ser desfeita.</p>
                            {erro && <p role="alert">{erro}</p>}
                            <div className="gestao-acoes">
                              <button
                                className="botao-secundario"
                                onClick={() => {
                                  mudarExclusao(null)
                                  mudarErro('')
                                }}
                                disabled={ocupado}
                              >
                                Manter professor
                              </button>
                              <button
                                className="gestao-excluir"
                                onClick={remover}
                                disabled={ocupado}
                              >
                                {ocupado ? 'Excluindo…' : 'Confirmar exclusão'}
                              </button>
                            </div>
                          </ConfirmacaoGestao>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
          {!itens.length && (
            <p className="painel-vazio">
              {busca ? 'Nenhum professor encontrado nesta busca.' : 'Nenhum professor cadastrado.'}
            </p>
          )}
        </section>
      )}
      <p className="gestao-nota">
        {cursoId
          ? 'A lista e os cadastros estão limitados ao curso vinculado à coordenação.'
          : 'A edição de dados de professor por administrador depende de liberação no contrato atual da API.'}
      </p>
    </>
  )
}
