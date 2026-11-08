export const basePortal = import.meta.env.BASE_URL

export function enderecoPrivado(caminho) {
  return `${basePortal}${caminho.replace(/^\//, '')}`
}
export function lerRota() {
  const caminho = window.location.pathname
    .slice(basePortal.length)
    .replace(/^\//, '')
    .replace(/\/$/, '')
  if (
    [
      'administracao/login',
      'login/admin',
      'admin/login',
      'professor/login',
      'login/professor',
      'coordenacao/login',
      'aluno/login',
      'login',
    ].includes(caminho)
  )
    return 'acesso'
  if (['professor', 'professor/feed', 'professor/painel'].includes(caminho)) return 'professor'
  if (caminho === 'professor/perfil') return caminho
  if (caminho === 'administracao' || caminho.startsWith('administracao/')) return caminho
  if (caminho.startsWith('professor/submissao/')) return caminho
  if (caminho === 'coordenacao' || caminho.startsWith('coordenacao/')) return caminho
  if (caminho === 'aluno/cadastro' || caminho.startsWith('aluno/')) return caminho
  return window.location.hash.slice(1)
}
export function navegar(endereco, substituir = false) {
  window.history[substituir ? 'replaceState' : 'pushState'](null, '', endereco)
  window.dispatchEvent(new PopStateEvent('popstate'))
}
export function retornoAutenticado(tipoUsuario) {
  const retorno = new URLSearchParams(window.location.search).get('retorno')
  const permitido =
    tipoUsuario === 'ADMIN'
      ? /^administracao\/(painel|usuarios|professores|cursos|disciplinas|projetos|submissoes|perfil|campus(?:\/[a-zA-Z0-9_-]+)?)$/
      : tipoUsuario === 'COORDENADOR'
        ? /^coordenacao\/(painel|curso|disciplinas|professores|projetos|submissoes|perfil|submissao\/[a-zA-Z0-9_-]+)$/
        : tipoUsuario === 'ALUNO'
          ? /^(aluno\/(painel|perfil)|submeter)$/
          : /^professor\/(feed|perfil|submissao\/[a-zA-Z0-9_-]+)$|^submeter$/
  return retorno && permitido.test(retorno)
    ? retorno
    : tipoUsuario === 'ADMIN'
      ? 'administracao/painel'
      : tipoUsuario === 'COORDENADOR'
        ? 'coordenacao/painel'
        : tipoUsuario === 'ALUNO'
          ? 'aluno/painel'
          : 'professor/feed'
}
