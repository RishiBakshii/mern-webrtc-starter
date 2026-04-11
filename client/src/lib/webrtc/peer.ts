const rtcConfig: RTCConfiguration = {
  iceServers: [
    {
      urls: ['stun:stun.l.google.com:19302', 'stun:global.stun.twilio.com:3478'],
    },
  ],
}

class PeerService {
  peer: RTCPeerConnection | null = null
  private screenShareSender: RTCRtpSender | null = null

  private bindIceLogging(pc: RTCPeerConnection) {
    pc.oniceconnectionstatechange = () => {
      console.log('ICE connection state:', pc.iceConnectionState)
    }
  }

  private ensurePeerConnection() {
    if (!this.peer) {
      this.peer = new RTCPeerConnection(rtcConfig)
      this.bindIceLogging(this.peer)
    }
  }

  /** Adds a second outgoing video track (display capture). Triggers renegotiation. */
  addScreenShareTrack(stream: MediaStream) {
    this.ensurePeerConnection()
    if (!this.peer) return
    const track = stream.getVideoTracks()[0]
    if (!track) return

    if (this.screenShareSender) {
      void this.screenShareSender.replaceTrack(track)
      return
    }

    this.screenShareSender = this.peer.addTrack(track, stream)
  }

  removeScreenShareTrack() {
    if (!this.peer || !this.screenShareSender) return
    try {
      this.peer.removeTrack(this.screenShareSender)
    } catch {
      /* ignore */
    }
    this.screenShareSender = null
  }

  async attachLocalStream(stream: MediaStream) {
    this.ensurePeerConnection()
    if (!this.peer) return

    for (const track of stream.getTracks()) {
      const sender = this.peer.getSenders().find((s) => s.track?.kind === track.kind)
      if (!sender) {
        this.peer.addTrack(track, stream)
        continue
      }
      if (sender.track?.id === track.id) continue
      await sender.replaceTrack(track)
    }
  }

  async getAnswer(offer: RTCSessionDescriptionInit) {
    try {
      this.ensurePeerConnection()
      if (!this.peer) return undefined
      await this.peer.setRemoteDescription(offer)
      const ans = await this.peer.createAnswer()
      await this.peer.setLocalDescription(new RTCSessionDescription(ans))
      return ans
    } catch (error) {
      console.log('Error in getAnswer', error)
    }
  }

  async setRemoteDescription(ans: RTCSessionDescriptionInit) {
    try {
      this.ensurePeerConnection()
      if (this.peer) {
        await this.peer.setRemoteDescription(new RTCSessionDescription(ans))
      }
    } catch (error) {
      console.log('Error in setRemoteDescription', error)
    }
  }

  async getOffer() {
    try {
      this.ensurePeerConnection()
      if (!this.peer) return undefined
      const offer = await this.peer.createOffer()
      await this.peer.setLocalDescription(new RTCSessionDescription(offer))
      return offer
    } catch (error) {
      console.log('Error in getOffer', error)
    }
  }

  closeConnection() {
    if (this.peer) {
      this.peer.close()
      this.peer = null
    }
  }
}

export const peer = new PeerService()
