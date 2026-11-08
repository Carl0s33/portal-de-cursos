import { ErroApi, pegarBaseApi, chamarApi } from './cliente.js'

export const VERSAO = ''

export async function listarUsuarios(token, sinal) {
  const base = pegarBaseApi('usuarios', VERSAO)
  return chamarApi(`${base}/admin`, {
    metodo: 'GET',
    token,
    sinal,
  })
}

export async function buscarUsuarios(token, filtros = {}, sinal) {
  const base = pegarBaseApi('usuarios', VERSAO)
  const parametros = new URLSearchParams()
  if (filtros.nome?.trim()) parametros.set('nome', filtros.nome.trim())
  const query = parametros.size ? `?${parametros}` : ''
  return chamarApi(`${base}/admin/buscar${query}`, { metodo: 'GET', token, sinal })
}

export async function buscarUsuarioPorId(token, id, sinal) {
  const base = pegarBaseApi('usuarios', VERSAO)
  return chamarApi(`${base}/admin/${encodeURIComponent(id)}`, {
    metodo: 'GET',
    token,
    sinal,
  })
}

export async function cadastrarUsuario(dados, sinal) {
  const base = pegarBaseApi('usuarios', VERSAO)
  return chamarApi(`${base}/admin`, { metodo: 'POST', corpo: dados, sinal })
}

export async function atualizarUsuario(token, id, dados, sinal) {
  const base = pegarBaseApi('usuarios', VERSAO)
  return chamarApi(`${base}/admin/${encodeURIComponent(id)}`, {
    metodo: 'PUT',
    corpo: dados,
    token,
    sinal,
  })
}

export async function atualizarMeuUsuario(token, dados, sinal) {
  const base = pegarBaseApi('usuarios', VERSAO)
  return chamarApi(`${base}/admin/me`, {
    metodo: 'PUT',
    corpo: dados,
    token,
    sinal,
  })
}

export async function excluirUsuario(token, id, sinal) {
  const base = pegarBaseApi('usuarios', VERSAO)
  return chamarApi(`${base}/admin/${encodeURIComponent(id)}`, {
    metodo: 'DELETE',
    token,
    sinal,
  })
}

export async function identificarConta(token, email, sinal) {
  const base = pegarBaseApi('usuarios', VERSAO)
  const corresponde = (conta) =>
    typeof conta?.email === 'string' && conta.email.toLowerCase() === email.toLowerCase()

  // Consulta lista de professores para saber se a conta é de professor ou coordenador
  let listaProfessores
  try {
    listaProfessores = await chamarApi(`${base}/professores/buscar`, {
      metodo: 'GET',
      token,
      sinal,
    })
  } catch (falhaProf) {
    if (falhaProf.status === 401 || falhaProf.status === 403) {
      throw falhaProf
    }
  }

  if (Array.isArray(listaProfessores)) {
    const professor = listaProfessores.find(
      (item) =>
        corresponde(item.usuario) &&
        ['PROFESSOR', 'COORDENADOR'].includes(item.usuario?.tipoUsuario),
    )
    if (professor) {
      const cursoId = professor.cursoId
      return {
        tipoUsuario: professor.usuario.tipoUsuario,
        usuario: {
          id: professor.usuario.id,
          professorId: professor.id,
          cursoId,
          nome: professor.usuario.nome || email,
          email: professor.usuario.email,
          titulacao: professor.titulacao || '',
          descricao: professor.descricao || '',
        },
      }
    }
  }

  // Tenta consultar admin
  let listaUsuarios
  try {
    listaUsuarios = await chamarApi(`${base}/admin`, {
      metodo: 'GET',
      token,
      sinal,
    })
  } catch (falha) {
    if (falha.status === 401 || falha.status === 403) {
      // Ignora e tenta perfil de aluno abaixo
    }
  }

  if (Array.isArray(listaUsuarios)) {
    const admin = listaUsuarios.find(corresponde)
    if (admin?.tipoUsuario === 'ADMIN') {
      return {
        tipoUsuario: 'ADMIN',
        usuario: {
          id: admin.id,
          nome: admin.nome || email,
          email: admin.email,
        },
      }
    }
  }

  // Tenta aluno
  try {
    const perfilAluno = await identificarAluno(token, email, sinal)
    if (perfilAluno) return perfilAluno
  } catch {
    // Aluno não encontrado
  }

  throw new ErroApi('Esta conta não possui perfil correspondente cadastrado.', {
    status: 403,
  })
}

export async function identificarAluno(token, email, sinal) {
  const base = pegarBaseApi('usuarios', VERSAO)
  const alunos = await chamarApi(`${base}/alunos/buscar`, {
    metodo: 'GET',
    token,
    sinal,
  })
  const aluno = Array.isArray(alunos)
    ? alunos.find(
        (item) =>
          typeof item.usuario?.email === 'string' &&
          item.usuario.email.toLowerCase() === email.toLowerCase(),
      )
    : null
  if (!aluno) {
    throw new ErroApi('Não foi possível localizar o perfil de aluno desta conta.', { status: 404 })
  }
  return {
    tipoUsuario: 'ALUNO',
    usuario: {
      id: aluno.usuario.id,
      alunoId: aluno.id,
      cursoId: aluno.cursoId,
      nome: aluno.usuario.nome || email,
      email: aluno.usuario.email,
    },
  }
}

export const moduloUsuarios = {
  versao: VERSAO,
  listarUsuarios,
  buscar: buscarUsuarios,
  obterPorId: buscarUsuarioPorId,
  cadastrar: cadastrarUsuario,
  atualizar: atualizarUsuario,
  atualizarMeuUsuario,
  excluir: excluirUsuario,
  identificarConta,
  identificarAluno,
}

export default moduloUsuarios
