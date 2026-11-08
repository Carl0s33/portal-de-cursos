import { Fragment, useCallback, useEffect, useState } from 'react'
import {
  atualizarCurso,
  cadastrarCurso,
  excluirCurso,
  listarAreasConhecimento,
  listarCampus,
  listarCursos,
} from '@/api/cursos.js'
import {
  atualizarDisciplina,
  cadastrarDisciplina,
  excluirDisciplina,
  listarDisciplinasPorCurso,
} from '@/api/disciplinas.js'
import { listarAlunos } from '@/api/alunos.js'
import {
  atualizarProjeto,
  cadastrarProjeto,
  excluirProjeto,
  listarProjetos,
} from '@/api/projetos.js'
import { listarProfessores } from '../servicos/gerenciarProfessores.js'
import ConfirmacaoGestao from './ConfirmacaoGestao.jsx'
import EditorConteudo from './conteudos/EditorConteudo.jsx'
import { configuracoes } from './conteudos/configuracoes.js'
import '../estilos/gestao.css'
import '../estilos/geral.css'

export default function GestaoConteudos({
  dominio,
  itens,
  aoAlterar,
  cursoId,
  restritoAoCurso = false,
  curso,
  cursos = [],
  disciplinas = [],
  somenteEdicao = false,
  token,
}) {
  const configuracao = configuracoes[dominio]
  const [busca, mudarBusca] = useState('')
  const [cursoFiltro, mudarCursoFiltro] = useState('todos')
  const [editor, mudarEditor] = useState(null)
  const [exclusao, mudarExclusao] = useState(null)
  const [mensagem, mudarMensagem] = useState('')
  const [professores, mudarProfessores] = useState([])
  const [alunos, mudarAlunos] = useState([])
  const [registrosApi, mudarRegistrosApi] = useState([])
  const [cursosApi, mudarCursosApi] = useState([])
  const [disciplinasApi, mudarDisciplinasApi] = useState([])
  const [campus, mudarCampus] = useState([])
  const [areas, mudarAreas] = useState([])
  const [carregando, mudarCarregando] = useState(
    ['cursos', 'disciplinas', 'projetos'].includes(dominio),
  )
  const [salvando, mudarSalvando] = useState(false)
  const persistido = ['cursos', 'disciplinas', 'projetos'].includes(dominio)
  const carregarPersistidos = useCallback(
    async (sinal) => {
      mudarCarregando(true)
      if (restritoAoCurso && !cursoId) {
        mudarRegistrosApi([])
        mudarCursosApi([])
        mudarDisciplinasApi([])
        mudarMensagem(
          'Não foi possível identificar seu curso. Entre novamente para carregar seu vínculo.',
        )
        mudarCarregando(false)
        return
      }
      try {
        if (dominio === 'cursos') {
          const [lista, listaCampus, listaAreas] = await Promise.all([
            listarCursos(sinal),
            listarCampus(sinal),
            listarAreasConhecimento(sinal),
          ])
          mudarRegistrosApi(lista)
          mudarCursosApi(lista)
          mudarCampus(listaCampus)
          mudarAreas(listaAreas)
        } else if (dominio === 'disciplinas') {
          const listaCursos = (await listarCursos(sinal, token)).filter(
            (item) => !cursoId || String(item.id) === String(cursoId),
          )
          const listas = await Promise.all(
            listaCursos.map((item) => listarDisciplinasPorCurso(item.id, token, sinal)),
          )
          const listaDisciplinas = listas.flat().map((item) => {
            const relacionado = listaCursos.find(
              (cursoItem) => String(cursoItem.id) === String(item.cursoId),
            )
            return {
              ...item,
              curso: relacionado?.sigla || relacionado?.nome,
              cursoNome: relacionado?.nome,
            }
          })
          mudarCursosApi(listaCursos)
          mudarDisciplinasApi(listaDisciplinas)
          mudarRegistrosApi(listaDisciplinas)
        } else if (dominio === 'projetos') {
          const [listaProjetos, listaCursos] = await Promise.all([
            listarProjetos(token, sinal),
            listarCursos(sinal, token)
              .then((lista) =>
                lista.filter((item) => !cursoId || String(item.id) === String(cursoId)),
              )
              .catch(() => []),
          ])
          const listasDisciplinas = await Promise.all(
            listaCursos.map((item) =>
              listarDisciplinasPorCurso(item.id, token, sinal).catch(() => []),
            ),
          )
          const mapaCursos = new Map(listaCursos.map((c) => [String(c.id), c]))
          const ROTULOS_TIPO_GESTAO = {
            TCC: 'TCC',
            PROJETO_INTEGRADOR: 'Projeto Integrador',
            PROJETO_PESQUISA: 'Pesquisa',
            PROJETO_EXTENSAO: 'Extensão',
            OUTROS: 'Outros',
          }
          const mapeados = (Array.isArray(listaProjetos) ? listaProjetos : []).map((p) => {
            const infoCurso = mapaCursos.get(String(p.cursoId))
            const tipoBruto = p.tipoProjeto || p.tipo || ''
            return {
              ...p,
              identificador: String(p.id),
              curso:
                infoCurso?.sigla ||
                infoCurso?.acronimo ||
                infoCurso?.nome ||
                (p.cursoId ? `Curso ${p.cursoId}` : ''),
              tipo: ROTULOS_TIPO_GESTAO[tipoBruto] || tipoBruto,
              status: p.statusProjeto || p.status || '',
            }
          })
          mudarCursosApi(listaCursos)
          mudarDisciplinasApi(listasDisciplinas.flat())
          mudarRegistrosApi(mapeados)
        }
      } catch (falha) {
        if (!sinal?.aborted)
          mudarMensagem(falha.message || 'Não foi possível carregar os registros da API.')
      } finally {
        if (!sinal?.aborted) mudarCarregando(false)
      }
    },
    [dominio, token, cursoId, restritoAoCurso],
  )
  useEffect(() => {
    if (!persistido) return
    const controller = new AbortController()
    queueMicrotask(() => carregarPersistidos(controller.signal))
    return () => controller.abort()
  }, [carregarPersistidos, persistido])
  const itensAtuais = persistido ? registrosApi : itens
  const cursosDisponiveis = (persistido || dominio === 'projetos' ? cursosApi : cursos).filter(
    (item) => !cursoId || String(item.id) === String(cursoId),
  )
  const disciplinasDisponiveis = persistido || dominio === 'projetos' ? disciplinasApi : disciplinas
  useEffect(() => {
    if (!['cursos', 'disciplinas', 'projetos'].includes(dominio) || !token) return
    const controller = new AbortController()
    listarProfessores(token, controller.signal)
      .then(mudarProfessores)
      .catch(() => mudarProfessores([]))
    if (dominio === 'projetos') {
      listarAlunos(token, {}, controller.signal)
        .then((registros) =>
          mudarAlunos(
            Array.isArray(registros)
              ? registros.map((aluno) => ({
                  ...aluno.usuario,
                  id: aluno.id,
                  alunoId: aluno.id,
                  cursoId: aluno.cursoId ?? aluno.curso?.id,
                }))
              : [],
          ),
        )
        .catch(() => mudarAlunos([]))
    }
    return () => controller.abort()
  }, [dominio, token])
  const doCurso = (item) => {
    if (!cursoId) return !restritoAoCurso
    if (dominio === 'cursos')
      return [item.id, item.identificador].some(
        (referencia) => String(referencia) === String(cursoId),
      )
    if (String(item.identificadorCurso ?? item.cursoId ?? '') === String(cursoId)) return true
    return Boolean(curso && [curso.sigla, curso.nome].includes(item.curso))
  }
  const itensPermitidos = itensAtuais.filter(doCurso)
  const resultados = itensPermitidos.filter(
    (item) =>
      `${item.nome} ${item.codigo || ''} ${item.sigla || item.curso || ''}`
        .toLocaleLowerCase('pt-BR')
        .includes(busca.trim().toLocaleLowerCase('pt-BR')) &&
      (dominio !== 'disciplinas' ||
        cursoFiltro === 'todos' ||
        String(item.cursoId ?? '') === cursoFiltro),
  )
  async function salvar(dados) {
    if (persistido) {
      mudarSalvando(true)
      mudarMensagem('')
      try {
        const enums = {
          grau: {
            Tecnologia: 'TECNOLOGO',
            Bacharelado: 'BACHARELADO',
            Licenciatura: 'LICENCIATURA',
            Subsequente: 'SUBSEQUENTE',
          },
          modalidade: { Presencial: 'PRESENCIAL', 'A distância': 'EAD', Híbrida: 'HIBRIDO' },
          turno: {
            Matutino: 'MATUTINO',
            Vespertino: 'VESPERTINO',
            Noturno: 'NOTURNO',
            'Matutino e vespertino': 'MATUTINO_VESPERTINO',
          },
        }
        if (dominio === 'cursos') {
          const payload = {
            nome: dados.nome,
            acronimo: dados.sigla,
            grau: enums.grau[dados.grau],
            duracao: dados.duracao,
            turno: enums.turno[dados.turno],
            modalidade: enums.modalidade[dados.modalidade],
            cargaHoraria: Number(dados.cargaHoraria),
            qtdDisciplinasObrigatorias: Number(dados.disciplinasObrigatorias),
            qtdDisciplinasOptativas: Number(dados.disciplinasOptativas),
            descricao: dados.descricao,
            campusId: Number(dados.campusId),
            areaId: Number(dados.areaId),
          }
          if (dados.id) await atualizarCurso(token, dados.id, payload)
          else await cadastrarCurso(token, payload)
        } else if (dominio === 'disciplinas') {
          const payload = {
            cursoId: Number(cursoId || dados.cursoId),
            nome: dados.nome,
            codigo: dados.codigo,
            cargaHoraria: Number(dados.cargaHoraria),
            semestre: dados.semestre,
            descricao: dados.descricao,
            obrigatoria: dados.obrigatoria === 'true' || dados.obrigatoria === true,
          }
          if (dados.id) await atualizarDisciplina(token, dados.id, payload)
          else await cadastrarDisciplina(token, payload)
        } else if (dominio === 'projetos') {
          const cursoSelecionado = cursosDisponiveis.find(
            (c) => String(c.id) === String(dados.cursoId || cursoId),
          )
          const payload = {
            nome: dados.nome,
            resumo: dados.resumo || dados.descricao || '',
            descricao: dados.descricao || dados.resumo || '',
            tipoProjeto: dados.tipoProjeto || dados.tipo || 'TCC',
            cursoId: Number(cursoId || dados.cursoId || cursoSelecionado?.id),
            campusId: Number(cursoSelecionado?.campusId || 1),
          }
          if (dados.id) await atualizarProjeto(dados.id, payload, token)
          else await cadastrarProjeto(payload, token)
        }
        await carregarPersistidos()
        mudarEditor(null)
        mudarMensagem(
          `${configuracao.singular[0].toLocaleUpperCase('pt-BR')}${configuracao.singular.slice(1)} salvo com sucesso.`,
        )
      } catch (falha) {
        mudarMensagem(falha.message || `Não foi possível salvar ${configuracao.singular}.`)
      } finally {
        mudarSalvando(false)
      }
      return
    }
    const alunoPorId = new Map(alunos.map((aluno) => [String(aluno.id), aluno]))
    const professorPorId = new Map(
      professores.map((professor) => [String(professor.id), professor]),
    )
    const orientador = professorPorId.get(String(dados.professorIds?.[0]))
    const coordenador = professorPorId.get(String(dados.coordenadorId))
    const cursoSelecionado = cursos.find(
      (itemCurso) =>
        String(
          ['disciplinas', 'projetos'].includes(dominio)
            ? itemCurso.id
            : itemCurso.identificador || itemCurso.id,
        ) === String(dados.cursoId),
    )
    const autores = (dados.alunoIds || [])
      .map((id) => alunoPorId.get(String(id))?.nome)
      .filter(Boolean)
      .join(', ')
    const registro = {
      ...dados,
      ...(dados.alunoIds?.length ? { autores } : {}),
      ...(orientador ? { orientador: orientador.nome } : {}),
      ...(coordenador ? { coordenador: coordenador.nome } : {}),
      ...(cursoSelecionado
        ? {
            cursoId: cursoSelecionado.id,
            identificadorCurso: cursoSelecionado.identificador || cursoSelecionado.id,
            curso: cursoSelecionado.sigla || cursoSelecionado.nome,
          }
        : {}),
      ...(dados.disciplinaIds
        ? {
            disciplinas: dados.disciplinaIds
              .map(
                (id) =>
                  disciplinas.find(
                    (disciplina) =>
                      String(disciplina.id || disciplina.identificador) === String(id),
                  )?.nome,
              )
              .filter(Boolean),
          }
        : {}),
      ...(dados.professorIds
        ? {
            professores: dados.professorIds
              .map((id) => professorPorId.get(String(id))?.nome)
              .filter(Boolean),
          }
        : {}),
      identificador: dados.identificador || crypto.randomUUID(),
    }
    aoAlterar(
      dados.identificador
        ? itens.map((atual) => (atual.identificador === dados.identificador ? registro : atual))
        : [
            ...itens,
            {
              ...registro,
              ...(curso ? { identificadorCurso: curso.identificador } : cursoId ? { cursoId } : {}),
            },
          ],
    )
    mudarEditor(null)
    mudarMensagem(
      'Projeto salvo nesta sessão. Para guardar depois ou publicar, ainda falta ligar a página ao serviço de projetos.',
    )
  }
  function renderizarEditor(registro) {
    const itemEditor = registro?.novo
      ? null
      : persistido && dominio === 'cursos'
        ? {
            ...registro,
            sigla: registro.acronimo,
            cargaHoraria: String(registro.cargaHorariaValor),
            disciplinasObrigatorias: String(registro.qtdDisciplinasObrigatorias),
            disciplinasOptativas: String(registro.qtdDisciplinasOptativas),
            campusId: String(registro.campusId),
            areaId: String(registro.areaId),
          }
        : dominio === 'projetos'
          ? {
              ...registro,
              cursoId:
                registro.cursoId ??
                cursosApi.find(
                  (itemCurso) =>
                    String(itemCurso.identificador) === String(registro.identificadorCurso),
                )?.id ??
                '',
            }
          : registro
    return (
      <EditorConteudo
        key={registro?.identificador || registro?.id || 'novo'}
        item={itemEditor}
        configuracao={configuracao}
        curso={curso}
        cursoId={cursoId}
        bloquearCurso={Boolean(cursoId)}
        dominio={dominio}
        professores={professores}
        alunos={alunos}
        cursos={cursosDisponiveis}
        disciplinas={disciplinasDisponiveis}
        campus={campus}
        areas={areas}
        salvando={salvando}
        aoSalvar={salvar}
        aoCancelar={() => mudarEditor(null)}
      />
    )
  }
  async function confirmarExclusao() {
    if (salvando || !exclusao) return
    if (persistido) {
      mudarSalvando(true)
      let excluido = false
      try {
        if (dominio === 'cursos') await excluirCurso(token, exclusao.id)
        else if (dominio === 'disciplinas') await excluirDisciplina(token, exclusao.id)
        else if (dominio === 'projetos') await excluirProjeto(exclusao.id, token)
        await carregarPersistidos()
        mudarMensagem('Registro excluído com sucesso.')
        excluido = true
      } catch (falha) {
        mudarMensagem(falha.message || 'Não foi possível excluir o registro.')
      } finally {
        mudarSalvando(false)
        if (excluido) mudarExclusao(null)
      }
      return
    }
    aoAlterar(itens.filter((item) => item.identificador !== exclusao.identificador))
    mudarMensagem('Item removido do rascunho.')
    mudarExclusao(null)
  }
  return (
    <>
      <header className="painel-titulo">
        <div>
          <h1>{configuracao.titulo}</h1>
          <p>{configuracao.descricao}</p>
        </div>
        {!somenteEdicao && (
          <div className="painel-titulo__acoes">
            {persistido && (
              <button
                className="botao-secundario"
                onClick={() => carregarPersistidos()}
                disabled={carregando}
              >
                {carregando ? 'Atualizando…' : 'Atualizar lista'}
              </button>
            )}
            <button
              className="botao-primario"
              onClick={() => {
                mudarEditor((atual) => (atual?.novo ? null : { novo: true }))
                mudarExclusao(null)
                mudarMensagem('')
              }}
              aria-expanded={Boolean(editor?.novo)}
              aria-controls="gestao-editor-novo"
            >
              {editor?.novo
                ? 'Fechar cadastro'
                : dominio === 'disciplinas'
                  ? 'Nova matéria'
                  : `Novo ${configuracao.singular}`}
            </button>
          </div>
        )}
      </header>
      {mensagem && (
        <p className="gestao-aviso" role="status">
          {mensagem}
        </p>
      )}
      {editor?.novo && (
        <div className="gestao-expansao gestao-expansao--novo" id="gestao-editor-novo">
          {renderizarEditor(editor)}
        </div>
      )}
      {dominio === 'cursos' && resultados.length > 0 && (
        <section className="gestao-cursos-resumo" aria-label="Resumo dos cursos">
          {resultados.slice(0, 4).map((curso) => {
            const totalMaterias = Number(
              curso.componentes ??
                Number(curso.disciplinasObrigatorias || curso.qtdDisciplinasObrigatorias || 0) +
                  Number(curso.disciplinasOptativas || curso.qtdDisciplinasOptativas || 0),
            )

            return (
              <article className="cartao curso-gestao" key={curso.identificador || curso.id}>
                <header className="curso-gestao__topo">
                  <span className="curso-gestao__sigla">
                    {curso.sigla || curso.acronimo || 'CURSO'}
                  </span>
                  {curso.grau && <span className="curso-gestao__grau">{curso.grau}</span>}
                </header>
                <h3 className="curso-gestao__titulo">{curso.nome}</h3>
                {(curso.grau || curso.turno || curso.modalidade || curso.campus) && (
                  <p className="curso-gestao__meta">
                    {[curso.turno, curso.modalidade, curso.campus].filter(Boolean).join(' · ')}
                  </p>
                )}
                <dl className="curso-gestao__metricas">
                  {curso.cargaHoraria && (
                    <div>
                      <dt>Carga horária</dt>
                      <dd>{curso.cargaHoraria}</dd>
                    </div>
                  )}
                  {curso.semestres > 0 && (
                    <div>
                      <dt>Duração</dt>
                      <dd>{curso.semestres} semestres</dd>
                    </div>
                  )}
                  {Number.isFinite(totalMaterias) && totalMaterias > 0 && (
                    <div>
                      <dt>Matérias</dt>
                      <dd>{totalMaterias}</dd>
                    </div>
                  )}
                </dl>
              </article>
            )
          })}
        </section>
      )}
      <section className="painel-secao">
        <div className="gestao-lista-filtros">
          <label className="gestao-busca">
            Buscar {configuracao.singular}
            <input
              type="search"
              placeholder={dominio === 'disciplinas' ? 'Nome ou código' : 'Nome ou curso'}
              value={busca}
              onChange={(e) => mudarBusca(e.target.value)}
            />
          </label>
          {dominio === 'disciplinas' && !restritoAoCurso && !cursoId && (
            <div
              className="gestao-filtro-cursos"
              role="group"
              aria-label="Filtrar disciplinas por curso"
            >
              <button
                type="button"
                aria-pressed={cursoFiltro === 'todos'}
                onClick={() => mudarCursoFiltro('todos')}
              >
                Todas <span>{itensPermitidos.length}</span>
              </button>
              {cursosDisponiveis.map((cursoItem) => {
                const total = itensPermitidos.filter(
                  (item) => String(item.cursoId ?? '') === String(cursoItem.id),
                ).length
                return (
                  <button
                    type="button"
                    key={cursoItem.id}
                    aria-pressed={cursoFiltro === String(cursoItem.id)}
                    onClick={() => mudarCursoFiltro(String(cursoItem.id))}
                  >
                    {cursoItem.sigla || cursoItem.acronimo || cursoItem.nome} <span>{total}</span>
                  </button>
                )
              })}
            </div>
          )}
        </div>
        <div
          className="tabela-submissoes"
          role="region"
          aria-label={configuracao.titulo}
          tabIndex={0}
        >
          <table>
            <thead>
              <tr>
                {dominio === 'cursos' ? (
                  <>
                    <th scope="col">Curso</th>
                    <th scope="col">Grau</th>
                    <th scope="col">Turno</th>
                    <th scope="col">Modalidade</th>
                    <th scope="col">Carga horária</th>
                    <th scope="col">Disciplinas</th>
                  </>
                ) : dominio === 'disciplinas' ? (
                  <>
                    <th scope="col">Disciplina</th>
                    <th scope="col">Curso</th>
                    <th scope="col">Semestre</th>
                    <th scope="col">Carga horária</th>
                    <th scope="col">Tipo</th>
                  </>
                ) : (
                  <>
                    <th scope="col">{dominio === 'disciplinas' ? 'Matéria' : 'Projeto'}</th>
                    <th scope="col">{dominio === 'disciplinas' ? 'Código' : 'Tipo'}</th>
                    <th scope="col">{dominio === 'disciplinas' ? 'Semestre' : 'Status'}</th>
                  </>
                )}
                <th scope="col">Ações</th>
              </tr>
            </thead>
            <tbody>
              {resultados.map((item) => {
                const chaveItem = String(item.identificador || item.id)
                const expandidoId = `gestao-expansao-${dominio}-${chaveItem}`
                const editando =
                  editor && !editor.novo && String(editor.identificador || editor.id) === chaveItem
                const confirmando =
                  exclusao && String(exclusao.identificador || exclusao.id) === chaveItem
                const tituloExclusao = `titulo-excluir-${dominio}-${chaveItem.replace(/[^a-z0-9_-]/gi, '-')}`
                const colunasTabela = dominio === 'cursos' ? 7 : dominio === 'disciplinas' ? 6 : 4
                return (
                  <Fragment key={chaveItem}>
                    <tr>
                      <th scope="row">
                        {dominio === 'disciplinas' ? (
                          <>
                            <span className="gestao-codigo">{item.codigo || '—'}</span>
                            <span>{item.nome}</span>
                          </>
                        ) : (
                          <>
                            {item.nome}
                            <span>
                              {dominio === 'cursos'
                                ? [item.sigla || item.acronimo, item.campus]
                                    .filter(Boolean)
                                    .join(' · ')
                                : item.sigla || item.curso}
                            </span>
                          </>
                        )}
                      </th>
                      {dominio === 'cursos' ? (
                        <>
                          <td>{item.grau || '—'}</td>
                          <td>{item.turno || '—'}</td>
                          <td>{item.modalidade || '—'}</td>
                          <td>{item.cargaHoraria || '—'}</td>
                          <td>{item.componentes ?? '—'}</td>
                        </>
                      ) : dominio === 'disciplinas' ? (
                        <>
                          <td>{item.curso || item.cursoNome || '—'}</td>
                          <td>
                            {item.semestreNumero ? `${item.semestreNumero}º` : item.semestre || '—'}
                          </td>
                          <td>{item.cargaHoraria ? `${item.cargaHoraria} h` : '—'}</td>
                          <td>
                            <span
                              className={`gestao-tipo-disciplina ${item.obrigatoria ? 'gestao-tipo-disciplina--obrigatoria' : ''}`}
                            >
                              {item.obrigatoria ? 'Obrigatória' : 'Optativa'}
                            </span>
                          </td>
                        </>
                      ) : (
                        <>
                          <td>{item.codigo || item.tipo || '—'}</td>
                          <td>
                            {item.semestreNumero
                              ? `${item.semestreNumero}º semestre`
                              : item.status || '—'}
                          </td>
                        </>
                      )}
                      <td>
                        <div className="gestao-acoes">
                          <button
                            aria-expanded={Boolean(editando)}
                            aria-controls={expandidoId}
                            onClick={() => {
                              mudarEditor(editando ? null : item)
                              mudarExclusao(null)
                              mudarMensagem('')
                            }}
                          >
                            Editar<span className="somente-leitores"> {item.nome}</span>
                          </button>
                          {!somenteEdicao && (
                            <button
                              className="gestao-excluir"
                              aria-expanded={Boolean(confirmando)}
                              aria-controls={expandidoId}
                              onClick={() => {
                                mudarExclusao(confirmando ? null : item)
                                mudarEditor(null)
                              }}
                            >
                              Remover<span className="somente-leitores"> {item.nome}</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                    {editando && (
                      <tr className="gestao-linha-expandida">
                        <td colSpan={colunasTabela} id={expandidoId}>
                          {renderizarEditor(editor)}
                        </td>
                      </tr>
                    )}
                    {confirmando && (
                      <tr className="gestao-linha-expandida">
                        <td colSpan={colunasTabela} id={expandidoId}>
                          <ConfirmacaoGestao rotulo={tituloExclusao}>
                            <h2 id={tituloExclusao}>
                              {persistido ? 'Excluir' : 'Remover'} {exclusao.nome}?
                            </h2>
                            <p>
                              {persistido
                                ? 'Este registro será excluído. Essa ação não pode ser desfeita.'
                                : 'Este item será removido dos rascunhos desta sessão.'}
                            </p>
                            {mensagem && <p role="alert">{mensagem}</p>}
                            <div className="gestao-acoes">
                              <button
                                className="botao-secundario"
                                onClick={() => {
                                  mudarExclusao(null)
                                  mudarMensagem('')
                                }}
                                disabled={salvando}
                              >
                                Manter {configuracao.singular}
                              </button>
                              <button
                                className="gestao-excluir"
                                onClick={confirmarExclusao}
                                disabled={salvando}
                              >
                                {salvando ? 'Excluindo…' : 'Confirmar exclusão'}
                              </button>
                            </div>
                          </ConfirmacaoGestao>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                )
              })}
            </tbody>
          </table>
        </div>
        {carregando && (
          <p className="gestao-aviso" role="status">
            Carregando registros do serviço…
          </p>
        )}
        {!carregando && !resultados.length && (
          <p className="painel-vazio">
            Nenhum registro encontrado.{' '}
            {busca ? 'Tente outro termo.' : `Cadastre um ${configuracao.singular} para começar.`}
          </p>
        )}
      </section>
    </>
  )
}
