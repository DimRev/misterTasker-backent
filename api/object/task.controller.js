import { loggerService } from '../../services/logger.service.js'
import { taskService } from './task.mongoDB.service.js'

const CRUD = {
  QUERY: 'query',
  GET_BY_ID: 'getById',
  ADD: 'add',
  UPDATE: 'update',
  REMOVE: 'remove',
}

const PREFORM_TASK = 'performTask'
const TOGGLE_WORKER = 'toggleWorker'

async function handleRequest(action, req, res) {
  try {
    loggerService.debug(`Handling ${action} request`)
    const result = await taskService[action](req)
    res.send(result)
  } catch (err) {
    const errorMessage = `Error ${action} -> ${err.message}`
    loggerService.error(errorMessage)
    res.status(400).send(errorMessage)
  }
}

// FORMAT OF TASK IN REQ
// { task: { value: ..., _id: ...}}

export async function getTasks(req, res) {
  await handleRequest(CRUD.QUERY, req, res)
}

export async function getTask(req, res) {
  await handleRequest(CRUD.GET_BY_ID, req.params.taskId, res)
}

export async function addTask(req, res) {
  await handleRequest(CRUD.ADD, req.body, res)
}

export async function updateTask(req, res) {
  await handleRequest(CRUD.UPDATE, req.body, res)
}

export async function removeTask(req, res) {
  await handleRequest(CRUD.REMOVE, req.params.taskId, res)
}

export async function executeTask(req, res) {
  await handleRequest(PREFORM_TASK, req.body, res)
}

export async function toggleWorker(req, res) {
  await handleRequest(TOGGLE_WORKER, req.body, res)
}
