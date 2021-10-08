import io from 'socket.io-client';
let socket;


export const initiateSocket = () => {
  socket = io('http://localhost:5000');
  console.log(`Connecting socket...`);
}


export const disconnectSocket = () => {
  console.log('Disconnecting socket...');
  if(socket) socket.disconnect();
}


export const subscribeToChat = () => {

}

export const sendFrame = (frame) => {
    if(!socket) return false;

    socket.emit("frame", {frame})
}


export const sendMessage = (room, message) => {
  if (socket) socket.emit('chat', { message, room });
}