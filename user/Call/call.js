 const APP_ID = "5f7a328ba1e64658a9fcecc620c789b0"
const TOKEN = "007eJxTYDj0f46owrbknFkP9pfNd+O72af/3bcr2DbV8N3ujp9CW54pMJimmScaG1kkJRqmmpmYmVokWqYlpyYnmxkZJJtbWCYZ7H6ant4QyMjgaVLGwsgAgSA+B0NxrkluaXFmMgMDAFx0Ip0="
const CHANNEL = "sm4music"

const client = AgoraRTC.createClient({mode:'rtc', codec:'vp8'})

let localTracks = []
let remoteUsers = {}
let screenTrack = null
let isScreenSharing = false
let screenSharingUid = null

let joinAndDisplayLocalStream = async () => {
    client.on('user-published', handleUserJoined)
    client.on('user-left', handleUserLeft)
    
    let UID = await client.join(APP_ID, CHANNEL, TOKEN, null)

    localTracks = await AgoraRTC.createMicrophoneAndCameraTracks() 

    let player = `<div class="video-container" id="user-container-${UID}">
                        <div class="video-player" id="user-${UID}"></div>
                  </div>`
    document.getElementById('video-streams').insertAdjacentHTML('beforeend', player)

    localTracks[1].play(`user-${UID}`)
    
    await client.publish([localTracks[0], localTracks[1]])
}

let joinStream = async () => {
    await joinAndDisplayLocalStream()
    document.getElementById('join-btn').style.display = 'none'
    document.getElementById('stream-controls').style.display = 'flex'
}

let handleUserJoined = async (user, mediaType) => {
    remoteUsers[user.uid] = user 
    await client.subscribe(user, mediaType)

    if (mediaType === 'video'){
        let player = document.getElementById(`user-container-${user.uid}`)
        if (player != null){
            player.remove()
        }

        player = `<div class="video-container" id="user-container-${user.uid}">
                        <div class="video-player" id="user-${user.uid}"></div> 
                 </div>`
        document.getElementById('video-streams').insertAdjacentHTML('beforeend', player)

        user.videoTrack.play(`user-${user.uid}`)
        
        // Disable screen share button if someone else is sharing
        if(user.videoTrack.trackMediaType === 'screen-video') {
            screenSharingUid = user.uid
            document.getElementById('screen-btn').disabled = true
        }
    }

    if (mediaType === 'audio'){
        user.audioTrack.play()
    }
}

let handleUserLeft = async (user) => {
    delete remoteUsers[user.uid]
    document.getElementById(`user-container-${user.uid}`).remove()
    
    // Re-enable screen share button if the user who was sharing left
    if(user.uid === screenSharingUid) {
        screenSharingUid = null
        document.getElementById('screen-btn').disabled = false
    }
}

let leaveAndRemoveLocalStream = async () => {
    for(let i = 0; localTracks.length > i; i++){
        localTracks[i].stop()
        localTracks[i].close()
    }
    
    if(screenTrack) {
        screenTrack.stop()
        screenTrack.close()
    }

    await client.leave()
    document.getElementById('join-btn').style.display = 'block'
    document.getElementById('stream-controls').style.display = 'none'
    document.getElementById('video-streams').innerHTML = ''
}

let toggleMic = async (e) => {
    if (localTracks[0].muted){
        await localTracks[0].setMuted(false)
        e.target.innerText = 'Mic on'
        e.target.style.backgroundColor = 'cadetblue'
    }else{
        await localTracks[0].setMuted(true)
        e.target.innerText = 'Mic off'
        e.target.style.backgroundColor = '#EE4B2B'
    }
}

let toggleCamera = async (e) => {
    if(localTracks[1].muted){
        await localTracks[1].setMuted(false)
        e.target.innerText = 'Camera on'
        e.target.style.backgroundColor = 'cadetblue'
    }else{
        await localTracks[1].setMuted(true)
        e.target.innerText = 'Camera off'
        e.target.style.backgroundColor = '#EE4B2B'
    }
}

let toggleScreenShare = async (e) => {
    if(!isScreenSharing) {
        screenTrack = await AgoraRTC.createScreenVideoTrack()
        await client.unpublish([localTracks[1]])
        await client.publish([screenTrack])
        
        screenTrack.on('track-ended', async () => {
            await client.unpublish([screenTrack])
            screenTrack.stop()
            screenTrack.close()
            screenTrack = null
            await client.publish([localTracks[1]])
            isScreenSharing = false
            e.target.innerText = 'Share Screen'
            e.target.style.backgroundColor = 'cadetblue'
        })
        
        isScreenSharing = true
        e.target.innerText = 'Stop Sharing'
        e.target.style.backgroundColor = '#EE4B2B'
    } else {
        await client.unpublish([screenTrack])
        screenTrack.stop()
        screenTrack.close()
        screenTrack = null
        await client.publish([localTracks[1]])
        isScreenSharing = false
        e.target.innerText = 'Share Screen'
        e.target.style.backgroundColor = 'cadetblue'
    }
}

document.getElementById('join-btn').addEventListener('click', joinStream)
document.getElementById('leave-btn').addEventListener('click', leaveAndRemoveLocalStream)
document.getElementById('mic-btn').addEventListener('click', toggleMic)
document.getElementById('camera-btn').addEventListener('click', toggleCamera)
document.getElementById('screen-btn').addEventListener('click', toggleScreenShare)
