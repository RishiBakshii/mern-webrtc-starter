import { useCallback, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { peer } from '../lib/webrtc/peer'
import { LeaveCallModal } from '../components/room/LeaveCallModal'
import { RoomCallSession } from '../components/room/RoomCallSession'
import { RoomPreJoinLobby } from '../components/room/RoomPreJoinLobby'
import { useSocket } from '../context/socket.context'
import { useScreenShare } from '../hooks/useScreenShare'
import { useIceCandidateListener } from '../hooks/useIceCandidateListener'
import { useJoinRoom } from '../hooks/useJoinRoom'
import { useNegotiationNeeded } from '../hooks/useNegotiationNeeded'
import { useNegotiationNeededAnswer } from '../hooks/useNegotiationNeededAnswer'
import { useNegotiationRemoteAnswer } from '../hooks/useNegotiationRemoteAnswer'
import { useLocalMediaStream } from '../hooks/useLocalMediaStream'
import { useOtherPersonJoined } from '../hooks/useOtherPersonJoined'
import { useRemoteTrackListener } from '../hooks/useRemoteTrackListener'
import { useScreenShareStopListener } from '../hooks/useScreenShareStopListener'
import { useRoomChat } from '../hooks/useRoomChat'
import { useRoomJoinedConfirmation } from '../hooks/useRoomJoinedConfirmation'
import { useUserPreferences } from '../hooks/useUserPreferences'
import { useWebRtcAnswer } from '../hooks/useWebRtcAnswer'
import { useWebRtcIceCandidate } from '../hooks/useWebRtcIceCandidate'
import { useWebRtcOffer } from '../hooks/useWebRtcOffer'

export const RoomPage = () => {
  const { roomId } = useParams()
  const navigate = useNavigate()
  const { socket } = useSocket()
  const [showLobbyScreen, setShowLobbyScreen] = useState<boolean>(true)
  const [showLeaveModal, setShowLeaveModal] = useState(false)
  const initiateConnection = !showLobbyScreen

  const [remoteSocketId, setRemoteSocketId] = useState<string | null>(null)

  const { isScreenSharing, toggleScreenShare, stopScreenShare } = useScreenShare({
    roomId,
    toSocketId: remoteSocketId,
  })
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

  const {
    remoteStream,
    remoteAudioStream,
    remoteVideoStream,
    remoteScreenShareStream,
    clearRemoteScreenShare,
  } = useRemoteTrackListener({ remoteSocketId })

  useScreenShareStopListener({
    socket,
    roomId,
    remoteSocketId,
    onRemoteScreenShareStopped: clearRemoteScreenShare,
  })

  const { messages, chatInput, setChatInput, handleChatSubmit } = useRoomChat(socket, roomId)

  const hasLiveRemoteVideo = Boolean(
    remoteVideoStream?.getVideoTracks().some((track) => track.enabled && track.readyState === 'live'),
  )
  const isRemoteMicEnabled = remoteAudioStream?.getAudioTracks()[0]?.enabled ?? false
  const isRemoteCameraEnabled = remoteVideoStream?.getVideoTracks()[0]?.enabled ?? false

  const handleReadyToJoin = useCallback(() => {
    setShowLobbyScreen(false)
  }, [])

  const handleLeaveRequest = useCallback(() => {
    setShowLeaveModal(true)
  }, [])

  const handleDismissLeaveModal = useCallback(() => {
    setShowLeaveModal(false)
  }, [])

  const handleConfirmLeave = useCallback(() => {
    if (isScreenSharing) {
      stopScreenShare()
    }
    peer.closeConnection()
    setShowLeaveModal(false)
    navigate('/', { replace: true })
  }, [isScreenSharing, navigate, stopScreenShare])

  return (
    <main className="min-h-[100dvh] min-h-screen bg-slate-950 px-1.5 py-1 pb-[max(0.25rem,env(safe-area-inset-bottom))] pt-[max(0.25rem,env(safe-area-inset-top))] text-slate-100 lg:p-4 lg:pb-4 lg:pt-4">
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
          remoteScreenShareStream={remoteScreenShareStream}
          remoteUser={remoteUser}
          remoteStream={remoteStream}
          remoteSocketId={remoteSocketId}
          hasLiveRemoteVideo={hasLiveRemoteVideo}
          myStream={myStream}
          isMicOn={isMicOn}
          isCameraOn={isCameraOn}
          handleMicToggle={handleMicToggle}
          handleCameraToggle={handleCameraToggle}
          isScreenSharing={isScreenSharing}
          onScreenShareClick={toggleScreenShare}
          onLeaveClick={handleLeaveRequest}
          messages={messages}
          chatInput={chatInput}
          setChatInput={setChatInput}
          handleChatSubmit={handleChatSubmit}
        />
      )}

      {showLeaveModal ? (
        <LeaveCallModal onCancel={handleDismissLeaveModal} onConfirm={handleConfirmLeave} />
      ) : null}
    </main>
  )
}
