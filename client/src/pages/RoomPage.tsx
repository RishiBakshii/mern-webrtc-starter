import { useCallback, useState } from 'react'
import { useParams } from 'react-router-dom'
import { RoomCallSession } from '../components/room/RoomCallSession'
import { RoomPreJoinLobby } from '../components/room/RoomPreJoinLobby'
import { useSocket } from '../context/socket.context'
import { useDraggableOverlay } from '../hooks/useDraggableOverlay'
import { useIceCandidateListener } from '../hooks/useIceCandidateListener'
import { useJoinRoom } from '../hooks/useJoinRoom'
import { useNegotiationNeeded } from '../hooks/useNegotiationNeeded'
import { useNegotiationNeededAnswer } from '../hooks/useNegotiationNeededAnswer'
import { useNegotiationRemoteAnswer } from '../hooks/useNegotiationRemoteAnswer'
import { useLocalMediaStream } from '../hooks/useLocalMediaStream'
import { useOtherPersonJoined } from '../hooks/useOtherPersonJoined'
import { useRemoteTrackListener } from '../hooks/useRemoteTrackListener'
import { useRoomChat } from '../hooks/useRoomChat'
import { useRoomJoinedConfirmation } from '../hooks/useRoomJoinedConfirmation'
import { useUserPreferences } from '../hooks/useUserPreferences'
import { useWebRtcAnswer } from '../hooks/useWebRtcAnswer'
import { useWebRtcIceCandidate } from '../hooks/useWebRtcIceCandidate'
import { useWebRtcOffer } from '../hooks/useWebRtcOffer'

export const RoomPage = () => {
  const { roomId } = useParams()
  const { socket } = useSocket()
  const [showLobbyScreen, setShowLobbyScreen] = useState<boolean>(true)
  const initiateConnection = !showLobbyScreen

  const { offset: selfViewOffset, handlePointerDown: handleSelfViewPointerDown } = useDraggableOverlay()

  const [remoteSocketId, setRemoteSocketId] = useState<string | null>(null)
  const [remoteUser, setRemoteUser] = useState<{ userId: string; username: string; email: string } | null>(null)

  // local media stream
  const { myStream, mediaError } = useLocalMediaStream()


  // user preferences
  const { isMicOn, isCameraOn, handleMicToggle, handleCameraToggle } = useUserPreferences(myStream)

  // initiate connection to the room
  useJoinRoom({ roomId, socket, initiateConnection })

  // handles room join confirmation
  useRoomJoinedConfirmation(socket)

  // handles the other person joining the room
  useOtherPersonJoined(socket, setRemoteSocketId, setRemoteUser, myStream)

  // handles the incoming offer from the other person, and sends the answer to them
  useWebRtcOffer(socket, myStream, setRemoteSocketId, setRemoteUser)

  // receives the answer and sets the remote description, "no emits"
  useWebRtcAnswer(socket)
  
  // listens for the socket event of NEGOTIATION_NEEDED, and sends the answer to the remote person
  // emits WEBRTC_NEGOTIATION_ANSWER event to the remote person
  useNegotiationNeededAnswer(socket)

  // listens for the socket event of WEBRTC_NEGOTIATION_ANSWER, and sets the remote description
  // "no emits"
  useNegotiationRemoteAnswer(socket)

  // listens for local peer, negotiation needed event and sends the offer again to remote person
  // emits NEGOTIATION_NEEDED event
  useNegotiationNeeded({socket,roomId,remoteSocketId,enabled: initiateConnection})

  // receives the remote ICE candidates and adds it to the peer connection
  useWebRtcIceCandidate(socket)
  
  // listens for the local ICE candidates and sends them to the other person (remote socket id)
  useIceCandidateListener({ socket, roomId, remoteSocketId })

  const { remoteStream, remoteAudioStream, remoteVideoStream } = useRemoteTrackListener({ remoteSocketId })
  const { messages, chatInput, setChatInput, handleChatSubmit } = useRoomChat(socket, roomId)

  const hasLiveRemoteVideo = Boolean(
    remoteVideoStream?.getVideoTracks().some((track) => track.enabled && track.readyState === 'live'),
  )
  const isRemoteMicEnabled = remoteAudioStream?.getAudioTracks()[0]?.enabled ?? false
  const isRemoteCameraEnabled = remoteVideoStream?.getVideoTracks()[0]?.enabled ?? false

  const handleReadyToJoin = useCallback(() => {
    setShowLobbyScreen(false)
  }, [])

  return (
    <main className="min-h-screen bg-slate-950 p-4 text-slate-100">
      {showLobbyScreen ? (
        <RoomPreJoinLobby
          roomId={roomId}
          myStream={myStream}
          mediaError={mediaError}
          isMicOn={isMicOn}
          isCameraOn={isCameraOn}
          handleMicToggle={handleMicToggle}
          handleCameraToggle={handleCameraToggle}
          onReadyToJoin={handleReadyToJoin}
        />
      ) : (
        <RoomCallSession
          roomId={roomId}
          isRemoteMicEnabled={isRemoteMicEnabled}
          isRemoteCameraEnabled={isRemoteCameraEnabled}
          remoteAudioStream={remoteAudioStream}
          remoteVideoStream={remoteVideoStream}
          remoteUser={remoteUser}
          remoteStream={remoteStream}
          remoteSocketId={remoteSocketId}
          hasLiveRemoteVideo={hasLiveRemoteVideo}
          myStream={myStream}
          isMicOn={isMicOn}
          isCameraOn={isCameraOn}
          handleMicToggle={handleMicToggle}
          handleCameraToggle={handleCameraToggle}
          selfViewOffset={selfViewOffset}
          handleSelfViewPointerDown={handleSelfViewPointerDown}
          messages={messages}
          chatInput={chatInput}
          setChatInput={setChatInput}
          handleChatSubmit={handleChatSubmit}
        />
      )}
    </main>
  )
}
