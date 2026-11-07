import { buscarCursoPorId } from '@/api/cursos.js'

export async function buscarDetalhesCurso(identificador, sinal) {
  return buscarCursoPorId(identificador, sinal)
}

export default buscarDetalhesCurso
