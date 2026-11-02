const CHAVES_LOCAIS = ['portal-cursos-submissoes', 'portal-cursos-decisoes']

/**
 * Limpa todos os dados locais e de sessão de forma segura
 */
export function limparDadosLocais() {
  try {
    CHAVES_LOCAIS.forEach((chave) => localStorage.removeItem(chave))
    sessionStorage.removeItem('portal-cursos-sessao')
    sessionStorage.removeItem('portal-cursos-filtros')
  } catch {
    /* armazenamento bloqueado pelo navegador */
  }
}
