import { pegarBaseApi } from './cliente.js'

export function pegarEnderecoRecurso(recurso) {
  const chave = recurso.toUpperCase().replaceAll('-', '_')
  const personalizado =
    import.meta.env[`VITE_API_${chave}_URL`] || import.meta.env[`VITE_API_${chave}`]
  if (personalizado) return personalizado.replace(/\/+$/, '')
  if (['cursos', 'disciplinas', 'campus', 'areas-conhecimento'].includes(recurso)) {
    const baseAcademica = import.meta.env.VITE_API_ACADEMICO_URL
    if (baseAcademica) return `${baseAcademica.replace(/\/+$/, '')}/${recurso}`
  }
  return pegarBaseApi(recurso)
}
