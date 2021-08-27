/*
Grid Lighting 최적화 생각.

1. Base Position에 해당하는 Grid Position을 구한다.
2. Lighting Range 만큼 순차적으로 Grid 탐색한다.
3. Grid의 Tile이 Movable False라면 해당 Tile로 인해 탐색하지 않아도 될 Angle을 구한다.
4. 다음 Tile의 Angle이 3에서 모집한 Angles 에 속하는 경우라면 Ray Casting 목록에서 제거한다.
5. Angles에 속하지는 않지만, Intersect가 존재한다면, Angle Boundary를 머지한다.

위와 같은 순서대로 진행하며
따라서 필요한것은
Angle Range에 대한 Intersect 함수,
Angle Range Merge 함수 등등이 필요할듯 하다.
*/