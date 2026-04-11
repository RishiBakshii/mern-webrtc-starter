export const SOCKET_EVENTS = {
  PING: 'ping',
  PONG: 'pong',
  JOIN_ROOM: 'join-room',
  ROOM_JOINED_CONFIRMATION: 'room_joined_confirmation',
  OTHER_PERSON_JOINED: 'other_person_joined',
  WEBRTC_OFFER: 'webrtc_offer',
  /** Renegotiation SDP offer (e.g. after `negotiationneeded`); same payload shape as `WEBRTC_OFFER`. */
  WEBRTC_NEGOTIATION_NEEDED: 'webrtc_negotiation_needed',
  /** SDP answer for a renegotiation round (pairs with `WEBRTC_NEGOTIATION_NEEDED`). */
  WEBRTC_NEGOTIATION_ANSWER: 'webrtc_negotiation_answer',
  WEBRTC_ANSWER: 'webrtc_answer',
  WEBRTC_ICE_CANDIDATE: 'webrtc_ice_candidate',
  SEND_MESSAGE: 'send_message',
  RECEIVE_MESSAGE: 'receive_message',
  ROOM_ERROR: 'room-error',
} as const

export type SocketEvent = (typeof SOCKET_EVENTS)[keyof typeof SOCKET_EVENTS]
