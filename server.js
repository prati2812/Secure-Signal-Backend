import { createServer } from 'http';
import app from './app.js';
import { port } from './config.js';

const server = createServer(app);

server.listen(port, ()=>{
    console.log("server started");
});
