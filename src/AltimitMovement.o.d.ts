declare class DOMParser {
  /**
   * Parses string using either the HTML or XML parser, according to type, and returns the resulting Document. type can be "text/html" (which will invoke the HTML parser), or any of "text/xml", "application/xml", "application/xhtml+xml", or "image/svg+xml" (which will invoke the XML parser).
   *
   * For the XML parser, if string cannot be parsed, then the returned Document will contain elements describing the resulting error.
   *
   * Note that script elements are not evaluated during parsing, and the resulting document's encoding will always be UTF-8.
   *
   * Values other than the above for type will cause a TypeError exception to be thrown.
   *
   * [MDN Reference](https://developer.mozilla.org/docs/Web/API/DOMParser/parseFromString)
   */
  parseFromString(string: string, type: DOMParserSupportedType): Document;
}

declare class Node extends Document {
  nodeName: string;
  nodeValue: string;
  textContent: string;
  innerHTML: string;
  getAttribute(key: string): string;
}

declare class Document {
  childNodes: Node[];
  children: Node[];
  append(...args: Node[]): void;
  createElement(arg0: string): Document;
  querySelectorAll(arg0: string): Node[];
  addEventListener(event: string, listener: () => void);
}

declare const document: Document;

interface Game_System {
  _moveAlignGrid: boolean;
  _staticMoveAlignGrid: boolean;
  _enableTouchMouse: boolean;
  _followerDistance: number;
  _staticEnableTouchMouse: boolean;
  _staticFollowerDistance: number;
  _eventColliders: Array<Array<Polygon>>;
  initialize(): void;
}

type Game_CharacterBased =
  | Game_CharacterBase
  | Game_Character
  | Game_Event
  | Game_Follower
  | Game_Player
  | Game_Vehicle;

interface Game_Interpreter {
  _character: Game_Character;
  _waitMode: WaitMode;
  pluginCommand(command: string, args: string[]): void;
  altMovementStringArgs(args: Array | string): Array<string>;
  altMovementCommandToDirection(
    subject: Game_Character,
    command: number,
  ): number;
  altMovementCharacterEdgeDxDy(
    subject: Game_Character,
    dx: number,
    dy: number,
  ): number;
  altMovementProcessMoveCommand(
    subject,
    command,
    distance,
    options,
    object?,
  ): void;
  altMovementMoveCharacter(args): void;
  altMovementCollider(args): void;
  altMovementColliderSet(args): void;
  altMovementGetMoveCommand(cmdStr: string): Game_Character.Route | null;
  altMovementGetTargetCharacter(target: string): Game_CharacterBased | null;
}

interface Game_Follower {
  setFrozen(frozen: boolean): void;
  _isFrozen: boolean;
}

interface Game_CharacterBase {
  _hasCustomCollider: boolean;
  _direction8: number;
  _isMoving: boolean;
  _wasMoving: boolean;
  _moveTarget: boolean;
  _moveTargetX: number;
  _moveTargetY: number;
  _circularMovement: boolean;
  _moveRoute: rm.types.MoveRoute; //sic
  readonlystepDistance: number;
  stepDistance: number;
  _moveTargetSkippable: boolean;
  _wasDirectionFixed: boolean;
  _collisionType: number;
  loopMap: number;
  inMotion(): boolean;
  continueProcessMoveCommand(): void;
  collidableWith(character: Game_CharacterBased): boolean;
  testMove(
    vx: number,
    vy: number,
  ): { move: Vector; characterCollided: boolean };
  moveVectorCharacters(characters: Game_CharacterBased[], move): Vector;
  moveVectorMap(bboxTests, move, vx, vy): void;
  moveVector(vx, vy): void;
  setDirectionVector(vx, vy): void;
  checkEventTriggerTouchFrontVector(vx, vy): void;
  align(): void;
  collider(): PolygonV;
  setCollider(collider): void;
  direction8(): Direction;

  _collider: PolygonV;
  _touchTarget: Game_CharacterBased | PIXI.Point | null;
  actionWidth(): number;
  actionHeight(): number;
}
interface TiledTile {
  [x: string]: { objectgroup: { objects: TiledLayerObject[] } };
}
interface TiledTileset {
  tiles: TiledTile;
  firstgid: number;
  tilecount: number;
}

interface TiledLayerObject {
  x: number;
  y: number;
  polygon?: Array<Vector>;
  polyline?: Array<Vector>;
  ellipse?: boolean;
  height: number;
  width: number;
  properties: {
    points: number;
  };
}
interface TiledLayer {
  height: number;
  width: number;
  data: Array<number>;
  type: 'objectgroup' | '';
  properties: {
    collision: 'mesh';
  };
  objects: [];
}

interface TiledData {
  tilesets: TiledTileset[];
  layers: TiledLayer[];
}
interface Game_Map {
  isHalfTile?(): boolean;
  tiledData?: TiledData;
  directionX(ax, bx): number;
  directionY(ax, bx): number;
  collisionMesh(collisionType): Partial<Polygon>;
  getCharactersUnderPoint(x, y): Game_CharacterBased[];
  getCharactersUnder(character, x, y): void;
  getTilesUnder(character, vx?, vy?): Array<[xx, yy]>;
  touchesCharacters(character, x, y): boolean;
  canMoveOn(character, x, y, collisionMesh: Partial<Polygon>): boolean;
  isAABBoxValid(x, y, aabbox): boolean;
  canWalk(character, x, y): boolean;
  getAABBoxTests(
    character,
    vx?,
    vy?,
  ): Omit<Polygon, 'colliders' | 'vertices'>[];
  characters(player = true): Game_CharacterBased[];
}

interface Game_Followers {
  contains(item: Game_Follower): boolean;
  _targetX: number;
  _targetY: number;
}

interface Game_Vehicle {
  _passengerCollider: Collider;
}

interface Game_Event {
  _lastFrame: number;
  getStoredCollider(): PolygonV | undefined;
  getNoteCollider(): PolygonV | undefined;
  getCommentCollider(): PolygonV | undefined;
  getPresetCollider(): PolygonV | undefined;
  getDefaultCollider(): PolygonV;
}

interface Game_Player {
  moveByInputGamePad(): void;
  moveByInputTouch(): void;
}

declare namespace rm.types {
  interface EventPage {
    _collider: PolygonV;
  }
}

declare type Vertice = [x: number, y: number];
declare interface Vector {
  x: number;
  y: number;
}
declare class Aabbox {
  left: number;
  top: number;
  right: number;
  bottom: number;
}
declare type PolygonV =
  | Omit<Polygon, 'vertices' | 'x' | 'y'>
  | Omit<Polygon, 'vertices' | 'colliders'>;
declare class Polygon {
  colliders: PolygonV[];
  aabbox: Aabbox;
  type: number;
  radius?: number;
  vertices: Vertice[];
  x = 0;
  y = 0;
}

interface Game_Temp {
  _doubleClicked: boolean;
}

// declare class Direction {
//   public static readonly DOWN_LEFT = 1;
//   public static readonly DOWN = 2;
//   public static readonly DOWN_RIGHT = 3;
//   public static readonly LEFT = 4;
//   public static readonly RIGHT = 6;
//   public static readonly UP_LEFT = 7;
//   public static readonly UP = 8;
//   public static readonly UP_RIGHT = 9;

//   public static isRight(d: unknown): void;
//   public static isDown(d): void;
//   public static isLeft(d): void;
//   public static fromVector(vx, vy): void;
//   public static normalize(vx, vy, length): void;
//   public static normalizeSquare(
//     vx,
//     vy,
//     length?: number | undefined,
//   ): {
//     x: number;
//     y: number;
//     l: any;
//   };
// }

// declare class Collider {
//   private static _sharedTile: Polygon;
//   public static CIRCLE: number;
//   public static POLYGON: number;
//   public static LIST: number;
//   public static PRECISION: number;
//   public static I_PRECISION: number;
//   public static PRESETS: any[];

//   public static addToList(list, collider): void;
//   public static getPreset(id): void;
//   public static createFromXML(xml): void;
//   public static createRect(x, y, width, height): void;
//   public static createLine(x1, y1, x2, y2): void;
//   public static createCircle(x, y, radius): void;
//   public static createPolygon(vertices): void;
//   public static createRegularPolygon(x, y, sx, sy, points): void;
//   public static null(): void;
//   public static sharedTile(): void;
//   public static sharedCircle(): void;
//   public static sharedCharacter(): void;
//   public static sharedAirship(): void;
//   public static sharedShip(): void;
//   public static sharedBoat(): void;
//   public static polygonsWithinColliderList(ax, ay, aabbox, bx, by, bc): void;
//   public static encaseCircleCircle(ax, ay, ac, bx, by, bc): void;
//   public static intersectCircleCircle(ax, ay, ac, bx, by, bc): void;
//   public static moveCircleCircle(ax, ay, ac, bx, by, bc, vector): void;
//   public static encaseCirclePolygon(ax, ay, ac, bx, by, bc): void;
//   public static intersectCirclePolygon(ax, ay, ac, bx, by, bc): void;
//   public static moveCirclePolygon(ax, ay, ac, bx, by, bc, vector): void;
//   public static encasePolygonCircle(bx, by, bc, ax, ay, ac): void;
//   public static intersectPolygonCircle(ax, ay, ac, bx, by, bc): void;
//   public static movePolygonCircle(ax, ay, ac, bx, by, bc, vector): void;
//   public static encasePolygonPolygon(ax, ay, ac, bx, by, bc): void;
//   public static intersectPolygonPolygon(ax, ay, ac, bx, by, bc): void;
//   public static movePolygonPolygon(ax, ay, ac, bx, by, bc, vector): void;
//   public static encase(ax, ay, ac, bx, by, bc): void;
//   public static intersect(ax, ay, ac, bx, by, bc): void;
//   public static move(ax, ay, ac, bx, by, bc, vector): void;
//   public static treeFromArray(colliders): void;
//   public static aabboxCheck(ax, ay, ac, bx, by, bc, vx?, vy?): void;
// }

// declare class CollisionMesh {
//   public static WALK: number;
//   public static BOAT: number;
//   public static SHIP: number;
//   public static AIRSHIP: number;
//   public static meshInMemory: { mapId: number | null; mesh: string[] };
//   public static getMesh(mapId, type): void;
//   public static addTileDCollisionObject(
//     x,
//     y,
//     object,
//     scale,
//     tileWidth,
//     tileHeight,
//     colliders,
//   ): void;
//   public static makeCollisionMesh(gameMap, passFunc): void;
// }

// type WaitMode =
//   | ''
//   | 'message'
//   | 'transfer'
//   | 'scroll'
//   | 'route'
//   | 'animation'
//   | 'balloon'
//   | 'gather'
//   | 'video'
//   | 'action'
//   | 'image'
//   | 'effect'
//   | 'movement'
//   | 'target';

//   class Game_Player extends Game_PlayerOrigin {
//     _collider: Collider;
//     _touchTarget: Game_Character | null;
//     public actionWidth(): number;
//     public actionHeight(): number;
//   }

//   class Game_Map extends Game_MapOrigin {
//     public directionX(ax, bx): number;
//     public directionY(ax, bx): number;
//     public collisionMesh(collisionType): void;
//     public getCharactersUnderPoint(x, y): void;
//     public getCharactersUnder(character, x, y): void;
//     public getTilesUnder(character, vx, vy): void;
//     public touchesCharacters(character, x, y): void;
//     public canMoveOn(character, x, y, collisionMesh): void;
//     public isAABBoxValid(x, y, aabbox): void;
//     public canWalk(character, x, y): boolean;
//     public getAABBoxTests(
//       character,
//       vx,
//       vy,
//     ): Array<{
//       x: number;
//       y: number;
//       aabbox: {
//         left: number;
//         top: number;
//         right: number;
//         bottom: number;
//       };
//       type: number;
//     }>;
//     public characters(): Game_Event[];
//   }
// }

// export { Collider, CollisionMesh, Direction, Polygon };
