import  express  from "express";
import { Server } from "socket.io";
import {createServer} from "http";
import cors  from "cors";
const app=express();
const server=createServer(app);
const port=8000;
  const io=new Server(server,
    {cors:{
        origin:"*",
        methods:["GET","POST"],
        credentials:true
    }});
app.get("/",(req,res)=>{
    res.send("<h1> This is my HomePage </h1>");
})
app.use(cors({
    origin:"*",
    methods:["GET","POST"],
    credentials:true
}))
// src/app/api/route.js

export async function GET(request) {
    return new Response('Hello, world!', {
      status: 200,
    });
  }
  
  export async function POST(request) {
    const data = await request.json();
    return new Response(JSON.stringify({ message: 'Data received', data }), {
      status: 200,
    });
  }
  
io.on("connection", (socket) => {
    console.log("User Connected", socket.id);
  
    // socket.on("message", ({ room, message }) => {
    //   console.log({ room, message });
    //  io.to(room).emit("recieve-message", message);
    // });
  
    // socket.on("join-room", (room) => {
    //   socket.join(room);
    //   console.log(`User joined room ${room}`);
    // });
  
    // socket.on("disconnect", () => {
    //   console.log("User Disconnected", socket.id);
    // });
  });
server.listen(port,()=>{
    console.log("App is running at port 3000");
})
