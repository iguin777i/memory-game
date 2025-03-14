import { Server as NetServer } from 'http'
import { Server as ServerIO } from 'socket.io'
import { NextApiResponse } from 'next'
import { Socket } from 'net'

interface SocketServer extends NetServer {
  io?: ServerIO;
}

interface ResponseWithSocket extends Omit<NextApiResponse, 'socket'> {
  socket: Socket & {
    server: SocketServer;
  };
}

export const config = {
  api: {
    bodyParser: false,
  },
}

export const initSocket = (res: ResponseWithSocket) => {
  if (!res.socket.server.io) {
    const httpServer: NetServer = res.socket.server
    const io = new ServerIO(httpServer, {
      path: '/api/socket',
    })
    res.socket.server.io = io
  }
  return res.socket.server.io
} 