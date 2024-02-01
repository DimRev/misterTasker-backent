import { loggerService } from './logger.service.js'
import { Server } from 'socket.io'

var gIo = null

export function setupSocketAPI(server) {
  gIo = new Server(server, {
    cors: {
      origin: '*',
    },
  })
  gIo.on('connection', (socket) => {
    loggerService.info(`New connected socket [id: ${socket.id}]`)
    _printSockets()
    socket.on('disconnect', (socket) => {
      _printSockets()
      loggerService.info(`Socket disconnected [id: ${socket.id}]`)
    })
  })
}

function emitTo({ type, data, label }) {
  if (label) gIo.to('watching:' + label.toString()).emit(type, data)
  else gIo.emit(type, data)
}

async function emitToUser({ type, data, userId }) {
  userId = userId.toString()
  const socket = await _getUserSocket(userId)

  if (socket) {
    loggerService.info(
      `Emiting event: ${type} to user: ${userId} socket [id: ${socket.id}]`,
    )
    socket.emit(type, data)
  } else {
    loggerService.info(`No active socket for user: ${userId}`)
  }
}

// If possible, send to all sockets BUT not the current socket
// Optionally, broadcast to a room / to all
async function broadcast({ type, data, room = null, userId }) {
  userId = userId.toString()
  console.log('type:', type, '|data:', data, '|room:', room, '|userId:', userId)

  loggerService.info(`Broadcasting event: ${type}`)
  const excludedSocket = await _getUserSocket(userId)
  if (room && excludedSocket) {
    loggerService.info(`Broadcast to room ${room} excluding user: {userId}`)
    excludedSocket.broadcast.to(room).emit(type, data)
  } else if (excludedSocket) {
    loggerService.info(`Broadcast to all excluding user: {userId}`)
    excludedSocket.broadcast.emit(type, data)
  } else if (room) {
    loggerService.info(`Emit to room: {room}`)
    gIo.to(room).emit(type, data)
  } else {
    loggerService.info(`Emit to all`)
    gIo.emit(type, data)
  }
}

async function _getUserSocket(userId) {
  console.log('_gettingUserSocket', userId)
  const sockets = await _getAllSockets()
  const socket = sockets.find((s) => s.userId === userId)
  _printSockets(socket)
  return socket
}
async function _getAllSockets() {
  // return all Socket instances
  const sockets = await gIo.fetchSockets()
  // console.log(sockets)
  return sockets
}

async function _printSockets() {
  const sockets = await _getAllSockets()
  console.log(`Sockets: (count: ${sockets.length}):`)
  sockets.forEach(_printSocket)
}
function _printSocket(socket) {
  console.log(`Socket - socketId: ${socket.id}`)
}

export const socketService = {
  // set up the sockets service and define the API
  setupSocketAPI,
  // emit to everyone / everyone in a specific room (label)
  emitTo,
  // emit to a specific user (if currently active in system)
  emitToUser,
  // Send to all sockets BUT not the current socket - if found
  // (otherwise broadcast to a room / to all)
  broadcast,
}