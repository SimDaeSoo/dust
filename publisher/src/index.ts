import redis, { RedisClient } from 'redis';

async function main(): Promise<void> {
  const client: RedisClient = redis.createClient({
    host: "127.0.0.1",
    port: 6379,
    db: 0,
    password: "password"
  });

  client.set('name', 'daesoo94');

  const t1 = Date.now();
  client.get('name', (error, reply) => {
    if (error) throw error;
    console.log(reply, Date.now() - t1, 'ms');
    client.quit();
  });
}

main();