const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const formateMessage = require('./Utils/messages')
const { userJoin, getCurrentUser, getRoomUsers, userLeftTheChat } = require('./Utils/Users')
 

const app = express();
const server = http.createServer(app)

const io = socketio(server)

// set static folder
app.use(express.static(path.join(__dirname , 'public')))


const botName = 'iChat Bot'

// run when clients connect
io.on('connection', socket =>{
    console.log(`User connect with ID: ${socket.id} ....` )  // end m i have to commit

    socket.on('joinRoom', ({username, room})=>{

        const user = userJoin( socket.id ,username, room)
        socket.join(user.room)
        
        //  welcome current user (Only User ko show hoga )
        socket.emit('message', formateMessage(botName, 'Welcome to iChat Platform!'))
    
        // Broadcast when connects (User k ilawa sab ko show hoga)
        socket.broadcast.to(user.room).emit('message',formateMessage(botName, `${user.username} has joined the chat`))

        // Send Users and room Info
        io.to(user.room).emit('roomUsers', {
            room : user.room,
            Users: getRoomUsers(user.room)
        })

    })

    // listen for cahtMessage
    socket.on('chatMessage', (msg)=>{
        const user = getCurrentUser(socket.id)

        io.to(user.room).emit('message', formateMessage(user.username, msg))
    }) 

    // Broadcast when user disconnects
    socket.on('disconnect',()=>{

        const user = userLeftTheChat(socket.id)

        if (user) {
            io.to(user.room).emit('message', formateMessage(botName,`${user.username} has left the chat`))
            
            // Send Users and room Info
            io.to(user.room).emit('roomUsers', {
                room : user.room,
                Users: getRoomUsers(user.room)
            })
        
        }


        // sab ko show hota ha 
        console.log(`User disconnect with ID: ${socket.id} ....` )  // end m i have to commit
    })


})


const PORT = 3000 || process.env.PORT;
server.listen(PORT, ()=> console.log(`Server running port ${PORT}`))