import { pegarEnderecoRecurso } from './enderecos.js'
import { chamarApi } from './cliente.js'

export async function enviarNotificacaoProjeto(
  { statusProjeto, nomeProjeto, tipoProjeto, destinatarios, justificativa = '' },
  token,
  sinal = null,
) {
  const emails = [
    ...new Set((destinatarios || []).filter((email) => typeof email === 'string' && email.trim())),
  ]
  if (emails.length === 0) throw new Error('Nenhum destinatário de e-mail foi encontrado.')

  return chamarApi(`${pegarEnderecoRecurso('notificacoes')}`, {
    metodo: 'POST',
    corpo: { statusProjeto, nomeProjeto, tipoProjeto, destinatarios: emails, justificativa },
    token,
    sinal,
  })
}
