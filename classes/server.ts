import { createClient, RedisClient } from 'redis';
import net, { createServer, Socket } from 'net';
import { ServerConfig, SERVER_TYPE } from '../interfaces/server';
import { Dictionary } from '../interfaces/common';
import { Client } from '../interfaces/client';
import { getRandomString } from '../utils';

class Server {
  private options: ServerConfig;
  private subscriber: RedisClient;
  private publisher: RedisClient;
  private tcpServer: net.Server;
  private clients: Dictionary<Client> = {};

  constructor(options: ServerConfig) {
    const { redisConfig }: ServerConfig = options;

    this.options = options;
    this.subscriber = createClient(redisConfig);
    this.publisher = createClient(redisConfig);
    this.tcpServer = createServer(this.socketConnect.bind(this));
  }

  public async run(): Promise<void> {
    await new Promise<void>((resolve): void => {
      this.subscriber.once('subscribe', (): void => {
        this.subscriber.on('message', this.onMessage.bind(this));
        console.log('start server');
        resolve();
      });

      this.subscriber.subscribe(SERVER_TYPE.GAME_SERVER);
      this.tcpServer.listen(this.options.tcpServerConfig.port);
    });
  }

  private broadcast(message: string): void {
    for (const id in this.clients) {
      const client: Client = this.clients[id];
      client.socket.write(Buffer.from(message));
    }
  }

  private onMessage(_channel: string, message: string): void {
    this.broadcast(message);
  }

  private socketConnect(socket: Socket): void {
    const id: string = this.uniqueClientID;
    const onData = (buffer: Buffer): void => {
      this.publisher.publish(SERVER_TYPE.GAME_SERVER, buffer.toString('utf8'));
    };

    socket.on('data', onData);
    socket.once('close', () => {
      this.clients[id].socket.off('data', onData);
      delete this.clients[id];
      console.log('disconnect:', id);
    });

    this.clients[id] = { id, socket };

    console.log('connect:', id);
  }

  private get uniqueClientID(): string {
    let id: string = '';

    do {
      id = getRandomString(10);
    } while (this.clients[id]);

    return id;
  }
}

export default Server;