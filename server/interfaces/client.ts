import { Socket } from "net";

interface Client {
  id: string;
  socket: Socket;
}

export {
  Client
}