import { Server as NetServer } from 'http'
import { Server as ServerIO } from 'socket.io'
import { NextApiResponse } from 'next'

export const config = {
  api: {
    bodyParser: false,
  },
}

export const initSocket = (res: NextApiResponse) => {
  if (!(res.socket as any).server.io) {
    const httpServer: NetServer = (res.socket as any).server
    const io = new ServerIO(httpServer, {
      path: '/api/socket',
    })
    ;(res.socket as any).server.io = io
  }
  return (res.socket as any).server.io
} 