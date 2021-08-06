import Server from '../classes/server';
import { ServerConfig } from '../interfaces/server';

async function main(): Promise<void> {
  const serverConfig: ServerConfig = {
    tcpServerConfig: {
      port: 1024
    },
    redisConfig: {
      host: '0.0.0.0',
      port: 6379,
      password: 'password'
    }
  }
  const server: Server = new Server(serverConfig);
  await server.run();
}

main();