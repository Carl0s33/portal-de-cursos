import { listarCursos } from '@/api/cursos.js'

export async function buscarCursos(sinal) {
  return listarCursos(sinal)
}

export default buscarCursos
