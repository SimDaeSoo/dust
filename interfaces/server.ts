import { ClientOpts } from 'redis';

interface TcpServerConfig {
  port: number;
};

interface ServerConfig {
  tcpServerConfig: TcpServerConfig;
  redisConfig: ClientOpts;
}

const enum SERVER_TYPE {
  GAME_SERVER = '0'
};

export {
  ServerConfig,
  SERVER_TYPE
};