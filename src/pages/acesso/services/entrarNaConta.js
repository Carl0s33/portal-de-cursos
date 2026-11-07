import { fazerLogin } from '@/api/autenticacao.js'
import { identificarAluno, identificarConta } from '@/api/usuarios.js'

export async function entrarNaConta(identificacao, senha, sinal) {
  const sessaoAutenticada = await fazerLogin(identificacao, senha, sinal)
  const conta =
    sessaoAutenticada.tipoUsuario === 'ALUNO'
      ? await identificarAluno(sessaoAutenticada.token, identificacao, sinal)
      : await identificarConta(sessaoAutenticada.token, identificacao, sinal)

  return {
    ...conta,
    token: sessaoAutenticada.token,
    expiraEm: sessaoAutenticada.expiraEm,
  }
}

export default entrarNaConta
