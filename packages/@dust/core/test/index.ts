import { mapGenrateTest } from './map';
import { lightingTest } from './lighting'
import { fullLiquidTest, liquidTest, partitioningLiquidTest } from './liquid';

async function main(): Promise<void> {
  while (true) {
    await mapGenrateTest();
    await lightingTest();
    await fullLiquidTest();
    await liquidTest();
    await partitioningLiquidTest();
  }
}

main();