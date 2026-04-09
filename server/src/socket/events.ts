export enum SOCKET_EVENTS {
  PING = 'ping',
  PONG = 'pong',
  JOIN_ROOM = 'join-room',
  ROOM_JOINED_CONFIRMATION = 'room_joined_confirmation',
  OTHER_PERSON_JOINED = 'other_person_joined',
  WEBRTC_OFFER = 'webrtc_offer',
  WEBRTC_ANSWER = 'webrtc_answer',
  WEBRTC_ICE_CANDIDATE = 'webrtc_ice_candidate',
  ROOM_ERROR = 'room-error',
}
