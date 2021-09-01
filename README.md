1. PIXI js WebGL Garbage Collection 도큐먼트 읽어야한다.
   1. Graphic Clear이후 Garbage Collection 하면서 시간이 튈때가 있다.
   2. PIXI WweGL Garbage Collection 제어하는 Document 부분이 있던것으로 기억하는데 읽을것.
2. 8400 by 2400 tile set 의 방대한 world일때 메모리 최적화 방안 생각해야한다.
   1. 이건 다 들고 있어야 할듯하다.
3. Liquid Simulator 최적화 방안 생각해야한다.
   1. Lquid Settled `false`인 Liquid만 연산한다.
   2. Dirty 된 Tile이 존재할 경우 `상, 하, 좌, 우`의 Liquid의 Settled 를 false로 만든다.
   3. 연산된 Liquid의 `상, 하, 좌, 우`의 Lquid의 Settled를 false로 만든다.
   4. 모든 Liquid가 Settled가 될때까지 반복.