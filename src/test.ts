import net, { Socket } from 'net';

const enum MESSAGE_TYPE {
  MESSAGE = 0,
  INITIALIZE = 1,
  SET_STATE = 2
};

type Message = [MESSAGE_TYPE, string];

function createClient(): Socket {
  const client: Socket = net.connect({ port: 1024, host: '0.0.0.0' }, (): void => {
    const onData = (buffer: Buffer): void => {
      const data: string = buffer.toString('utf8');
      console.log('get data:', data);
    };

    client.on('data', onData);
    client.once('close', (): void => {
      client.off('data', onData);
    });

    setInterval(() => {
      // Buffer 최적화 추후 해야할듯.
      const message: Message = [MESSAGE_TYPE.MESSAGE, 'Hello World?'];

      client.write(Buffer.from(JSON.stringify(message)));
    }, 1000);
  });

  return client;
}

function main(): void {
  for (let i = 0; i < 100; i++) {
    const _client: Socket = createClient();
  }
}

main();