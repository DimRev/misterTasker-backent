import express from 'express'
import {
  addTask,
  getTask,
  getTasks,
  removeTask,
  updateTask,
} from './task.controller.js'

export const taskRoutes = express.Router()

taskRoutes.get('/', getTasks)
taskRoutes.get('/:taskId', getTask)
taskRoutes.post('/', addTask)
taskRoutes.put('/', updateTask)
taskRoutes.delete('/:taskId', removeTask)
