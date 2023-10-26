interface Game_Temp {
  _vectorDebugVisible: boolean;
}

interface Scene_Map {
  _spriteset: Spriteset_Map;
}

interface Spriteset_Map {
  _vectorDebugLayer: VectorDebugLayer;
  createVectorDebugLayer(): void;
}

interface Game_CharacterBase {
  screenOriginX(): number;
  screenOriginY(): number;
}

interface Bitmap {
  drawCollider(y: number, y: number, collider: Partial<Polygon>): void;
}
