import {
  cadastrarProfessor as cadastrarProfessorApi,
  excluirProfessor as excluirProfessorApi,
  listarProfessores as listarProfessoresApi,
} from '@/api/professores.js'

export async function listarProfessores(token, sinal) {
  return listarProfessoresApi(token, {}, sinal)
}

export async function cadastrarProfessor(token, dados) {
  return cadastrarProfessorApi(token, dados)
}

export async function excluirProfessor(token, id) {
  return excluirProfessorApi(token, id)
}

export default {
  listarProfessores,
  cadastrarProfessor,
  excluirProfessor,
}
