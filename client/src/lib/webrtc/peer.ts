const servers: RTCConfiguration = {
    iceServers: [
        {
            urls: [
                "stun:stun.l.google.com:19302",
                "stun:global.stun.twilio.com:3478",
            ]
        }
    ]
}

class PeerService {

    public peer: RTCPeerConnection | null = null;

    /**
     * Initializes the service with a single RTCPeerConnection instance (if not already created).
     * This is the main WebRTC connection object that will:
     * - hold local/remote session descriptions (offer/answer),
     * - negotiate ICE candidates through configured STUN servers,
     * - manage media/data channels and connection state.
     *
     * Also attaches an ICE connection state listener for quick debugging.
     */
    constructor() {
        try {
            if (!this.peer) {
                this.peer = new RTCPeerConnection(servers);
                this.peer.oniceconnectionstatechange = () => {
                    console.log("ICE Connection State:", peer.peer?.iceConnectionState);
                };

            }
        } catch (error) {
            console.log('Error in PeerService constructor', error);
        }
    }

    /**
     * Ensures a usable RTCPeerConnection exists before running signaling operations.
     * This is a defensive guard used by other methods in case the connection was never
     * initialized or was closed/reset earlier.
     *
     * If the peer does not exist, it recreates it with the same STUN configuration and
     * rebinds ICE state logging.
     */
    ensurePeerConnection() {
        if (!this.peer) {
            this.peer = new RTCPeerConnection(servers);
            this.peer.oniceconnectionstatechange = () => {
                console.log("ICE Connection State:", peer.peer?.iceConnectionState);
            }
        }
    }

    async attachLocalStream(stream: MediaStream) {
        this.ensurePeerConnection();
        if (!this.peer) return;

        for (const track of stream.getTracks()) {
            const sender = this.peer.getSenders().find((s) => s.track?.kind === track.kind);
            if (!sender) {
                this.peer.addTrack(track, stream);
                continue;
            }

            if (sender.track?.id === track.id) continue;
            await sender.replaceTrack(track);
        }
    }

    /**
     * Accepts a remote offer and generates the local answer for negotiation.
     *
     * Expected signaling flow for the answering peer:
     * 1) Set incoming offer as remote description.
     * 2) Create answer from current peer capabilities/tracks.
     * 3) Set answer as local description.
     * 4) Return answer so caller can send it back over signaling channel.
     *
     * Returns undefined if peer is unavailable or an error occurs.
     */
    async getAnswer(offer: RTCSessionDescriptionInit) {
        try {
            this.ensurePeerConnection();
            if (this.peer) {
                await this.peer.setRemoteDescription(offer);
                const ans = await this.peer.createAnswer();
                await this.peer.setLocalDescription(new RTCSessionDescription(ans));
                return ans;
            }
        } catch (error) {
            console.log('Error in getAnswer', error);
        }
    }

    /**
     * Applies the remote answer on the offer-creating side.
     * After this call, both peers should have matching local/remote descriptions,
     * allowing ICE/media establishment to proceed.
     */
    async setRemoteDescription(ans: RTCSessionDescriptionInit) {
        try {
            this.ensurePeerConnection();
            if (this.peer) {
                await this.peer.setRemoteDescription(new RTCSessionDescription(ans));
            }
        } catch (error) {
            console.log('Error in setLocalDescription', error);
        }
    }

    /**
     * Creates an offer from the local peer and sets it as local description.
     *
     * Expected signaling flow for the calling/initiating peer:
     * 1) Create offer.
     * 2) Set offer as local description.
     * 3) Return offer so caller can send it to remote peer.
     *
     * Returns undefined if peer is unavailable or an error occurs.
     */
    async getOffer() {
        try {
            this.ensurePeerConnection();
            if (this.peer) {
                const offer = await this.peer.createOffer();
                await this.peer.setLocalDescription(new RTCSessionDescription(offer));
                return offer;
            }
        } catch (error) {
            console.log('Error in getOffer', error);
        }
    }

    /**
     * Gracefully closes the underlying RTCPeerConnection and clears local reference.
     * Use this when ending a call/session or cleaning up during unmount/navigation.
     * A new connection can later be recreated by ensurePeerConnection().
     */
    closeConnection() {
        if (this.peer) {
            this.peer.close();
            this.peer = null;
        }
    }
}

export const peer = new PeerService();
