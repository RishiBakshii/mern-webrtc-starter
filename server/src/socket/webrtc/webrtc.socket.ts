import { Socket } from 'socket.io'
import { SOCKET_EVENTS } from '../events'

interface WebRtcOfferPayload {
  roomId?: string
  toSocketId?: string
  offer?: unknown
}

interface WebRtcAnswerPayload {
  roomId?: string
  toSocketId?: string
  answer?: unknown
}

interface WebRtcIceCandidatePayload {
  roomId?: string
  toSocketId?: string
  candidate?: unknown
}

interface OutgoingWebRtcOfferPayload {
  roomId: string
  fromSocketId: string
  fromUser: {
    userId: string
    username: string
    email: string
  }
  offer: unknown
}

interface OutgoingWebRtcAnswerPayload {
  roomId: string
  fromSocketId: string
  fromUser: {
    userId: string
    username: string
    email: string
  }
  answer: unknown
}

interface OutgoingWebRtcIceCandidatePayload {
  roomId: string
  fromSocketId: string
  fromUser: {
    userId: string
    username: string
    email: string
  }
  candidate: unknown
}

export const registerWebRtcSocketHandlers = (socket: Socket) => {
    
  socket.on(SOCKET_EVENTS.WEBRTC_OFFER, ({ roomId, toSocketId, offer }: WebRtcOfferPayload = {}) => {
    if (!roomId || !toSocketId || !offer) {
      socket.emit(SOCKET_EVENTS.ROOM_ERROR, {
        message: 'roomId, toSocketId and offer are required',
      })
      return
    }

    const payload: OutgoingWebRtcOfferPayload = {
      roomId,
      fromSocketId: socket.id,
      fromUser: {
        userId: socket.user.userId,
        username: socket.user.username,
        email: socket.user.email,
      },
      offer,
    }

    console.log(
      `${socket.user.username} sent WEBRTC_OFFER to socket ${toSocketId} for room ${roomId}`,
    )

    socket.to(toSocketId).emit(SOCKET_EVENTS.WEBRTC_OFFER, payload)
  })

  socket.on(
    SOCKET_EVENTS.WEBRTC_NEGOTIATION_NEEDED,
    ({ roomId, toSocketId, offer }: WebRtcOfferPayload = {}) => {
      if (!roomId || !toSocketId || !offer) {
        socket.emit(SOCKET_EVENTS.ROOM_ERROR, {
          message: 'roomId, toSocketId and offer are required',
        })
        return
      }

      const payload: OutgoingWebRtcOfferPayload = {
        roomId,
        fromSocketId: socket.id,
        fromUser: {
          userId: socket.user.userId,
          username: socket.user.username,
          email: socket.user.email,
        },
        offer,
      }

      console.log(
        `${socket.user.username} sent WEBRTC_NEGOTIATION_NEEDED to socket ${toSocketId} for room ${roomId}`,
      )

      socket.to(toSocketId).emit(SOCKET_EVENTS.WEBRTC_NEGOTIATION_NEEDED, payload)
    },
  )

  socket.on(SOCKET_EVENTS.WEBRTC_ANSWER, ({ roomId, toSocketId, answer }: WebRtcAnswerPayload = {}) => {
    if (!roomId || !toSocketId || !answer) {
      socket.emit(SOCKET_EVENTS.ROOM_ERROR, {
        message: 'roomId, toSocketId and answer are required',
      })
      return
    }

    const payload: OutgoingWebRtcAnswerPayload = {
      roomId,
      fromSocketId: socket.id,
      fromUser: {
        userId: socket.user.userId,
        username: socket.user.username,
        email: socket.user.email,
      },
      answer,
    }

    console.log(
      `${socket.user.username} sent WEBRTC_ANSWER to socket ${toSocketId} for room ${roomId}`,
    )

    socket.to(toSocketId).emit(SOCKET_EVENTS.WEBRTC_ANSWER, payload)
  })

  socket.on(
    SOCKET_EVENTS.WEBRTC_NEGOTIATION_ANSWER,
    ({ roomId, toSocketId, answer }: WebRtcAnswerPayload = {}) => {
      if (!roomId || !toSocketId || !answer) {
        socket.emit(SOCKET_EVENTS.ROOM_ERROR, {
          message: 'roomId, toSocketId and answer are required',
        })
        return
      }

      const payload: OutgoingWebRtcAnswerPayload = {
        roomId,
        fromSocketId: socket.id,
        fromUser: {
          userId: socket.user.userId,
          username: socket.user.username,
          email: socket.user.email,
        },
        answer,
      }

      console.log(
        `${socket.user.username} sent WEBRTC_NEGOTIATION_ANSWER to socket ${toSocketId} for room ${roomId}`,
      )

      socket.to(toSocketId).emit(SOCKET_EVENTS.WEBRTC_NEGOTIATION_ANSWER, payload)
    },
  )

  socket.on(
    SOCKET_EVENTS.WEBRTC_ICE_CANDIDATE,
    ({ roomId, toSocketId, candidate }: WebRtcIceCandidatePayload = {}) => {
      if (!roomId || !toSocketId || !candidate) {
        socket.emit(SOCKET_EVENTS.ROOM_ERROR, {
          message: 'roomId, toSocketId and candidate are required',
        })
        return
      }

      const payload: OutgoingWebRtcIceCandidatePayload = {
        roomId,
        fromSocketId: socket.id,
        fromUser: {
          userId: socket.user.userId,
          username: socket.user.username,
          email: socket.user.email,
        },
        candidate,
      }

      console.log(
        `${socket.user.username} sent WEBRTC_ICE_CANDIDATE to socket ${toSocketId} for room ${roomId}`,
      )

      socket.to(toSocketId).emit(SOCKET_EVENTS.WEBRTC_ICE_CANDIDATE, payload)
    },
  )
}

