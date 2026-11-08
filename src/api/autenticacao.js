import { ErroApi, pegarBaseApi, chamarApi } from './cliente.js'

export const VERSAO = ''

export function lerTokenJwt(token) {
  try {
    const partes = token.split('.')
    if (partes.length !== 3) return null
    const base64 = partes[1].replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join(''),
    )
    return JSON.parse(jsonPayload)
  } catch {
    return null
  }
}

export async function fazerLogin(email, senha, sinal) {
  if (!email || !senha) {
    throw new ErroApi('E-mail e senha são obrigatórios para autenticação.', { status: 400 })
  }

  const base = pegarBaseApi('usuarios', VERSAO)
  const url = `${base}/auth/login`

  let resposta
  try {
    resposta = await chamarApi(url, {
      metodo: 'POST',
      corpo: { email, senha },
      sinal,
    })
  } catch (erro) {
    if (erro.status === 400 || erro.status === 401 || erro.status === 403) {
      throw new ErroApi(
        erro.message || 'Não foi possível entrar. Confira seu e-mail e sua senha.',
        {
          status: erro.status,
          dados: erro.dados,
          causa: erro,
        },
      )
    }
    throw erro
  }

  if (
    !resposta ||
    typeof resposta.token !== 'string' ||
    !resposta.token ||
    typeof resposta.expiracao !== 'number' ||
    !Number.isFinite(resposta.expiracao) ||
    resposta.expiracao <= 0
  ) {
    throw new ErroApi('Não foi possível confirmar sua sessão. Resposta inválida do servidor.', {
      status: 502,
    })
  }

  // Extrai a role primariamente do claim "role" do JWT; fallback para o corpo da resposta
  const payloadJwt = lerTokenJwt(resposta.token)
  const roleJwt = payloadJwt?.role?.replace(/^ROLE_/, '')
  const roleFinal = roleJwt || resposta.role || resposta.tipoUsuario || 'ALUNO'

  return {
    token: resposta.token,
    role: roleFinal,
    tipoUsuario: roleFinal,
    email: payloadJwt?.sub || email,
    expiraEm: Date.now() + resposta.expiracao,
    expiracao: resposta.expiracao,
  }
}

export const moduloAutenticacao = {
  versao: VERSAO,
  fazerLogin,
  lerTokenJwt,
}

export default moduloAutenticacao
