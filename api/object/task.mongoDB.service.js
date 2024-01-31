import { ObjectId } from 'mongodb'
import { dbService } from '../../services/db.service.js'
import { externalService } from '../../services/external.service.js'

const COLLECTION_NAME = 'task'

export const taskService = {
  query,
  getById,
  add,
  update,
  remove,
  performTask,
}

async function query() {
  try {
    const collection = await getCollection()
    return collection.find().toArray()
  } catch (err) {
    throw new Error(`Could not query tasks: ${err.message}`)
  }
}

async function getById(taskId) {
  try {
    const collection = await getCollection()
    const task = await collection.findOne({ _id: new ObjectId(taskId) })
    if (!task)
      throw new Error(`Could not find task in collection: _id: ${taskId}`)
    return task
  } catch (err) {
    throw new Error(`Task with ID ${taskId} not found: ${err.message}`)
  }
}

async function add(task) {
  try {
    const collection = await getCollection()
    const result = await collection.insertOne(task)
    const newTask = { ...task, _id: result.insertedId }
    if (result.acknowledged) return newTask
    throw new Error(`Could not add task: ${err.message}`)
  } catch (err) {
    throw new Error(`Could not add task: ${err.message}`)
  }
}

async function update(task) {
  try {
    const collection = await getCollection()
    const taskId = new ObjectId(task._id)
    delete task._id
    const result = await collection.updateOne({ _id: taskId }, { $set: task })
    if (result.matchedCount < 1)
      throw new Error(`Id was not found in collection, _id: [${taskId}]`)
    task._id = taskId
    return task
  } catch (err) {
    throw new Error(`Could not update task: ${err.message}`)
  }
}

async function remove(taskId) {
  try {
    if (!taskId || taskId.length === 0) throw new Error('Missing taskId')
    const collection = await getCollection()
    const result = await collection.deleteOne({ _id: new ObjectId(taskId) })
    if (result.deletedCount === 0)
      throw new Error(`Id was not found in collection, _id: [${taskId}]`)
    return taskId
  } catch (err) {
    throw new Error(`Could not remove task: ${err.message}`)
  }
}

async function getCollection() {
  return await dbService.getCollection(COLLECTION_NAME)
}

async function performTask(task) {
  console.log(task)
  let executedTask
  try {
    // TODO: update task status to running and save to DB
    task.status = 'running'
    await update(task)
    // TODO: execute the task using: externalService.execute
    await externalService.execute(task)
    // TODO: update task for success (doneAt, status)
    executedTask = {
      ...task,
      status: 'success',
      doneAt: Date.now(),
    }
  } catch (err) {
    // TODO: update task for error: status, errors
    executedTask = {
      ...task,
      status: 'failed',
      errors: [...task.errors, err.message || err],
    }
  } finally {
    // TODO: update task lastTried, triesCount and save to DB
    if (!task) throw new Error(`No task on request body`)
    executedTask.triesCount++
    executedTask.lastTriedAt = Date.now()
    await update(executedTask)
    return executedTask
  }
}
