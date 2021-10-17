const chatForm = document.getElementById('chat-form')
const chatMessage =document.querySelector('.chat-messages')
const roomName = document.getElementById('room-name')
const userList = document.getElementById('users')


// get username and room from URL
const { username, room } = Qs.parse(location.search, {
    ignoreQueryPrefix: true 
})



const socket = io()

// join chatroom
socket.emit('joinRoom', {username, room})

// Get room and users
socket.on('roomUsers', ({room, Users}) => {
    outputRoomName(room)
    outputUsers(Users)
})

// msg from server
socket.on('message', message =>{
    console.log(message)
    outputMessage(message)

    // scroll down(sath sath neechy move hoga)
    chatMessage.scrollTop = chatMessage.scrollHeight

})


//  message submit
chatForm.addEventListener('submit', (e) => {
    e.preventDefault();

    // Get msg text 
    const msg = e.target.elements.msg.value;

    // Emitting msg to server
    socket.emit('chatMessage', msg)

    // clear input after send
    e.target.elements.msg.value = ''
    e.target.elements.msg.focus()
})


// output message to DOM
function outputMessage(message){
    const div = document.createElement('div')
    div.classList.add('message')
    div.innerHTML = `<p class="meta">${message.username} <span>${message.time}</span></p>
    <p class="text">
        ${message.text}
    </p>`
    document.querySelector('.chat-messages').appendChild(div)
} 

// Add room name to dom
function outputRoomName(room) {
    roomName.innerHTML = room    
}


// Add users name to dom
function outputUsers(Users) {

    userList.innerHTML = `
        ${Users.map(user => `<li>${user.username}</li>`).join('')}
    `

}
