/*
 * MIT License
 *
 * Copyright (c) 2017-2018 Altimit Community Contributors
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

//=============================================================================
// AltimitMovement.js
//=============================================================================
// Based on https://github.com/snaphat/AltimitMovement.js
//=============================================================================
// Typescript
// Fix double Show Choices following Show Text
// Fix lag left/up when speed is decimal
// Fix click/touch destination not resetting after transferring
// Enable collider in notes
// Added default "wall" preset collider as an example (1:1 square for player speed > 5 or just mapping)
//  - Can now use <col><ps>wall</ps></col>(or <col><ps>1</ps></col>) to use preset collider (instead of <collider><preset>wall</preset></collider>)
// seems that any event without images but with same as character priority will be a 1:1 square
// Fixed Game_Player regionId thanks to GaryCXJk code
// Removed obsolete plugin command from MV
// Added airship auto getOn when clicked/touched option in plugin parameters
// Example shapes available in plugin help
// Factorized code
//=============================================================================

/*:
 * @target MZ
 * @plugindesc Vector-based character movement and collision
 * @author Altimit Community Contributors
 * @url https://github.com/AltimitSystems/mv-plugins/tree/master/movement
 *
 * @param player
 * @text Player
 * @desc Parameters related to player character.
 *
 * @param player_collider_list
 * @text Collider
 * @desc Default collider list for player character.
 * @parent player
 * @type note
 * @default "<circle cx='0.5' cy='0.7' r='0.25' />"
 *
 * @param player_circular_movement
 * @text Normalize the movement?
 * @desc Should the diagonal movement be the same distance as the straight movement?
 * @parent player
 * @type boolean
 * @on Yes
 * @off No
 * @default true
 *
 * @param
 *
 * @param followers
 * @text Followers
 * @desc Parameters related to party followers.
 *
 * @param followers_distance
 * @text Follow distance
 * @desc Distance of 1 results in a tight chain. Distance of 2 will double the spacing.
 * @parent followers
 * @type number
 * @min 0
 * @decimals 2
 * @default 1.50
 *
 * @param followers_collider_list
 * @text Collider
 * @desc Default collider list for followers.
 * @parent followers
 * @type note
 * @default "<circle cx='0.5' cy='0.7' r='0.25' />"
 *
 * @param followers_circular_movement
 * @text Normalize the movement?
 * @desc Should the diagonal movement be the same distance as the straight movement?
 * @parent followers
 * @type boolean
 * @on Yes
 * @off No
 * @default true
 *
 * @param
 *
 * @param vehicles
 * @text Vehicles
 * @desc Parameters related to the vehicles.
 *
 * @param vehicles_boat_collider_list
 * @text Boat collider
 * @desc Default collider list for the boat.
 * @parent vehicles
 * @type note
 * @default "<circle cx='0.5' cy='0.5' r='0.333' />"
 *
 * @param vehicles_ship_collider_list
 * @text Ship collider
 * @desc Default collider list for the ship.
 * @parent vehicles
 * @type note
 * @default "<circle cx='0.5' cy='0.5' r='0.5' />"
 *
 * @param vehicles_airship_collider_list
 * @text Airship collider
 * @desc Default collider list for the airship.
 * @parent vehicles
 * @type note
 * @default "<circle cx='0.5' cy='0.5' r='0.25' />"
 *
 * @param
 *
 * @param event
 * @text Events
 * @desc Parameters related to events.
 *
 * @param event_character_collider_list
 * @text Character collider
 * @desc Default collider list for character events.
 * @parent event
 * @type note
 * @default "<circle cx='0.5' cy='0.7' r='0.25' />"
 *
 * @param event_tile_collider_list
 * @text Tile collider
 * @desc Default collider list for tile events.
 * @parent event
 * @type note
 * @default "<rect x='0' y='0' width='1' height='1' />"
 *
 * @param
 *
 * @param presets
 * @text Collider presets
 * @desc Preset colliders to be referenced by events.
 * @type note[]
 * @default ["\"<name>wall</name><rect x='0.0' y='0.0' width='1.0' height='1.0' />\""]
 *
 * @param
 *
 * @param move_route
 * @text Move route behaviour
 * @desc Parameters related to character move routes.
 *
 * @param move_route_align_grid
 * @text Align move-routes to grid?
 * @desc If character is offset on a tile align them to the tile grid when moving.
 * @parent move_route
 * @type boolean
 * @on Yes
 * @off No
 * @default true
 *
 * @param
 *
 * @param input_config
 * @text Input config
 * @desc Configuration for input method.
 *
 * @param input_config_enable_touch_mouse
 * @text Use touch/mouse?
 * @desc Enables pointer-based input.
 * @parent input_config
 * @type boolean
 * @on Yes
 * @off No
 * @default true
 *
 * @param input_config_gamepad_mode
 * @text Gamepad mode
 * @desc Gamepad analogue stick input control.
 * @parent input_config
 * @type select
 * @option Movement + Facing
 * @value 3
 * @option Movement only
 * @value 2
 * @option Facing only
 * @value 1
 * @option Disabled
 * @value 0
 * @default 3
 *
 * @param auto_board_airship
 * @text Get in airship on touch, or player action required
 * @desc Get in airship on touch
 * @parent input_config
 * @type boolean
 * @on Yes
 * @off No
 * @default false
 *
 * @param
 *
 * @param play_test
 * @text Play-testing
 * @desc Parameters when running in Play-test mode.
 *
 * @param play_test_collision_mesh_caching
 * @text Use cached collision?
 * @desc Disabled caching will re-compile the collision mesh for maps that are in-development.
 * @parent play_test
 * @type boolean
 * @on Yes
 * @off No
 * @default false
 *
 *
 * @help AltimitMovement.ts
 *
 *
 * Usage:
 *  Plugin will automatically apply when ON.
 *
 *
 * Shapes exemples:
 * Rectangle (this example makes a tile-sized square)
 * <rect x='0.0' y='0.0' width='1.0' height='1.0' />
 *
 * Circle (this example makes a tile-sized circle)
 * <circle cx='0.5' cy='0.5' r='0.5' />
 *
 * Line (this example makes a line from top-left to bottom-right)
 * <line x1='0' y1='0' x2='1' y2='1' />
 *
 * Polygon must be convex and clock-wise-winding (this example makes a triangle)
 * <polygon points='0.0,1.0 0.5,0.0 1.0,1.0' />
 *
 * Regular polygon (this example makes a 5-pointed polygon; a pentagon)
 * <regular cx='0.5' cy='0.5' rx='0.5' ry='0.5' p='5' />
 *
 * About:
 *  Version 0.50 Beta with typescript
 *  Website https://github.com/ve-lee/AltimitMovement-MZ
 * @end
 * =============================================================================
 * Plugin Commands
 * =============================================================================
 *
 * @command setPlayerCollider
 * @text Change Player Collider
 * @desc Change Player's Collider to another preset.
 *
 * @arg colliderPreset
 * @text Change To
 * @type text
 * @default 1
 * @desc Change the collider to this preset(Defined in plugin settings).
 * Numbers are treated as an index into the preset array. 0 is the default collider.
 * Text will find a collider with a matching Name field.
 *
 * @command setThisCollider
 * @text Change This Collider
 * @desc Change this event's Collider to another preset.
 *
 * @arg colliderPreset
 * @text Change To
 * @type text
 * @default 1
 * @desc Change the collider to this preset(Defined in plugin settings).
 * Numbers are treated as an index into the preset array. 0 is the default collider.
 * Text will find a collider with a matching Name field.
 *
 * @command setEventCollider
 * @text Change Event Collider
 * @desc Change an event's Collider to another preset.
 *
 * @arg eventId
 * @text Event
 * @type text
 * @default 1
 * @desc Enter the event name or the ID number.
 *
 * @arg colliderPreset
 * @text Change To
 * @type text
 * @default 1
 * @desc Change the collider to this preset(Defined in plugin settings).
 * Numbers are treated as an index into the preset array. 0 is the default collider.
 * Text will find a collider with a matching Name field.
 *
 * @command setVehicleCollider
 * @text Change Vehicle Collider
 * @desc Change a vehicle's Collider to another preset.
 *
 * @arg vehicleId
 * @text Vehicle
 * @type select
 * @option Boat
 * @value boat
 * @option Ship
 * @value ship
 * @option Airship
 * @value airship
 * @default boat
 * @desc Select the vehicle to change the collider for.
 *
 * @arg colliderPreset
 * @text Change To
 * @type text
 * @default 1
 * @desc Change the collider to this preset(Defined in plugin settings).
 * Numbers are treated as an index into the preset array. 0 is the default collider.
 * Text will find a collider with a matching Name field.
 *
 * @command setFollowerCollider
 * @text Change Follower Collider
 * @desc Change a Follower's Collider to another preset.
 *
 * @arg followerId
 * @text Follower
 * @type select
 * @option 1
 * @value 1
 * @option 2
 * @value 2
 * @option 3
 * @value 3
 * @default 1
 * @desc Select the follower to change the collider for.
 *
 * @arg colliderPreset
 * @text Change To
 * @type text
 * @default 1
 * @desc Change the collider to this preset(Defined in plugin settings).
 * Numbers are treated as an index into the preset array. 0 is the default collider.
 * Text will find a collider with a matching Name field.
 *
 *
 * @command setFollowersDistance
 * @text Change Followers Distance
 * @desc Change a Follower's follow distance from the player.
 *
 * @arg distance
 * @text Following Distance
 * @type number
 * @decimals 2
 * @default 0.25
 * @desc The follow distance in tiles.
 *
 * @command setFollowersFollow
 * @text Set Followers Can Follow
 * @desc Change if followers can follow the player.
 *
 * @arg followerId
 * @text Follower
 * @type select
 * @option 1
 * @value 1
 * @option 2
 * @value 2
 * @option 3
 * @value 3
 * @option All
 * @value all
 * @default 1
 * @desc Select the follower to change.
 *
 * @arg shouldFollow
 * @text Should Follow?
 * @type boolean
 * @on Follow
 * @off Don't Follow
 * @default true
 * @desc Select if the follower should follow the player.
 *
 * @command setMoveAlign
 * @text Change Move Route Alignment
 * @desc Change if move routes should align to the grid.
 *
 * @arg alignToGrid
 * @text Align To Grid?
 * @type boolean
 * @on Align To Grid
 * @off Don't Align To Grid
 * @default true
 * @desc Move route commands will align to the grid.
 *
 *
 * @command move
 * @text Move
 * @desc Do an advanced movement command
 *
 * @arg moveCommand
 * @text Move Command
 * @type struct<MoveStep>
 * @desc Enter advanced movement commands
 *
 * @arg wait
 * @text Wait For Completion
 * @type boolean
 * @on Yes
 * @off No
 * @default true
 * @desc Waits for all movement to finish
 *
 * @arg isSkippable
 * @text Skip If Cannot Move
 * @type boolean
 * @on Yes
 * @off No
 * @default false
 * @desc Skips any command that would move a character into an impassable location.
 *
 *
 * @command setTouchMouse
 * @text Change Touch/Mouse Input
 * @desc Change if Touch/Mouse Input is enabled.
 *
 * @arg value
 * @text Touch/Mouse Enabled
 * @type boolean
 * @default false
 * @desc Allows the player can move their character with mouse or touchscreen input.
 *
 * =============================================================================
 * Struct Definitions
 * =============================================================================
 */
/*~struct~MoveStep:
 *
 * @param mvr
 * @text Mover
 * @type select
 * @default this
 * @option Player
 * @value player
 * @option This
 * @value this
 * @option Event
 * @value event
 * @option Follower1
 * @value follower1
 * @option Follower2
 * @value follower2
 * @option Follower3
 * @value follower3
 * @option Boat
 * @value boat
 * @option Ship
 * @value ship
 * @option Airship
 * @value airship
 *
 * @desc Select what you want to move.
 * If you select event, also fill out the Mover Event Id field.
 *
 * @param dir
 * @text Direction
 * @type select
 * @default random
 * @option Random
 * @value random
 * @option ↑
 * @option ↗
 * @option →
 * @option ↘
 * @option ↓
 * @option ↙
 * @option ←
 * @option ↖
 * @option Forward
 * @value forward
 * @option Backward
 * @value backward
 * @option Away From Other
 * @value away
 * @option Towards Other
 * @value towards
 *
 * @param dist
 * @text Distance
 * @type number
 * @decimals 2
 * @default 1
 * @desc Distance to move in tiles. Or set to the text edge and the character will align to the current tiles edge.
 *
 * @param other
 * @text Other
 * @type select
 * @default player
 * @option Player
 * @value player
 * @option This
 * @value this
 * @option Event
 * @value event
 * @option Boat
 * @value boat
 * @option Ship
 * @value ship
 * @option Airship
 * @value airship
 *
 * @param moverEventId
 * @text Mover Event Id
 * @type text
 * @desc Id number or name of event to move. Mover must be set to Event or this will be ignored.
 *
 * @param otherEventId
 * @text Other Event Id
 * @type text
 * @desc Id number or name of event to move around. Direction must be set to Event or this will be ignored.
 */
(() => {
  const pluginName = 'AltimitMovement';
  const DOM_PARSER = new DOMParser();
  const PARAMETERS = PluginManager.parameters(pluginName);

  // const GAME_PAD_THRESHOLD = 1 / 5;
  // const GAME_PAD_LIMIT = 1 - GAME_PAD_THRESHOLD;

  /**
   * PLAYER
   */
  const playerColliderList = PARAMETERS['player_collider_list'];
  const PLAYER = {
    CIRCULAR_MOVEMENT: PARAMETERS['player_circular_movement'] != 'false',
    COLLIDER_LIST: playerColliderList
      ? '<collider>' + JSON.parse(playerColliderList) + '</collider>'
      : "<collider><circle cx='0.5' cy='0.7' r='0.25' /></collider>",
  };

  /**
   * FOLLOWERS
   */
  const followersColliderList = PARAMETERS['followers_collider_list'];
  const FOLLOWERS = {
    DISTANCE: Number(PARAMETERS['followers_distance']),
    CIRCULAR_MOVEMENT: PARAMETERS['followers_circular_movement'] != 'false',
    COLLIDER_LIST: followersColliderList
      ? '<collider>' + JSON.parse(followersColliderList) + '</collider>'
      : "<collider><circle cx='0.5' cy='0.7' r='0.25' /></collider>",
  };

  /**
   * VEHICLES
   */
  const boatColliderList = PARAMETERS['vehicles_boat_collider_list'];
  const shipColliderList = PARAMETERS['vehicles_ship_collider_list'];
  const airshipColliderList = PARAMETERS['vehicles_airship_collider_list'];

  const VEHICLES = {
    BOAT_COLLIDER_LIST: boatColliderList
      ? '<collider>' + JSON.parse(boatColliderList) + '</collider>'
      : "<collider><circle cx='0.5' cy='0.5' r='0.333' /></collider>",
    SHIP_COLLIDER_LIST: shipColliderList
      ? '<collider>' + JSON.parse(shipColliderList) + '</collider>'
      : "<collider><circle cx='0.5' cy='0.5' r='0.5' /></collider>",
    AIRSHIP_COLLIDER_LIST: airshipColliderList
      ? '<collider>' + JSON.parse(airshipColliderList) + '</collider>'
      : "<collider><circle cx='0.5' cy='0.5' r='0.25' /></collider>",
  };

  /**
   * EVENT
   */
  const characterColliderList = PARAMETERS['event_character_collider_list'];
  const titleColliderList = PARAMETERS['event_tile_collider_list'];
  const EVENT = {
    CHARACTER_COLLIDER_LIST: characterColliderList
      ? '<collider>' + JSON.parse(characterColliderList) + '</collider>'
      : "<collider><circle cx='0.5' cy='0.7' r='0.25' /></collider>",
    TILE_COLLIDER_LIST: titleColliderList
      ? '<collider>' + JSON.parse(titleColliderList) + '</collider>'
      : "<collider><rect x='0' y='0' width='1' height='1' /></collider>",
  };

  /**
   * PRESETS
   */
  const presets: string = PARAMETERS['presets'];
  const PRESETS: string[] = presets ? JSON.parse(presets) : [];

  const MOVE_ROUTE = {
    ALIGN_GRID: PARAMETERS['move_route_align_grid'] != 'false',
  };

  const INPUT_CONFIG = {
    ENABLE_TOUCH_MOUSE:
      PARAMETERS['input_config_enable_touch_mouse'] != 'false',
    GAMEPAD_MODE: parseInt(PARAMETERS['input_config_gamepad_mode']),
    AUTO_BOARD_VEHICLE: PARAMETERS['auto_board_airship'] != 'false',
  };

  const PLAY_TEST = {
    COLLISION_MESH_CACHING:
      PARAMETERS['play_test_collision_mesh_caching'] != 'false',
  };

  /**
   * Game_System
   */

  const Game_System_initialize = Game_System.prototype.initialize;
  Game_System.prototype.initialize = function () {
    Game_System_initialize.call(this);
    this._eventColliders = [];

    this._staticMoveAlignGrid = MOVE_ROUTE.ALIGN_GRID;
    this._moveAlignGrid = MOVE_ROUTE.ALIGN_GRID;

    this._staticFollowerDistance = FOLLOWERS.DISTANCE;
    this._followerDistance = FOLLOWERS.DISTANCE;

    this._staticEnableTouchMouse = INPUT_CONFIG.ENABLE_TOUCH_MOUSE;
    this._enableTouchMouse = INPUT_CONFIG.ENABLE_TOUCH_MOUSE;
  };

  /**
   * Game_Interpreter
   */

  const Game_Interpreter_updateWaitMode =
    Game_Interpreter.prototype.updateWaitMode;
  Game_Interpreter.prototype.updateWaitMode = function () {
    if (this._waitMode === 'target') {
      return this._character._moveTarget;
    }
    return Game_Interpreter_updateWaitMode.call(this);
  };

  /**
   * Extensions
   */

  Game_Interpreter.prototype.altMovementStringArgs = function (args) {
    if (Array.isArray(args)) return args;
    const str = args.split(' ');
    const stringArgs = [] as string[];
    let readingPart = false;
    let part = '';
    for (let ii = 0; ii < str.length; ii++) {
      if (str.charAt(ii) === ' ' && !readingPart) {
        stringArgs.push(part);
        part = '';
      } else {
        if (str.charAt(ii) === '"') {
          readingPart = !readingPart;
        }
        part += str.charAt(ii);
      }
    }
    stringArgs.push(part);
    return stringArgs;
  };

  Game_Interpreter.prototype.altMovementCommandToDirection = function (
    subject,
    command,
  ) {
    const gc = Game_Character;
    switch (command) {
      case gc.ROUTE_MOVE_DOWN:
        return 2;
      case gc.ROUTE_MOVE_LEFT:
        return 4;
      case gc.ROUTE_MOVE_RIGHT:
        return 6;
      case gc.ROUTE_MOVE_UP:
        return 8;
      case gc.ROUTE_MOVE_LOWER_L:
        return 1;
      case gc.ROUTE_MOVE_LOWER_R:
        return 3;
      case gc.ROUTE_MOVE_UPPER_L:
        return 7;
      case gc.ROUTE_MOVE_UPPER_R:
        return 9;
      case gc.ROUTE_MOVE_RANDOM:
        return 1 + Math.randomInt(8);
      case gc.ROUTE_MOVE_FORWARD:
        return subject._direction;
      case gc.ROUTE_MOVE_BACKWARD:
        return subject.reverseDir(subject._direction);
      default:
        return 5;
    }
  };

  Game_Interpreter.prototype.altMovementCharacterEdgeDxDy = function (
    subject: Game_Character,
    dx,
    dy,
  ) {
    let stepDistance;
    const box = subject.collider().aabbox;
    if (dx && dy) {
      let xd;
      if (dx < 0) {
        const px = subject.x + box.left;
        xd = Math.floor(px) - px;
      } else {
        const px = subject.x + box.right;
        xd = Math.ceil(px) - px;
      }
      let yd;
      if (dy < 0) {
        const py = subject.y + box.top;
        yd = Math.floor(py) - py;
      } else {
        const py = subject.y + box.bottom;
        yd = Math.ceil(py) - py;
      }

      stepDistance = xd < yd ? xd : yd;
    } else if (dx) {
      if (dx < 0) {
        const px = subject.x + box.left;
        stepDistance = Math.floor(px) - px;
      } else {
        const px = subject.x + box.right;
        stepDistance = Math.ceil(px) - px;
      }
    } else {
      if (dy < 0) {
        const py = subject.y + box.top;
        stepDistance = Math.floor(py) - py;
      } else {
        const py = subject.y + box.bottom;
        stepDistance = Math.ceil(py) - py;
      }
    }
    return stepDistance;
  };

  Game_Interpreter.prototype.altMovementProcessMoveCommand = function (
    subject,
    command,
    distance,
    options,
    object,
  ) {
    $gameMap.refreshIfNeeded();
    this._character = subject;
    if (options.wait) {
      this.setWaitMode('target');
    }
    subject._moveTargetSkippable = options.skip;
    subject._moveTarget = true;

    if (object) {
      let dx = object.x - subject.x;
      let dy = object.y - subject.y;
      const length = Math.sqrt(dx * dx + dy * dy);
      dx /= length;
      dy /= length;

      let stepDistance;
      if ('edge' == distance) {
        stepDistance = this.altMovementCharacterEdgeDxDy(subject, dx, dy);
      } else {
        stepDistance = Number(distance);
      }

      if (command == Game_Character.ROUTE_MOVE_AWAY) {
        stepDistance *= -1;
      }

      subject._moveTargetX = subject.x + dx * stepDistance;
      subject._moveTargetY = subject.y + dy * stepDistance;
    } else {
      const direction = this.altMovementCommandToDirection(subject, command);
      const dx = Direction.isLeft(direction)
        ? -1
        : Direction.isRight(direction)
        ? 1
        : 0;
      const dy = Direction.isUp(direction)
        ? -1
        : Direction.isDown(direction)
        ? 1
        : 0;

      let stepDistance;
      if ('edge' == distance) {
        stepDistance = this.altMovementCharacterEdgeDxDy(subject, dx, dy);
      } else {
        stepDistance = Number(distance);
      }

      subject._moveTargetX = subject.x + dx * stepDistance;
      subject._moveTargetY = subject.y + dy * stepDistance;
    }
  };

  Game_Interpreter.prototype.altMovementMoveCharacter = function (args) {
    args = this.altMovementStringArgs(args);

    const subject = this.altMovementGetTargetCharacter(args[1]);
    const command = this.altMovementGetMoveCommand(args[2]);
    let options = {
      wait: args[4] == 'wait' || args[5] == 'wait',
      skip:
        args[4] == 'skip' ||
        args[5] == 'skip' ||
        args[4] == 'skippable' ||
        args[5] == 'skippable',
    };
    switch (command) {
      case Game_Character.ROUTE_MOVE_AWAY:
      case Game_Character.ROUTE_MOVE_TOWARD:
        const object = this.altMovementGetTargetCharacter(args[3]);
        options = {
          wait: args[5] == 'wait' || args[6] == 'wait',
          skip:
            args[5] == 'skip' ||
            args[6] == 'skip' ||
            args[5] == 'skippable' ||
            args[6] == 'skippable',
        };
        this.altMovementProcessMoveCommand(
          subject,
          command,
          args[4],
          options,
          object,
        );
        break;
      default:
        this.altMovementProcessMoveCommand(subject, command, args[3], options);
        break;
    }
  };

  Game_Interpreter.prototype.altMovementCollider = function (args) {
    args = this.altMovementStringArgs(args);

    switch (args[1]) {
      case 'set':
        this.altMovementColliderSet(args);
        break;
    }
  };

  Game_Interpreter.prototype.altMovementColliderSet = function (args) {
    const target = this.altMovementGetTargetCharacter(args[2]);
    if (!target) {
      return;
    }

    const presetIndex = Number(args[3]);
    if (isNaN(presetIndex)) {
      target.setCollider(
        Collider.getPreset(args[3].substring(1, args[3].length - 1)),
      );
      target._hasCustomCollider = true;
    } else {
      target.setCollider(Collider.getPreset(presetIndex));
      target._hasCustomCollider = true;
    }
  };

  Game_Interpreter.prototype.altMovementGetMoveCommand = function (cmdStr) {
    switch (cmdStr) {
      case 'down_left':
      case 'bottom_left':
      case 'lower_left':
      case 'lower_l':
      case 'left_down':
      case 'left_bottom':
      case 'left_lower':
      case 'l_lower':
      case 'south_west':
      case 'west_south':
      case '1':
      case '↙':
        return Game_Character.ROUTE_MOVE_LOWER_L;
      case 'down':
      case 'bottom':
      case 'lower':
      case 'south':
      case '2':
      case '↓':
        return Game_Character.ROUTE_MOVE_DOWN;
      case 'down_right':
      case 'bottom_right':
      case 'lower_right':
      case 'lower_r':
      case 'right_down':
      case 'right_bottom':
      case 'right_lower':
      case 'r_lower':
      case 'south_east':
      case 'east_south':
      case '3':
      case '↘':
        return Game_Character.ROUTE_MOVE_LOWER_R;
      case 'left':
      case 'west':
      case '4':
      case '←':
        return Game_Character.ROUTE_MOVE_LEFT;
      case 'right':
      case 'east':
      case '6':
      case '→':
        return Game_Character.ROUTE_MOVE_RIGHT;
      case 'up_left':
      case 'top_left':
      case 'upper_left':
      case 'upper_l':
      case 'left_up':
      case 'left_top':
      case 'left_upper':
      case 'l_upper':
      case 'north_west':
      case 'west_north':
      case '7':
      case '↖':
        return Game_Character.ROUTE_MOVE_UPPER_L;
      case 'up':
      case 'top':
      case 'upper':
      case 'north':
      case '8':
      case '↑':
        return Game_Character.ROUTE_MOVE_UP;
      case 'up_right':
      case 'top_right':
      case 'upper_right':
      case 'upper_r':
      case 'right_up':
      case 'right_top':
      case 'right_upper':
      case 'r_upper':
      case 'north_east':
      case 'east_north':
      case '9':
      case '↗':
        return Game_Character.ROUTE_MOVE_UPPER_R;
      case 'away':
      case 'away_from':
        return Game_Character.ROUTE_MOVE_AWAY;
      case 'toward':
      case 'towards':
      case 'toward_to':
        return Game_Character.ROUTE_MOVE_TOWARD;
      case 'forward':
      case 'forwards':
        return Game_Character.ROUTE_MOVE_FORWARD;
      case 'backward':
      case 'backwards':
      case 'back':
        return Game_Character.ROUTE_MOVE_BACKWARD;
      case 'random':
      case 'randomly':
        return Game_Character.ROUTE_MOVE_RANDOM;
      default:
        return null;
    }
  };

  Game_Interpreter.prototype.altMovementGetTargetCharacter = function (target) {
    if (target.startsWith('"') && target.endsWith('"')) {
      // Event name
      const eventName = target.substring(1, target.length - 1);
      for (let ii = 0; ii < $dataMap.events.length; ii++) {
        if ($dataMap.events?.[ii]?.name === eventName) {
          return $gameMap.event($dataMap.events[ii]?.id);
        }
      }
    } else {
      // System name
      switch (target) {
        case 'this':
          const eventId = this._eventId;
          // This Event ID #
          return $gameMap.event(eventId);
        case 'player':
          return $gamePlayer;
        case 'boat':
          return $gameMap.boat();
        case 'ship':
          return $gameMap.ship();
        case 'airship':
          return $gameMap.airship();
        default:
          if (target.startsWith('follower')) {
            const index = Number(target.substring(8));
            // Follower index
            return $gamePlayer.followers().follower(index);
          } else {
            const eventId = Number(target);
            // Event ID #
            return $gameMap.event(eventId);
          }
      }
    }
    return null;
  };

  /**
   * Game_CharacterBase
   */

  Game_CharacterBase.prototype.continueProcessMoveCommand = function () {
    if (!this._moveTarget) return;
    let dx = $gameMap.directionX(this._x, this._moveTargetX);
    let dy = $gameMap.directionY(this._y, this._moveTargetY);
    const length = Math.sqrt(dx * dx + dy * dy);
    if (length <= this.stepDistance) {
      this._moveTarget = false;
      this._moveTargetSkippable = false;
      this.setDirectionFix(this._wasDirectionFixed);
      this._x = $gameMap.roundX(this._moveTargetX);
      this._y = $gameMap.roundY(this._moveTargetY);
    } else {
      dx /= length;
      dy /= length;
      this.moveVector(dx * this.stepDistance, dy * this.stepDistance);
      if (!this.isMovementSucceeded()) {
        if (
          this._moveTargetSkippable ||
          (!!this._moveRoute && this._moveRoute.skippable)
        ) {
          this._moveTarget = false;
          this._moveTargetSkippable = false;
          this.setDirectionFix(this._wasDirectionFixed);
        }
      }
    }
  };

  Game_CharacterBase.prototype.isOnLadder = function () {
    const aabbox = this.collider().aabbox;
    if (aabbox.left >= 0 && aabbox.right <= 1) {
      // To use ladder the bounding box must fit on a tile
      return false;
    }
    // If middle is on ladder
    if (
      !$gameMap.isLadder(
        $gameMap.roundX(this._x + (aabbox.left + aabbox.right) / 2),
        $gameMap.roundY(this._y + (aabbox.top + aabbox.bottom) / 2),
      )
    ) {
      // If bottom middle is on ladder
      if (
        $gameMap.isLadder(
          $gameMap.roundX(this._x + (aabbox.left + aabbox.right) / 2),
          $gameMap.roundY(this._y + aabbox.bottom),
        )
      ) {
        return true;
      }
    }
    return false;
  };

  Game_CharacterBase.prototype.moveStraight = function (d) {
    let vy = Direction.isUp(d) ? -1 : Direction.isDown(d) ? 1 : 0;
    let vx = Direction.isLeft(d) ? -1 : Direction.isRight(d) ? 1 : 0;
    if (this._circularMovement) {
      const length = Math.sqrt(vx * vx + vy * vy);
      vx /= length;
      vy /= length;
    }
    this.moveVector(vx * this.stepDistance, vy * this.stepDistance);
  };

  Game_CharacterBase.prototype.moveDiagonally = function (horz, vert) {
    let vy = Direction.isUp(vert) ? -1 : Direction.isDown(vert) ? 1 : 0;
    let vx = Direction.isLeft(horz) ? -1 : Direction.isRight(horz) ? 1 : 0;
    if (this._circularMovement) {
      const length = Math.sqrt(vx * vx + vy * vy);
      vx /= length;
      vy /= length;
    }
    this.moveVector(vx * this.stepDistance, vy * this.stepDistance);
  };

  const Game_CharacterBase_isMoving = Game_CharacterBase.prototype.isMoving;
  Game_CharacterBase.prototype.isMoving = function () {
    return Game_CharacterBase_isMoving.call(this) || this._isMoving;
  };

  const Game_CharacterBase_updateAnimation =
    Game_CharacterBase.prototype.updateAnimation;
  Game_CharacterBase.prototype.updateAnimation = function () {
    Game_CharacterBase_updateAnimation.call(this);
    this._wasMoving = this._isMoving;
    this._isMoving = this._x !== this._realX || this._y !== this._realY;
    if (!this._isMoving) {
      this.refreshBushDepth();
    }
  };

  Game_CharacterBase.prototype.isOnBush = function () {
    const aabbox = this.collider().aabbox;
    // If middle is in bush
    if (
      $gameMap.isBush(
        $gameMap.roundX(this._x + (aabbox.left + aabbox.right) / 2),
        $gameMap.roundY(this._y + (aabbox.top + aabbox.bottom) / 2),
      )
    ) {
      // If bottom middle is in bush
      if (
        $gameMap.isBush(
          $gameMap.roundX(this._x + (aabbox.left + aabbox.right) / 2),
          $gameMap.roundY(this._y + aabbox.bottom),
        )
      ) {
        return true;
      }
    }
    return false;
  };

  Game_CharacterBase.prototype.canPass = function (x, y, d) {
    if (this.isThrough() || this.isDebugThrough()) {
      return true;
    }

    const x2 = $gameMap.roundXWithDirection(x, d);
    const y2 = $gameMap.roundYWithDirection(y, d);
    if (!$gameMap.canWalk(this, x2, y2)) {
      return false;
    }

    return true;
  };

  Game_CharacterBase.prototype.canPassDiagonally = function (x, y, horz, vert) {
    if (this.isThrough() || this.isDebugThrough()) {
      return true;
    }

    const x2 = $gameMap.roundXWithDirection(x, horz);
    const y2 = $gameMap.roundYWithDirection(y, vert);
    if (!$gameMap.canWalk(this, x2, y2)) {
      return false;
    }

    return true;
  };

  const Game_CharacterBase_setDirection =
    Game_CharacterBase.prototype.setDirection;
  Game_CharacterBase.prototype.setDirection = function (d) {
    Game_CharacterBase_setDirection.call(this, d);
    this._direction8 = this._direction;
  };

  const Game_CharacterBase_screenX = Game_CharacterBase.prototype.screenX;
  Game_CharacterBase.prototype.screenX = function () {
    const round = Math.round;
    Math.round = Math.floor;
    const val = Game_CharacterBase_screenX.call(this);
    Math.round = round;
    return val;
  };

  const Game_CharacterBase_screenY = Game_CharacterBase.prototype.screenY;
  Game_CharacterBase.prototype.screenY = function () {
    const round = Math.round;
    Math.round = Math.floor;
    const val = Game_CharacterBase_screenY.call(this);
    Math.round = round;
    return val;
  };

  /**
   * Extensions
   */

  Object.defineProperties(Game_CharacterBase.prototype, {
    stepDistance: {
      get: function () {
        return this.distancePerFrame();
      },
      configurable: true,
    },
  });

  Game_CharacterBase.prototype.collidableWith = function (character) {
    if (!character) return false;
    if (character === this) return false;
    if (!this.isNormalPriority() || !character.isNormalPriority()) return false;
    if (this.isThrough()) return false;
    if (character instanceof Game_Follower && !character.isVisible())
      return false;
    if (character instanceof Game_Followers && !character.isVisible())
      return false;
    if (this instanceof Game_Player) {
      if (this.vehicle() === character) return false;
      if (character instanceof Game_Follower) {
        if (this.followers().contains(character)) return false;
      }
    }
    if (!(character instanceof Game_Follower)) {
      if (character.isThrough()) return false;
    }
    if (this instanceof Game_Follower) {
      if (character instanceof Game_Follower) return false;
      if (character instanceof Game_Player) return false;
    }
    if (this instanceof Game_Vehicle) {
      if (character instanceof Game_Player) return false;
      if (character instanceof Game_Follower) return false;
    }
    if (character instanceof Game_Vehicle) {
      if (character._mapId !== $gameMap.mapId()) return false;
    }
    return true;
  };

  function getLoopMapCorrection(vector: Vector, loopMap: number) {
    if (loopMap == 1) {
      vector.x += $gameMap.width();
    } else if (loopMap == 2) {
      vector.x -= $gameMap.width();
    } else if (loopMap == 3) {
      vector.y += $gameMap.height();
    } else if (loopMap == 4) {
      vector.y -= $gameMap.height();
    } else if (loopMap == 5) {
      vector.x += $gameMap.width();
      vector.y += $gameMap.height();
    } else if (loopMap == 6) {
      vector.x -= $gameMap.width();
      vector.y += $gameMap.height();
    } else if (loopMap == 7) {
      vector.x += $gameMap.width();
      vector.y -= $gameMap.height();
    } else if (loopMap == 8) {
      vector.x -= $gameMap.width();
      vector.y -= $gameMap.height();
    }
    return vector;
  }

  Game_CharacterBase.prototype.moveVectorCharacters = function (
    characters,
    move,
  ) {
    characters.forEach((character) => {
      const characterVector = { x: character._x, y: character._y };
      const moveVector = getLoopMapCorrection(
        characterVector,
        character.loopMap,
      );
      const characterX = moveVector.x;
      const characterY = moveVector.y;

      move = Collider.move(
        this._x,
        this._y,
        this.collider(),
        characterX,
        characterY,
        character.collider(),
        move,
      );
      if (move.x === 0 && move.y === 0) {
        return move;
      }
    });
    return move;
  };

  Game_CharacterBase.prototype.moveVectorMap = function (
    bboxTests: Polygon[],
    move,
    vx,
    vy,
  ) {
    for (let ii = 0; ii < bboxTests.length; ii++) {
      const moveVector = getLoopMapCorrection(
        { x: 0, y: 0 },
        bboxTests[ii].type,
      );
      const offsetX = moveVector.x;
      const offsetY = moveVector.y;

      const mapColliders = Collider.polygonsWithinColliderList(
        bboxTests[ii].x + vx,
        bboxTests[ii].y + vy,
        bboxTests[ii].aabbox,
        offsetX,
        offsetY,
        $gameMap.collisionMesh(this._collisionType),
      );
      if (mapColliders.length > 0) {
        if (move.x !== 0) {
          let sigMove = { x: move.x, y: 0 };
          mapColliders.forEach((mapCollider) => {
            sigMove = Collider.move(
              this._x,
              this._y,
              this.collider(),
              offsetX,
              offsetY,
              mapCollider,
              sigMove,
            );
          });
          move.x = sigMove.x;
        }
        mapColliders.forEach((mapCollider) => {
          move = Collider.move(
            this._x,
            this._y,
            this.collider(),
            offsetX,
            offsetY,
            mapCollider,
            move,
          );
        });
      }
    }
    return move;
  };

  function getMapMove(
    x: number,
    y: number,
    aabbox: Aabbox,
    vector: Vector,
  ): Vector {
    const move = { x: 0, y: 0 };

    if (!$gameMap.isLoopHorizontal() && x + vector.x + aabbox.left < 0) {
      move.x = 0 - (x + aabbox.left);
    } else if (
      !$gameMap.isLoopHorizontal() &&
      x + vector.x + aabbox.right > $gameMap.width()
    ) {
      move.x = $gameMap.width() - (x + aabbox.right);
    } else {
      move.x = vector.x;
    }

    if (!$gameMap.isLoopVertical() && y + vector.y + aabbox.top < 0) {
      move.y = 0 - (y + aabbox.top);
    } else if (
      !$gameMap.isLoopVertical() &&
      y + vector.y + aabbox.bottom > $gameMap.height()
    ) {
      move.y = $gameMap.height() - (y + aabbox.bottom);
    } else {
      move.y = vector.y;
    }
    return move;
  }

  Game_CharacterBase.prototype.testMove = function (vx, vy) {
    let characterCollided = false;
    if (this.isThrough() || this.isDebugThrough()) {
      return {
        characterCollided,
        move: getMapMove(this._x, this._y, this.collider().aabbox, {
          x: vx,
          y: vy,
        }),
      };
    }
    const bboxTests = $gameMap.getAABBoxTests(this, vx, vy);
    // Gather any solid characters within the movement bounding box
    const characters = $gameMap.characters(false).filter((character) => {
      if (this.collidableWith(character)) {
        for (let ii = 0; ii < bboxTests.length; ii++) {
          if (
            Collider.aabboxCheck(
              bboxTests[ii].x,
              bboxTests[ii].y,
              bboxTests[ii].aabbox,
              character._x,
              character._y,
              character.collider().aabbox,
              vx,
              vy,
            )
          ) {
            character.loopMap = bboxTests[ii].type;
            return true;
          }
        }
      }
      return false;
    });

    const move = { x: vx, y: vy };

    // Test collision with characters
    this.moveVectorCharacters(characters, move);

    // Test collision with map
    this.moveVectorMap(bboxTests, move, vx, vy);
    if (move.x !== vx || move.y !== vy) {
      // Collided with character, disable direction change
      characterCollided = true;
    }

    // Resolve too much precision
    move.x = Math.round(move.x * Collider.PRECISION) / Collider.PRECISION;
    move.y = Math.round(move.y * Collider.PRECISION) / Collider.PRECISION;

    // Special ladder behaviour
    if (
      this.isOnLadder() &&
      (this instanceof Game_Player ? !this.isInAirship() : true)
    ) {
      const tileX = Math.round(this._x);
      if (!$gameMap.isPassable(tileX, this._y + move.y, Direction.LEFT)) {
        if (!$gameMap.isPassable(tileX, this._y + move.y, Direction.RIGHT)) {
          move.x = tileX - this._x;
        }
      }
    }

    return {
      move,
      characterCollided,
    };
  };

  Game_CharacterBase.prototype.moveVector = function (vx, vy) {
    const { move, characterCollided } = this.testMove(vx, vy);

    const length = Math.sqrt(move.x * move.x + move.y * move.y);
    if (length > Collider.I_PRECISION) {
      this._x = $gameMap.roundX(this._x + move.x);
      this._y = $gameMap.roundY(this._y + move.y);

      this._realX = this._x - move.x;
      this._realY = this._y - move.y;
      this.setMovementSuccess(true);
      if (characterCollided) {
        this.setDirectionVector(vx, vy);
      } else {
        this.setDirectionVector(move.x, move.y);
      }
      this.increaseSteps();
      this._isMoving = true;

      this.checkEventTriggerTouchFrontVector(move.x, move.y);
    } else {
      this.setMovementSuccess(false);
      this.setDirectionVector(vx, vy);
      this._isMoving = false;

      this.checkEventTriggerTouchFrontVector(vx, vy);
    }
  };

  function direction8FromDirection(direction: number) {
    const direction8 = Math.round((direction + 1) * 4) % 8; // 8 directions
    switch (direction8) {
      case 0:
        return Direction.LEFT;
      case 1:
        return Direction.UP_LEFT;
      case 2:
        return Direction.UP;
      case 3:
        return Direction.UP_RIGHT;
      case 4:
        return Direction.RIGHT;
      case 5:
        return Direction.DOWN_RIGHT;
      case 6:
        return Direction.DOWN;
      case 7:
        return Direction.DOWN_LEFT;
      default:
        return 0;
    }
  }

  function directionFromAngle(direction: number) {
    if (direction >= -0.2 && direction < 0.2) {
      // East
      return Direction.RIGHT;
    } else if (direction >= 0.3 && direction < 0.7) {
      // South
      return Direction.DOWN;
    } else if (direction >= -0.7 && direction < -0.3) {
      // North
      return Direction.UP;
    } else if (direction >= -1.2 && direction < -0.8) {
      // West
      return Direction.LEFT;
    } else if (direction >= 0.8 && direction < 1.2) {
      // West
      return Direction.LEFT;
    }
    return undefined;
  }

  function directionFromDirectionVector(
    direction: rm.types.Direction,
    vector: Vector,
  ) {
    const dx = vector.x > 0 ? Direction.RIGHT : vector.x ? Direction.LEFT : 0;
    const dy = vector.y > 0 ? Direction.DOWN : vector.y ? Direction.UP : 0;
    if (dx && dy) {
      if (direction === Game_CharacterBase.prototype.reverseDir(dx)) {
        return dx;
      } else if (direction === Game_CharacterBase.prototype.reverseDir(dy)) {
        return dy;
      } else {
      }
    } else {
      return dx || dy;
    }
  }

  Game_CharacterBase.prototype.setDirectionVector = function (vx, vy) {
    if (this.isDirectionFixed()) {
      return;
    }
    const direction = Math.atan2(vy, vx) / Math.PI;
    const direct = directionFromAngle(direction);
    if (direct) {
      this.setDirection(direct);
    } else {
      const direction2 = directionFromDirectionVector(this._direction, {
        x: vx,
        y: vy,
      });
      if (!direction2) this.resetStopCount();
      if (direction2) this.setDirection(direction2);
    }
    this._direction8 = direction8FromDirection(direction);
  };

  Game_CharacterBase.prototype.checkEventTriggerTouchFrontVector = function (
    vx,
    vy,
  ) {
    this.checkEventTriggerTouch(this._x + vx, this._y + vy);
  };

  Game_CharacterBase.prototype.regionId = function () {
    if (this._collider !== undefined) {
      return $gameMap.regionId(
        this._x + (this._collider as Polygon)?.x || 0,
        this._y + (this._collider as Polygon)?.y || 0,
      );
    }
    return $gameMap.regionId(this._x, this._y);
  };

  Game_CharacterBase.prototype.align = function () {
    this._x = this._x | 0;
    this._y = this._y | 0;
  };

  Game_CharacterBase.prototype.collider = function () {
    return this._collider || Collider.sharedTile();
  };

  Game_CharacterBase.prototype.setCollider = function (collider) {
    this._collider = collider;
  };

  Game_CharacterBase.prototype.direction8 = function () {
    return this._direction8;
  };

  /**
   * Game_Character
   */

  Game_Character.prototype.updateRoutineMove = function () {
    if (this._moveTarget) {
      this.continueProcessMoveCommand();
      const moveRoute = this._moveRoute;
      if (!moveRoute.skippable || this._wasMoving) {
        return;
      }
    }
    if (this._waitCount > 0) {
      this._waitCount--;
    } else {
      this.setMovementSuccess(true);
      const command = this._moveRoute.list[this._moveRouteIndex];
      if (command) {
        this.processMoveCommand(command);
        this.continueProcessMoveCommand();
        this.advanceMoveRouteIndex();
      }
    }
  };

  Game_Character.prototype.moveRandom = function () {
    if (this._moveTarget) {
      return;
    }

    const d = 1 + Math.randomInt(8);
    const vx = Direction.isLeft(d) ? -1 : Direction.isRight(d) ? 1 : 0;
    const vy = Direction.isUp(d) ? -1 : Direction.isDown(d) ? 1 : 0;

    this.setDirectionVector(vx, vy);
    this._moveTarget = true;
    this._moveTargetSkippable = true;
    this._moveTargetX = Math.round(this.x + vx);
    this._moveTargetY = Math.round(this.y + vy);
  };

  Game_Character.prototype.moveTowardCharacter = function (character) {
    let vx = character.x - this.x;
    let vy = character.y - this.y;
    const length = Math.sqrt(vx * vx + vy * vy);
    if (length > this.stepDistance) {
      this.setDirectionVector(vx, vy);
      vx /= length;
      vy /= length;
      this._moveTarget = true;
      this._moveTargetSkippable = true;
      this._moveTargetX = Math.round(this.x + vx);
      this._moveTargetY = Math.round(this.y + vy);
    }
  };

  Game_Character.prototype.moveAwayFromCharacter = function (character) {
    let vx = character.x - this.x;
    let vy = character.y - this.y;
    const length = Math.sqrt(vx * vx + vy * vy);
    this.setDirectionVector(-vx, -vy);
    vx /= length;
    vy /= length;
    this._moveTarget = true;
    this._moveTargetSkippable = true;
    this._moveTargetX = Math.round(this.x - vx);
    this._moveTargetY = Math.round(this.y - vy);
  };

  const Game_Character_processMoveCommand =
    Game_Character.prototype.processMoveCommand;
  Game_Character.prototype.processMoveCommand = function (command) {
    const gc = Game_Character;
    switch (command.code) {
      case gc.ROUTE_MOVE_DOWN:
        this._moveTarget = true;
        this._moveTargetX = this._x;
        this._moveTargetY = this._y + 1;
        break;
      case gc.ROUTE_MOVE_LEFT:
        this._moveTarget = true;
        this._moveTargetX = this._x - 1;
        this._moveTargetY = this._y;
        break;
      case gc.ROUTE_MOVE_RIGHT:
        this._moveTarget = true;
        this._moveTargetX = this._x + 1;
        this._moveTargetY = this._y;
        break;
      case gc.ROUTE_MOVE_UP:
        this._moveTarget = true;
        this._moveTargetX = this._x;
        this._moveTargetY = this._y - 1;
        break;
      case gc.ROUTE_MOVE_LOWER_L:
        this._moveTarget = true;
        this._moveTargetX = this._x - 1;
        this._moveTargetY = this._y + 1;
        break;
      case gc.ROUTE_MOVE_LOWER_R:
        this._moveTarget = true;
        this._moveTargetX = this._x + 1;
        this._moveTargetY = this._y + 1;
        break;
      case gc.ROUTE_MOVE_UPPER_L:
        this._moveTarget = true;
        this._moveTargetX = this._x - 1;
        this._moveTargetY = this._y - 1;
        break;
      case gc.ROUTE_MOVE_UPPER_R:
        this._moveTarget = true;
        this._moveTargetX = this._x + 1;
        this._moveTargetY = this._y - 1;
        break;
      case gc.ROUTE_MOVE_FORWARD:
        this._wasDirectionFixed = this.isDirectionFixed();
        this.setDirectionFix(true);
        let vx = Direction.isLeft(this._direction)
          ? -1
          : Direction.isRight(this._direction)
          ? 1
          : 0;
        let vy = Direction.isUp(this._direction)
          ? -1
          : Direction.isDown(this._direction)
          ? 1
          : 0;
        this._moveTarget = true;
        this._moveTargetX = this._x + vx;
        this._moveTargetY = this._y + vy;
        break;
      case gc.ROUTE_MOVE_BACKWARD:
        this._wasDirectionFixed = this.isDirectionFixed();
        this.setDirectionFix(true);
        vx = Direction.isLeft(this._direction)
          ? -1
          : Direction.isRight(this._direction)
          ? 1
          : 0;
        vy = Direction.isUp(this._direction)
          ? -1
          : Direction.isDown(this._direction)
          ? 1
          : 0;
        this._moveTarget = true;
        this._moveTargetX = this._x - vx;
        this._moveTargetY = this._y - vy;
        break;
      default:
        Game_Character_processMoveCommand.call(this, command);
        break;
    }

    if ($gameSystem._staticMoveAlignGrid !== MOVE_ROUTE.ALIGN_GRID) {
      $gameSystem._staticMoveAlignGrid = MOVE_ROUTE.ALIGN_GRID;
      $gameSystem._moveAlignGrid = MOVE_ROUTE.ALIGN_GRID;
    }

    if (this._moveTarget && $gameSystem._moveAlignGrid) {
      this._moveTargetX = Math.round(this._moveTargetX);
      this._moveTargetY = Math.round(this._moveTargetY);
    }
  };

  /**
   * Game_Player
   */

  const Game_Player_initMembers = Game_Player.prototype.initMembers;
  Game_Player.prototype.initMembers = function () {
    Game_Player_initMembers.call(this);
    this._collider = Collider.createFromXML(PLAYER.COLLIDER_LIST);
    this._circularMovement = PLAYER.CIRCULAR_MOVEMENT;
  };

  Game_Player.prototype.checkEventTriggerTouch =
    Game_CharacterBase.prototype.checkEventTriggerTouch;

  const Game_Player_encounterProgressValue =
    Game_Player.prototype.encounterProgressValue;
  Game_Player.prototype.encounterProgressValue = function () {
    return this.stepDistance * Game_Player_encounterProgressValue.call(this);
  };

  const Game_Player_clearTransferInfo = Game_Player.prototype.clearTransferInfo;
  Game_Player.prototype.clearTransferInfo = function () {
    Game_Player_clearTransferInfo.call(this);
    this._moveTarget = false;
    this._moveTargetSkippable = false;
    this._touchTarget = null;
  };

  const TouchInput_SetupEventHandlers = TouchInput._setupEventHandlers;
  TouchInput._setupEventHandlers = function () {
    document.addEventListener('dblclick', () => {
      $gameTemp._doubleClicked = true;
    });
    TouchInput_SetupEventHandlers.call(this);
  };

  const Game_Player_updateDashing = Game_Player.prototype.updateDashing;
  Game_Player.prototype.updateDashing = function () {
    if ($gameTemp._doubleClicked) {
      this._dashing = true;
      return;
    }
    Game_Player_updateDashing.call(this);
  };

  Game_Player.prototype.update = function (sceneActive) {
    const lastScrolledX = this.scrolledX();
    const lastScrolledY = this.scrolledY();
    const wasMoving = this._wasMoving;
    this.updateDashing();
    if (sceneActive) {
      this.moveByInput();
    }
    Game_Character.prototype.update.call(this);
    this.updateScroll(lastScrolledX, lastScrolledY);
    this.updateVehicle();
    if (!this._isMoving) {
      this.updateNonmoving(wasMoving, sceneActive);
    }
    this._followers.update();
  };

  Game_Player.prototype.getInputDirection = function () {
    return Input.dir8;
  };

  function getTouchedCharacter() {
    const touchedCharacters = $gameMap
      .getCharactersUnderPoint(
        $gameTemp.destinationX(),
        $gameTemp.destinationY(),
      )
      .filter(function (character) {
        // Filter out events that player cannot reach
        return !(
          character instanceof Game_Event &&
          character._eventId &&
          !character.isNormalPriority()
        );
      });

    // Check if we're touching an interactable
    if (touchedCharacters.contains($gamePlayer)) {
      // Only touched player, action time
      return $gamePlayer;
    }
    if (
      touchedCharacters.contains($gameMap.airship()) &&
      $gameMap.airship()._mapId === $gameMap.mapId()
    ) {
      return $gameMap.airship();
    }
    if (
      touchedCharacters.contains($gameMap.ship()) &&
      $gameMap.ship()._mapId === $gameMap.mapId()
    ) {
      return $gameMap.ship();
    }
    if (
      touchedCharacters.contains($gameMap.boat()) &&
      $gameMap.boat()._mapId === $gameMap.mapId()
    ) {
      return $gameMap.boat();
    }

    // Only care about events now
    return touchedCharacters.find(function (character) {
      return (
        character instanceof Game_Event &&
        !!character._eventId &&
        character._trigger === 0
      );
    });
  }

  Game_Player.prototype.moveByInputTouch = function () {
    if ($gameSystem._enableTouchMouse && $gameTemp.isDestinationValid()) {
      const characterTarget = getTouchedCharacter();
      if (characterTarget === $gamePlayer) {
        if (this.isInVehicle()) {
          this.getOffVehicle();
          return;
        }
        if (!this.getOnVehicle()) {
          this.checkEventTriggerHere([0]);
          return;
        }
      }

      // Move toward destination
      this._touchTarget =
        characterTarget ??
        new Point(
          $gameTemp.destinationX() - 0.5,
          $gameTemp.destinationY() - 0.5,
        );
      $gameTemp.clearDestination();
    }

    if (!this._touchTarget) {
      $gameTemp._doubleClicked = false;
      return;
    }
    let dx = $gameMap.directionX(this._x, this._touchTarget.x);
    let dy = $gameMap.directionY(this._y, this._touchTarget.y);

    const length = Math.sqrt(dx * dx + dy * dy);
    if (length <= this.stepDistance) {
      if (
        this._touchTarget instanceof Game_Vehicle &&
        INPUT_CONFIG.AUTO_BOARD_VEHICLE
      ) {
        this.getOnVehicle();
      }
      this._touchTarget = null;
    }
    dx /= length;
    dy /= length;
    if (this._circularMovement) {
      this.moveVector(dx * this.stepDistance, dy * this.stepDistance);
    } else {
      const vector = Direction.normalizeSquare(dx, dy);
      this.moveVector(
        vector.x * this.stepDistance,
        vector.y * this.stepDistance,
      );
    }
    if (Math.abs(dx) > Math.abs(dy)) {
      this.setDirectionVector(dx, 0);
    } else {
      this.setDirectionVector(0, dy);
    }
    if (this.isOnLadder()) {
      this.setDirection(8);
    }

    // Can't move any more, so stop walking
    if (this.isMovementSucceeded()) {
      return;
    }
    // if it's a character
    if (this._touchTarget instanceof Game_CharacterBase) {
      const collider = this._touchTarget.collider();
      // Touching a character, check if we've reached it
      const rx = dx * this.stepDistance;
      const ry = dy * this.stepDistance;
      if (
        Collider.intersect(
          this._touchTarget.x,
          this._touchTarget.y,
          collider,
          this._x + rx,
          this._y + ry,
          this.collider(),
        )
      ) {
        let vehicle;
        if (this._touchTarget instanceof Game_Event) {
          this._touchTarget.start();
          this._touchTarget = null;
          return;
        } else if (this._touchTarget === $gameMap.airship()) {
          vehicle = $gameMap.airship();
          this._vehicleType = 'airship';
          this._collisionType = CollisionMesh.AIRSHIP;
        } else if (this._touchTarget === $gameMap.ship()) {
          vehicle = $gameMap.ship();
          this._vehicleType = 'ship';
          this._collisionType = CollisionMesh.SHIP;
        } else if (this._touchTarget === $gameMap.boat()) {
          vehicle = $gameMap.boat();
          this._vehicleType = 'boat';
          this._collisionType = CollisionMesh.BOAT;
        }

        if (vehicle) {
          this._vehicleGettingOn = true;
          vehicle._passengerCollider = this.collider();
          this._collider = vehicle.collider();

          const dx = $gameMap.directionX(this._x, vehicle._x);
          const dy = $gameMap.directionY(this._y, vehicle._y);

          const wasThrough = this.isThrough();
          this.setThrough(true);
          this.moveVector(dx, dy);
          this.setThrough(wasThrough);
          this.gatherFollowers();
        }
      } else if (!!this._touchTarget) {
        // Check if our target can only be reached by action
        if (!this.getOnVehicle()) {
          this.checkEventTriggerThere([0]);
        }
      }
    }
    // path is block
    this._touchTarget = null;
  };

  Game_Player.prototype.moveByInput = function () {
    if (
      $gameSystem._staticEnableTouchMouse != INPUT_CONFIG.ENABLE_TOUCH_MOUSE
    ) {
      $gameSystem._staticEnableTouchMouse = INPUT_CONFIG.ENABLE_TOUCH_MOUSE;
      $gameSystem._enableTouchMouse = INPUT_CONFIG.ENABLE_TOUCH_MOUSE;
    }
    if (this.isMoving() || !this.canMove()) return;
    if (this._moveTarget) {
      this._touchTarget = null;
    }

    // this.moveByInputGamePad();
    const direction = this.getInputDirection();
    if (direction > 0) {
      // Regular movement
      this.executeMove(direction);
      this._touchTarget = null;
    } else {
      // Touch movement
      this.moveByInputTouch();
    }
  };

  Game_Player.prototype.checkEventTriggerHere = function (triggers) {
    if (!this.canStartLocalEvents()) return;
    const collider = this.collider();
    const bboxTests = $gameMap.getAABBoxTests(this);

    const vx = Direction.isLeft(this._direction)
      ? -this.stepDistance
      : Direction.isRight(this._direction)
      ? this.stepDistance
      : 0;
    const vy = Direction.isUp(this._direction)
      ? -this.stepDistance
      : Direction.isDown(this._direction)
      ? this.stepDistance
      : 0;

    // Gather any solid characters within the "here" bounding box
    const events = $gameMap.events().filter(function (event) {
      for (let ii = 0; ii < bboxTests.length; ii++) {
        if (event.isTriggerIn(triggers)) {
          if (event.isNormalPriority()) {
            if (
              Collider.aabboxCheck(
                bboxTests[ii].x + vx,
                bboxTests[ii].y + vy,
                bboxTests[ii].aabbox,
                event._x,
                event._y,
                event.collider().aabbox,
              )
            ) {
              event.loopMap = bboxTests[ii].type;
              return true;
            }
          } else {
            if (
              Collider.aabboxCheck(
                bboxTests[ii].x,
                bboxTests[ii].y,
                bboxTests[ii].aabbox,
                event._x,
                event._y,
                event.collider().aabbox,
              )
            ) {
              event.loopMap = bboxTests[ii].type;
              return true;
            }
          }
        }
      }
      return false;
    });

    // Test collision with characters
    for (let ii = 0; ii < events.length; ii++) {
      const eventVector = { x: events[ii]._x, y: events[ii]._y };
      const moveVector = getLoopMapCorrection(eventVector, events[ii].loopMap);
      const entryX = moveVector.x;
      const entryY = moveVector.y;

      if (
        events[ii].isNormalPriority() &&
        Collider.intersect(
          this._x + vx,
          this._y + vy,
          collider,
          entryX,
          entryY,
          events[ii].collider(),
        )
      ) {
        // Normal priority player-touch/event-touch
        events[ii].start();
        this._touchTarget = null;
      } else if (events[ii]._trigger === 2) {
        // Event touch is encasing
        if (
          Collider.encase(
            entryX,
            entryY,
            events[ii].collider(),
            this._x,
            this._y,
            collider,
          ) ||
          Collider.encase(
            this._x,
            this._y,
            collider,
            entryX,
            entryY,
            events[ii].collider(),
          )
        ) {
          events[ii].start();
        }
      } else if (
        Collider.intersect(
          this._x,
          this._y,
          collider,
          entryX,
          entryY,
          events[ii].collider(),
        )
      ) {
        events[ii].start();
      }
    }
  };

  Game_Player.prototype.checkEventTriggerThere = function (triggers) {
    if (!this.canStartLocalEvents()) return;
    const vx = Direction.isLeft(this._direction)
      ? -this.actionWidth()
      : Direction.isRight(this._direction)
      ? this.actionWidth()
      : 0;
    const vy = Direction.isUp(this._direction)
      ? -this.actionHeight()
      : Direction.isDown(this._direction)
      ? this.actionHeight()
      : 0;

    const collider = this.collider();
    const bboxTests = $gameMap.getAABBoxTests(this, vx, vy);

    // Gather any solid characters within the "there" bounding box
    const gameMapEventsThere = $gameMap.events().filter(function (event) {
      for (let ii = 0; ii < bboxTests.length; ii++) {
        if (
          event.isTriggerIn(triggers) &&
          event.isNormalPriority() &&
          Collider.aabboxCheck(
            bboxTests[ii].x,
            bboxTests[ii].y,
            bboxTests[ii].aabbox,
            event._x,
            event._y,
            event.collider().aabbox,
          )
        ) {
          event.loopMap = bboxTests[ii].type;
          return true;
        }
      }
      return false;
    });

    // Test collision with characters
    for (let ii = 0; ii < gameMapEventsThere.length; ii++) {
      const eventVector = {
        x: gameMapEventsThere[ii]._x,
        y: gameMapEventsThere[ii]._y,
      };
      const moveVector = getLoopMapCorrection(
        eventVector,
        gameMapEventsThere[ii].loopMap,
      );
      const entryX = moveVector.x;
      const entryY = moveVector.y;

      if (gameMapEventsThere[ii]._trigger === 2) {
        // Event touch is encasing
        if (
          Collider.encase(
            this._x + vx,
            this._y + vy,
            collider,
            entryX,
            entryY,
            gameMapEventsThere[ii].collider(),
          ) ||
          Collider.encase(
            entryX,
            entryY,
            gameMapEventsThere[ii].collider(),
            this._x + vx,
            this._y + vy,
            collider,
          )
        ) {
          gameMapEventsThere[ii].start();
        }
      } else if (
        Collider.intersect(
          this._x + vx,
          this._y + vy,
          collider,
          entryX,
          entryY,
          gameMapEventsThere[ii].collider(),
        )
      ) {
        gameMapEventsThere[ii].start();
      }
    }

    if ($gameMap.isAnyEventStarting()) return;
    // Check for counters
    let events = [] as Game_Event[];
    const tiles = $gameMap.getTilesUnder(this, vx, vy);
    for (let ii = 0; ii < tiles.length; ii++) {
      if ($gameMap.isCounter(tiles[ii][0], tiles[ii][1])) {
        const x3 = $gameMap.roundXWithDirection(tiles[ii][0], this._direction);
        const y3 = $gameMap.roundYWithDirection(tiles[ii][1], this._direction);

        // Gather any solid characters within the "over counter" bounding box
        events = events.concat(
          $gameMap.events().filter(function (event) {
            if (
              event.isTriggerIn(triggers) &&
              event.isNormalPriority() &&
              Collider.aabboxCheck(
                x3,
                y3,
                Collider.sharedTile().aabbox,
                event._x,
                event._y,
                event.collider().aabbox,
              )
            ) {
              return true;
            }
            return false;
          }),
        );
      }
    }

    if (events.length === 0) {
      return;
    }

    let closest;
    let dist = Number.POSITIVE_INFINITY;
    for (let ii = 0; ii < events.length; ii++) {
      const entryX = events[ii]._x;
      const entryY = events[ii]._y;

      const dx = this._x - entryX;
      const dy = this._y - entryY;
      const td = dx * dx + dy * dy;
      if (td < dist) {
        dist = td;
        closest = events[ii];
        closest.start();
      }
    }
  };

  Game_Player.prototype.startMapEvent = function (x, y, triggers, normal) {
    if ($gameMap.isEventRunning()) return;
    $gameMap.eventsXy(x, y).forEach(function (event) {
      if (event.isTriggerIn(triggers) && event.isNormalPriority() === normal) {
        event.start();
      }
    });
  };

  Game_Player.prototype.moveStraight = function (d) {
    Game_Character.prototype.moveStraight.call(this, d);
  };

  Game_Player.prototype.moveDiagonally = function (horz, vert) {
    Game_Character.prototype.moveDiagonally.call(this, horz, vert);
  };

  Game_Player.prototype.getOnVehicle = function () {
    const vx = Direction.isLeft(this._direction)
      ? -0.5
      : Direction.isRight(this._direction)
      ? 0.5
      : 0;
    const vy = Direction.isUp(this._direction)
      ? -0.5
      : Direction.isDown(this._direction)
      ? 0.5
      : 0;
    const bboxTests = $gameMap.getAABBoxTests(this, vx, vy);

    let vehicle;
    const airship = $gameMap.airship();
    const ship = $gameMap.ship();
    const boat = $gameMap.boat();

    for (let ii = 0; ii < bboxTests.length; ii++) {
      if (
        !!airship &&
        airship._mapId === $gameMap.mapId() &&
        Collider.aabboxCheck(
          bboxTests[ii].x,
          bboxTests[ii].y,
          bboxTests[ii].aabbox,
          airship._x,
          airship._y,
          airship.collider().aabbox,
        )
      ) {
        this._vehicleType = 'airship';
        this._collisionType = CollisionMesh.AIRSHIP;
        vehicle = airship;
        break;
      }
      if (
        !!ship &&
        ship._mapId === $gameMap.mapId() &&
        Collider.aabboxCheck(
          bboxTests[ii].x,
          bboxTests[ii].y,
          bboxTests[ii].aabbox,
          ship._x,
          ship._y,
          ship.collider().aabbox,
        )
      ) {
        this._vehicleType = 'ship';
        this._collisionType = CollisionMesh.SHIP;
        vehicle = ship;
        break;
      }
      if (
        !!boat &&
        boat._mapId === $gameMap.mapId() &&
        Collider.aabboxCheck(
          bboxTests[ii].x,
          bboxTests[ii].y,
          bboxTests[ii].aabbox,
          boat._x,
          boat._y,
          boat.collider().aabbox,
        )
      ) {
        this._vehicleType = 'boat';
        this._collisionType = CollisionMesh.BOAT;
        vehicle = boat;
        break;
      }
    }

    if (vehicle && this.isInVehicle()) {
      this._vehicleGettingOn = true;
      vehicle._passengerCollider = this.collider();
      this._collider = vehicle.collider();

      const dx = $gameMap.directionX(this._x, vehicle._x);
      const dy = $gameMap.directionY(this._y, vehicle._y);

      const wasThrough = this.isThrough();
      this.setThrough(true);
      this.moveVector(dx, dy);
      this.setThrough(wasThrough);
      this.gatherFollowers();
    }

    return this._vehicleGettingOn;
  };

  Game_Player.prototype.getOffVehicle = function () {
    if (!this.vehicle().isLandOk(this.x, this.y, this.direction()))
      return this._vehicleGettingOff;
    if (this.isInAirship()) {
      this.setDirection(2);
    }

    const vhx = this.vehicle().x;
    const vhy = this.vehicle().y;
    const vhd = this.vehicle().direction();
    for (const follower of this._followers._data) {
      follower._x = vhx;
      follower._y = vhy;
      follower._realX = vhx;
      follower._realY = vhy;
      follower.setDirection(vhd);
    }

    this._followers.synchronize(
      this.vehicle().x,
      this.vehicle().y,
      this.vehicle().direction(),
    );
    this.vehicle().getOff();

    if (!this.isInAirship()) {
      const vehicleBox = this.vehicle().collider().aabbox;
      const passengerBox = this.vehicle()._passengerCollider.aabbox;
      const d = this.direction();

      // Get disembark direction
      let vx;
      if (Direction.isLeft(d)) {
        vx = Math.floor((-passengerBox.right + vehicleBox.left) * 64) / 64;
      } else if (Direction.isRight(d)) {
        vx = Math.ceil((vehicleBox.right - passengerBox.left) * 64) / 64;
      } else {
        vx = 0;
      }
      let vy;
      if (Direction.isUp(d)) {
        vy = Math.floor((-passengerBox.bottom + vehicleBox.top) * 64) / 64;
      } else if (Direction.isDown(d)) {
        vy = Math.ceil((vehicleBox.bottom - passengerBox.top) * 64) / 64;
      } else {
        vy = 0;
      }

      this.setThrough(true);
      this.moveVector(vx, vy);
      this.setThrough(false);

      this.setTransparent(false);
    }

    this._vehicleGettingOff = true;
    this.setMoveSpeed(4);
    this.setThrough(false);
    this.makeEncounterCount();
    this.gatherFollowers();
    return this._vehicleGettingOff;
  };

  Game_Player.prototype.updateVehicleGetOff = function () {
    if (
      !(
        !this.areFollowersGathering() &&
        this.vehicle().isLowest() &&
        this._collisionType !== CollisionMesh.WALK
      )
    )
      return;
    this._collider = this.vehicle()._passengerCollider;
    this.vehicle()._passengerCollider = undefined;
    this._collisionType = CollisionMesh.WALK;
    this._vehicleGettingOff = false;
    this._vehicleType = 'walk';
    this.setTransparent(false);
  };

  /**
   * Extensions
   */

  Game_Player.prototype.actionWidth = function () {
    const bbox = this.collider().aabbox;
    const width = bbox.right - bbox.left;
    return width < 1 ? width : 1;
  };

  Game_Player.prototype.actionHeight = function () {
    const bbox = this.collider().aabbox;
    const height = bbox.bottom - bbox.top;
    return height < 1 ? height : 1;
  };

  /**
   * Game_Follower
   */

  Game_Follower.prototype.initMembers = function () {
    Game_Character.prototype.initMembers.call(this);
    this._collider = Collider.createFromXML(FOLLOWERS.COLLIDER_LIST);
    this._isFrozen = false;
    this._circularMovement = FOLLOWERS.CIRCULAR_MOVEMENT;
  };

  Game_Follower.prototype.chaseCharacter = function (character) {
    if (this._moveTarget || this._isFrozen) {
      return;
    }

    const displayWidth = Graphics.width / $gameMap.tileWidth();
    const displayHeight = Graphics.height / $gameMap.tileHeight();

    const aabbox = this.collider().aabbox;
    const width = aabbox.right - aabbox.left;
    const height = aabbox.bottom - aabbox.top;

    const ax = this._x + (aabbox.left + aabbox.right) / 2;
    const ay = this._y + (aabbox.top + aabbox.bottom) / 2;

    // Teleportation
    const midX = $gameMap.canvasToMapX(Graphics.width / 2);
    const dmX = $gameMap.directionX(ax, midX);
    if (dmX > displayWidth + width) {
      // Off left edge
      const tx = $gameMap.canvasToMapX(0) - width;
      if ($gameMap.canWalk(this, tx, this._y)) {
        this.setPosition(tx, this._y);
      }
    } else if (dmX < -displayWidth - width) {
      // Off right edge
      const tx = $gameMap.canvasToMapX(Graphics.width) + width;
      if ($gameMap.canWalk(this, tx, this._y)) {
        this.setPosition(tx, this._y);
      }
    }
    const midY = $gameMap.canvasToMapY(Graphics.height / 2);
    const dmY = $gameMap.directionY(ay, midY);
    if (dmY > displayHeight + height) {
      // Off top edge
      const ty = $gameMap.canvasToMapY(0) - height;
      if ($gameMap.canWalk(this, this._x, ty)) {
        this.setPosition(this._x, ty);
      }
    } else if (dmY < -displayHeight - height) {
      // Off bottom edge
      const ty = $gameMap.canvasToMapY(Graphics.height) + height;
      if ($gameMap.canWalk(this, this._x, ty)) {
        this.setPosition(this._x, ty);
      }
    }

    const characterBox = character.collider().aabbox;
    const cWidth = characterBox.right - characterBox.left;
    const cHeight = characterBox.bottom - characterBox.top;

    const bx = character._x + (characterBox.left + characterBox.right) / 2;
    const by = character._y + (characterBox.top + characterBox.bottom) / 2;

    let dx = $gameMap.directionX(ax, bx);
    let dy = $gameMap.directionY(ay, by);

    const distance = Math.sqrt(dx * dx + dy * dy);
    const radius =
      this.collider().type === Collider.CIRCLE
        ? this.collider().radius || 0 // VELEE:
        : (width > height ? width : height) / 2;
    const characterRadius =
      character.collider().type === Collider.CIRCLE
        ? character.collider().radius || 0 // VELEE:
        : (cWidth > cHeight ? cWidth : cHeight) / 2;

    if (distance > (radius + characterRadius) * $gameSystem._followerDistance) {
      // Chase if far away
      this.setMoveSpeed(character.realMoveSpeed());
      this.setThrough($gamePlayer.isThrough() || $gamePlayer.isDebugThrough());

      if (distance > 2) {
        dx /= distance;
        dy /= distance;
      }

      if (this._circularMovement) {
        this.moveVector(dx * this.stepDistance, dy * this.stepDistance);
      } else {
        const vector = Direction.normalizeSquare(dx, dy);
        this.moveVector(
          vector.x * this.stepDistance,
          vector.y * this.stepDistance,
        );
      }

      this.setThrough(true);
    }

    if (this.isOnLadder()) {
      this.setDirection(8);
    } else if (!this._wasMoving) {
      const adx = Math.abs(dx);
      const ady = Math.abs(dy);
      if (adx > ady) {
        this.setDirectionVector(dx, 0);
      } else if (ady > adx) {
        this.setDirectionVector(0, dy);
      }
    }
  };

  /**
   * Extensions
   */

  Game_Follower.prototype.setFrozen = function (frozen) {
    this._isFrozen = frozen;
  };

  /**
   * Game_Followers
   */

  Game_Followers.prototype.update = function () {
    if (this.areGathering()) {
      const direction = $gamePlayer.direction();
      const visibleFollowers = this.visibleFollowers();
      for (let ii = 0; ii < visibleFollowers.length; ii++) {
        const follower = visibleFollowers[ii];

        let dx = $gameMap.directionX(follower._x, this._targetX);
        let dy = $gameMap.directionY(follower._y, this._targetY);

        const distance = Math.sqrt(dx * dx + dy * dy);
        dx /= distance;
        dy /= distance;

        follower.setThrough(true);
        follower.moveVector(
          dx * follower.stepDistance,
          dy * follower.stepDistance,
        );
        follower.setThrough(false);
        follower.setDirection(direction);
      }

      if (this.areGathered()) {
        this._gathering = false;
      }
    } else {
      this.updateMove();
    }
    this.visibleFollowers().forEach(function (follower) {
      follower.update();
    }, this);

    if ($gameSystem._staticFollowerDistance != FOLLOWERS.DISTANCE) {
      $gameSystem._staticFollowerDistance = FOLLOWERS.DISTANCE;
      $gameSystem._followerDistance = FOLLOWERS.DISTANCE;
    }
  };

  Game_Followers.prototype.gather = function () {
    this._gathering = true;
    this._targetX = $gamePlayer._x;
    this._targetY = $gamePlayer._y;
  };

  Game_Followers.prototype.areGathered = function () {
    let screenRadius =
      Math.sqrt(
        Graphics.width * Graphics.width + Graphics.height * Graphics.height,
      ) / 2;
    screenRadius /=
      Math.sqrt(
        $gameMap.tileWidth() * $gameMap.tileWidth() +
          $gameMap.tileHeight() * $gameMap.tileHeight(),
      ) / 2;

    const visibleFollowers = this.visibleFollowers();
    for (let ii = 0; ii < visibleFollowers.length; ii++) {
      const follower = visibleFollowers[ii];

      const dx = $gameMap.directionX(follower._realX, this._targetX);
      const dy = $gameMap.directionY(follower._realY, this._targetY);

      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance > screenRadius) {
        // Don't count if off screen
        continue;
      } else if (distance > follower.stepDistance) {
        return false;
      } else {
        follower._x = this._targetX;
        follower._y = this._targetY;
        follower._realX = this._targetX;
        follower._realY = this._targetY;
      }
    }
    return true;
  };

  /**
   * Extensions
   */

  Game_Followers.prototype.contains = function (item) {
    return this._data.indexOf(item) >= 0;
  };

  /**
   * Game_Vehicle
   */

  const Game_Vehicle_initialize = Game_Vehicle.prototype.initialize;
  Game_Vehicle.prototype.initialize = function (type) {
    Game_Vehicle_initialize.call(this, type);

    if (this.isAirship()) {
      this._collider = Collider.createFromXML(VEHICLES.AIRSHIP_COLLIDER_LIST);
    } else if (this.isShip()) {
      this._collider = Collider.createFromXML(VEHICLES.SHIP_COLLIDER_LIST);
    } else if (this.isBoat()) {
      this._collider = Collider.createFromXML(VEHICLES.BOAT_COLLIDER_LIST);
    } else {
      this._collider = Collider.sharedCharacter();
    }
  };

  Game_Vehicle.prototype.isLandOk = function (x, y, d) {
    if (this.isAirship()) {
      $gamePlayer._collider = this._passengerCollider; // Reset colliders temporarily
      // Check rough tiles under colliders
      const tiles = $gameMap
        .getTilesUnder(this)
        .concat($gameMap.getTilesUnder($gamePlayer));
      let canWalk = true;
      for (let ii = 0; ii < tiles.length; ii++) {
        if (!$gameMap.isAirshipLandOk(tiles[ii][0], tiles[ii][1])) {
          canWalk = false;
          break;
        }
      }
      if (
        canWalk &&
        ($gameMap.touchesCharacters(this, x, y) ||
          $gameMap.touchesCharacters($gamePlayer, x, y))
      ) {
        canWalk = false;
      }
      $gamePlayer._collider = this.collider(); // Undo player collider reset
      return canWalk;
    } else {
      const vehicleBox = this.collider().aabbox;
      const passengerBox = this._passengerCollider.aabbox;

      // Get disembark direction
      // const tw = $gameMap.tileWidth();
      // const th = $gameMap.tileHeight();
      let vx;
      if (Direction.isLeft(d)) {
        vx = Math.floor((-passengerBox.right + vehicleBox.left) * 64) / 64;
      } else if (Direction.isRight(d)) {
        vx = Math.ceil((vehicleBox.right - passengerBox.left) * 64) / 64;
      } else {
        vx = 0;
      }
      let vy;
      if (Direction.isUp(d)) {
        vy = Math.floor((-passengerBox.bottom + vehicleBox.top) * 64) / 64;
      } else if (Direction.isDown(d)) {
        vy = Math.ceil((vehicleBox.bottom - passengerBox.top) * 64) / 64;
      } else {
        vy = 0;
      }

      const reverseDirection = this.reverseDir(d);
      $gamePlayer._collider = this._passengerCollider; // Reset colliders temporarily

      // Check rough tiles under player
      const tiles = $gameMap.getTilesUnder($gamePlayer, vx, vy);
      let canWalk = true;
      for (let ii = 0; ii < tiles.length; ii++) {
        if (
          !$gameMap.isAABBoxValid(tiles[ii][0], tiles[ii][1], vehicleBox) ||
          !$gameMap.isAABBoxValid(tiles[ii][0], tiles[ii][1], passengerBox)
        ) {
          canWalk = false;
          break;
        } else if (
          !$gameMap.isPassable(tiles[ii][0], tiles[ii][1], reverseDirection)
        ) {
          canWalk = false;
          break;
        }
      }

      if (canWalk && $gameMap.touchesCharacters($gamePlayer, x + vx, y + vy)) {
        canWalk = false;
      }
      $gamePlayer._collider = this.collider(); // Undo player collider reset
      return canWalk;
    }
  };

  /**
   * Game_Event
   */

  const Game_Event_setupPageSettings = Game_Event.prototype.setupPageSettings;
  Game_Event.prototype.setupPageSettings = function () {
    Game_Event_setupPageSettings.call(this);
    this.collider();
  };

  const Game_Event_start = Game_Event.prototype.start;
  Game_Event.prototype.start = function () {
    if (this._lastFrame === Graphics.frameCount) {
      return;
    }
    Game_Event_start.call(this);
    this._lastFrame = Graphics.frameCount + 1;
  };

  Game_Event.prototype.getStoredCollider = function () {
    const mapId = $gameMap.mapId();
    if (!$gameSystem._eventColliders[mapId]) return undefined;
    return $gameSystem._eventColliders[mapId][this.eventId()] || undefined;
  };

  function getColliderPreset(collider: Document | '') {
    if (collider instanceof Node) {
      const preset = collider.querySelectorAll('preset, ps');
      if (preset.length > 0) {
        return Collider.getPreset(preset[0].innerHTML?.trim() || '');
      }
    }
    return undefined;
  }

  Game_Event.prototype.getNoteCollider = function () {
    const note = this.event().note;
    if (note === '') return undefined;
    const noteCollider = xmlParser(note);
    const preset = getColliderPreset(noteCollider);
    if (preset !== undefined) return preset;
    return Collider.createFromXML(xmlParser(note));
  };

  Game_Event.prototype.getCommentCollider = function () {
    const comments = this.page()
      .list.filter((l) => l.code === 108 || l.code === 408)
      .map((l) => l.parameters[0]);

    if (comments.length > 0) {
      const commentNode = xmlParser('<doc>' + comments.join('\n') + '</doc>');
      const preset = getColliderPreset(commentNode);
      if (preset !== undefined) return preset;
      if (commentNode instanceof Node) {
        return Collider.createFromXML(commentNode.innerHTML);
      }
      return Collider.null();
    }
  };

  Game_Event.prototype.getPresetCollider = function () {
    const dataEvent = $dataMap.events[this.eventId()];
    const presetId = dataEvent ? dataEvent.meta.collider : null;
    if (presetId) {
      const asNum = +presetId;
      if (isNaN(asNum)) {
        return Collider.getPreset(presetId.trim());
      } else {
        return Collider.getPreset(asNum);
      }
    }
  };

  Game_Event.prototype.getDefaultCollider = function () {
    if (this.isTile() || !this.characterName() || this.isObjectCharacter()) {
      return Collider.createFromXML(EVENT.TILE_COLLIDER_LIST);
    }
    return Collider.createFromXML(EVENT.CHARACTER_COLLIDER_LIST);
  };

  Game_Event.prototype.collider = function () {
    const page = this.page();
    if (!page) return Collider.null();
    page._collider =
      page._collider ||
      this.getStoredCollider() ||
      this.getNoteCollider() ||
      this.getCommentCollider();

    this._hasCustomCollider = !!page._collider;

    if (!page._collider) {
      page._collider = this.getDefaultCollider();
    }
    return page._collider;
  };

  Game_Event.prototype.setCollider = function (collider) {
    const pages = this.event().pages;
    for (let ii = 0; ii < pages.length; ii++) {
      pages[ii]._collider = collider;
    }
    $gameSystem._eventColliders[$gameMap.mapId()][this.eventId()] = collider;
  };

  Game_Event.prototype.checkEventTriggerTouch = function (x, y) {
    if (
      !(
        this._trigger === 2 &&
        !$gameMap.isEventRunning() &&
        !this.isJumping() &&
        this.isNormalPriority()
      )
    )
      return;
    const bboxTests = $gameMap.getAABBoxTests(this, x - this._x, y - this._y);
    let loopMap = -1;
    for (let ii = 0; ii < bboxTests.length; ii++) {
      if (
        Collider.aabboxCheck(
          bboxTests[ii].x,
          bboxTests[ii].y,
          bboxTests[ii].aabbox,
          $gamePlayer._x,
          $gamePlayer._y,
          $gamePlayer.collider().aabbox,
        )
      ) {
        loopMap = bboxTests[ii].type;
        break;
      }
    }

    if (loopMap < 0) {
      return;
    }

    const playerVector = { x: $gamePlayer._x, y: $gamePlayer._y };
    const moveVector = getLoopMapCorrection(playerVector, loopMap);
    const playerX = moveVector.x;
    const playerY = moveVector.y;

    if (
      Collider.intersect(
        x,
        y,
        this.collider(),
        playerX,
        playerY,
        $gamePlayer.collider(),
      )
    ) {
      this.start();
    }
  };

  /**
   * Game_Interpreter
   */

  const Game_Interpreter_command101 = Game_Interpreter.prototype.command101;
  Game_Interpreter.prototype.command101 = function (params?: string[]) {
    $gamePlayer._touchTarget = null;
    return Game_Interpreter_command101.call(this, params);
  };

  /**
   * Game_Map
   */

  const Game_Map_setup = Game_Map.prototype.setup;
  Game_Map.prototype.setup = function (mapId) {
    Game_Map_setup.call(this, mapId);
    if ($gameSystem._eventColliders[mapId]) return;
    $gameSystem._eventColliders[mapId] = [];
  };

  Game_Map.prototype.tileId = function (x, y, z) {
    x = x | 0;
    y = y | 0;
    const width = $dataMap.width;
    const height = $dataMap.height;
    return $dataMap.data[(z * height + y) * width + x] || 0;
  };

  Game_Map.prototype.canvasToMapX = function (x) {
    const tileWidth = this.tileWidth();
    const originX = this._displayX * tileWidth;
    const mapX = (originX + x) / tileWidth;
    return this.roundX(mapX);
  };

  Game_Map.prototype.canvasToMapY = function (y) {
    const tileHeight = this.tileHeight();
    const originY = this._displayY * tileHeight;
    const mapY = (originY + y) / tileHeight;
    return this.roundY(mapY);
  };

  /**
   * Extensions
   */

  Game_Map.prototype.directionX = function (ax, bx) {
    if (this.isLoopHorizontal()) {
      const dxA = bx - ax;
      const dxB = bx - this.width() - ax;
      const dxC = bx + this.width() - ax;
      const dx = Math.abs(dxA) < Math.abs(dxB) ? dxA : dxB;
      return Math.abs(dx) < Math.abs(dxC) ? dx : dxC;
    } else {
      return bx - ax;
    }
  };

  Game_Map.prototype.directionY = function (ay, by) {
    if (this.isLoopVertical()) {
      const dyA = by - ay;
      const dyB = by - this.height() - ay;
      const dyC = by + this.height() - ay;
      const dy = Math.abs(dyA) < Math.abs(dyB) ? dyA : dyB;
      return Math.abs(dy) < Math.abs(dyC) ? dy : dyC;
    } else {
      return by - ay;
    }
  };

  Game_Map.prototype.collisionMesh = function (collisionType) {
    collisionType = collisionType || CollisionMesh.WALK;
    return CollisionMesh.getMesh(this.mapId(), collisionType);
  };

  Game_Map.prototype.getCharactersUnderPoint = function (x, y) {
    return this.characters().filter(function (entry) {
      if (!entry) {
        return false;
      }
      const aabbox = entry.collider().aabbox;
      if (x < entry._x + aabbox.left) {
        return false;
      } else if (x > entry._x + aabbox.right) {
        return false;
      } else if (y < entry._y + aabbox.top) {
        return false;
      } else if (y > entry._y + aabbox.bottom) {
        return false;
      }
      return true;
    });
  };

  Game_Map.prototype.getCharactersUnder = function (character, x, y) {
    const vx = x - character.x;
    const vy = y - character.y;

    const collider = character.collider();
    const bboxTests = this.getAABBoxTests(character, vx, vy);

    // Gather any solid characters within the movement bounding box
    let characters = this.characters().filter(function (entry) {
      if (!entry) {
        return false;
      }
      for (let ii = 0; ii < bboxTests.length; ii++) {
        if (
          Collider.aabboxCheck(
            bboxTests[ii].x,
            bboxTests[ii].y,
            bboxTests[ii].aabbox,
            entry._x,
            entry._y,
            entry.collider().aabbox,
          )
        ) {
          entry.loopMap = bboxTests[ii].type;
          return true;
        }
      }
      return false;
    });

    characters = characters.filter(function (character) {
      const characterVector = { x: character._x, y: character._y };
      const moveVector = getLoopMapCorrection(
        characterVector,
        character.loopMap,
      );
      const entryX = moveVector.x;
      const entryY = moveVector.y;

      return Collider.intersect(
        x,
        y,
        collider,
        entryX,
        entryY,
        character.collider(),
      );
    });

    return characters;
  };

  Game_Map.prototype.getTilesUnder = function (character, vx, vy) {
    vx = vx || 0;
    vy = vy || 0;

    const collider = character.collider();
    // const bboxTests = this.getAABBoxTests(character, vx, vy);
    const tiles = [] as [number, number][];

    // Test collision with map
    const left = Math.floor(character._x + vx + collider.aabbox.left);
    const top = Math.floor(character._y + vy + collider.aabbox.top);
    const right = Math.ceil(
      character._x + vx + collider.aabbox.right - Number.EPSILON,
    );
    const bottom = Math.ceil(
      character._y + vy + collider.aabbox.bottom - Number.EPSILON,
    );

    const tileCollider = Collider.sharedTile();
    for (let yy = top; yy < bottom; yy++) {
      for (let xx = left; xx < right; xx++) {
        if (
          Collider.intersect(
            character._x + vx,
            character._y + vy,
            collider,
            xx,
            yy,
            tileCollider,
          )
        ) {
          tiles.push([xx, yy]);
        }
      }
    }

    return tiles;
  };

  Game_Map.prototype.touchesCharacters = function (character, x, y) {
    const vx = x - character.x;
    const vy = y - character.y;

    const collider = character.collider();
    const bboxTests = this.getAABBoxTests(character, vx, vy);

    // Gather any solid characters within the movement bounding box
    const characters = $gameMap.characters().filter(function (entry) {
      if (character.collidableWith(entry)) {
        for (let ii = 0; ii < bboxTests.length; ii++) {
          if (
            Collider.aabboxCheck(
              bboxTests[ii].x,
              bboxTests[ii].y,
              bboxTests[ii].aabbox,
              entry._x,
              entry._y,
              entry.collider().aabbox,
            )
          ) {
            entry.loopMap = bboxTests[ii].type;
            return true;
          }
        }
      }
      return false;
    });

    // Test collision with characters
    for (let ii = 0; ii < characters.length; ii++) {
      const characterVector = { x: characters[ii]._x, y: characters[ii]._y };
      const moveVector = getLoopMapCorrection(
        characterVector,
        character[ii].loopMap,
      );
      const entryX = moveVector.x;
      const entryY = moveVector.y;

      if (
        Collider.intersect(
          x,
          y,
          collider,
          entryX,
          entryY,
          characters[ii].collider(),
        )
      ) {
        return true;
      }
    }

    return false;
  };

  Game_Map.prototype.canMoveOn = function (character, x, y, collisionMesh) {
    const collider = character.collider();
    const xd = x - character._x;
    const yd = y - character._y;
    const bboxTests = this.getAABBoxTests(character, xd, yd);

    // Gather any solid characters within the movement bounding box
    const characters = $gameMap.characters().filter(function (entry) {
      if (character.collidableWith(entry)) {
        for (let ii = 0; ii < bboxTests.length; ii++) {
          if (
            Collider.aabboxCheck(
              bboxTests[ii].x,
              bboxTests[ii].y,
              bboxTests[ii].aabbox,
              entry._x,
              entry._y,
              entry.collider().aabbox,
            )
          ) {
            entry.loopMap = bboxTests[ii].type;
            return true;
          }
        }
      }
      return false;
    });

    // Test collision with characters
    for (let ii = 0; ii < characters.length; ii++) {
      const entry = characters[ii];
      const characterVector = { x: entry._x, y: entry._y };
      const moveVector = getLoopMapCorrection(
        characterVector,
        character.loopMap,
      );
      const entryX = moveVector.x;
      const entryY = moveVector.y;

      if (
        Collider.intersect(
          character._x,
          character._y,
          collider,
          entryX,
          entryY,
          entry.collider(),
        )
      ) {
        return false;
      }
    }

    // Test collision with map
    for (let ii = 0; ii < bboxTests.length; ii++) {
      const moveVector = getLoopMapCorrection(
        { x: 0, y: 0 },
        bboxTests[ii].type,
      );
      const offsetX = moveVector.x;
      const offsetY = moveVector.y;

      const mapColliders = Collider.polygonsWithinColliderList(
        bboxTests[ii].x,
        bboxTests[ii].y,
        bboxTests[ii].aabbox,
        0,
        0,
        collisionMesh,
      );
      if (mapColliders.length > 0) {
        for (let jj = 0; jj < mapColliders.length; jj++) {
          if (
            Collider.intersect(
              x,
              y,
              collider,
              offsetX,
              offsetY,
              mapColliders[jj],
            )
          ) {
            return false;
          }
        }
      }
    }

    return true;
  };

  Game_Map.prototype.isAABBoxValid = function (x, y, aabbox) {
    return (
      aabbox.left + x >= 0 &&
      aabbox.right + x <= this.width() &&
      aabbox.top + y >= 0 &&
      aabbox.bottom + y <= this.height()
    );
  };

  Game_Map.prototype.canWalk = function (character, x, y) {
    // Passability test
    if (!this.checkPassage(x, y, 0x0f)) {
      return false;
    }
    return this.canMoveOn(
      character,
      x,
      y,
      CollisionMesh.getMesh(this.mapId(), CollisionMesh.WALK),
    );
  };

  Game_Map.prototype.getAABBoxTests = function (character, vx, vy) {
    let aabbox = character.collider().aabbox;
    if (vx || vy) {
      // Extend aabbox for vectors
      aabbox = {
        left: aabbox.left + (vx < 0 ? vx : 0),
        top: aabbox.top + (vy < 0 ? vy : 0),
        right: aabbox.right + (vx > 0 ? vx : 0),
        bottom: aabbox.bottom + (vy > 0 ? vy : 0),
      };
    }

    // Construct aabbox tests for map edges
    const bboxTests = [
      { x: character._x, y: character._y, aabbox: aabbox, type: 0 },
    ];
    if (this.isLoopHorizontal()) {
      bboxTests.push({
        x: character._x - this.width(),
        y: character._y,
        aabbox: aabbox,
        type: 1,
      });
      bboxTests.push({
        x: character._x + this.width(),
        y: character._y,
        aabbox: aabbox,
        type: 2,
      });
    }
    if (this.isLoopVertical()) {
      bboxTests.push({
        x: character._x,
        y: character._y - this.height(),
        aabbox: aabbox,
        type: 3,
      });
      bboxTests.push({
        x: character._x,
        y: character._y + this.height(),
        aabbox: aabbox,
        type: 4,
      });
    }
    if (this.isLoopHorizontal() && this.isLoopVertical()) {
      bboxTests.push({
        x: character._x - this.width(),
        y: character._y - this.height(),
        aabbox: aabbox,
        type: 5,
      });
      bboxTests.push({
        x: character._x + this.width(),
        y: character._y - this.height(),
        aabbox: aabbox,
        type: 6,
      });
      bboxTests.push({
        x: character._x - this.width(),
        y: character._y + this.height(),
        aabbox: aabbox,
        type: 7,
      });
      bboxTests.push({
        x: character._x + this.width(),
        y: character._y + this.height(),
        aabbox: aabbox,
        type: 8,
      });
    }
    return bboxTests;
  };

  Game_Map.prototype.characters = function (player = true) {
    return [
      ...this.events(),
      ...(player ? [$gamePlayer] : []),
      ...this.vehicles(),
      ...$gamePlayer.followers().visibleFollowers(),
    ];
  };

  /**
   * Sprite_Destination
   */
  // cursor change destionation!
  Sprite_Destination.prototype.createBitmap = function () {
    const tileWidth = $gameMap.tileWidth();
    const tileHeight = $gameMap.tileHeight();
    this.bitmap = new Bitmap(tileWidth, tileHeight);
    this.bitmap.drawCircle(
      tileWidth / 2,
      tileHeight / 2,
      (tileWidth < tileHeight ? tileWidth : tileHeight) / 2,
      'white',
    );
    this.anchor.x = 0.5;
    this.anchor.y = 0.5;
    this.blendMode = PIXI.BLEND_MODES.ADD;
  };

  Sprite_Destination.prototype.update = function () {
    Sprite.prototype.update.call(this);
    if ($gamePlayer._touchTarget) {
      this.updatePosition();
      this.updateAnimation();
      this.visible = true;
    } else {
      this._frameCount = 0;
      this.visible = false;
    }
  };

  Sprite_Destination.prototype.updatePosition = function () {
    const tileWidth = $gameMap.tileWidth();
    const tileHeight = $gameMap.tileHeight();
    const x = $gamePlayer._touchTarget?.x ?? 0;
    const y = $gamePlayer._touchTarget?.y ?? 0;
    this.x = ($gameMap.adjustX(x) + 0.5) * tileWidth;
    this.y = ($gameMap.adjustY(y) + 0.5) * tileHeight;
  };

  /**
   * CollisionMesh
   */

  class CollisionMesh {
    static WALK = 0;
    static BOAT = 1;
    static SHIP = 2;
    static AIRSHIP = 3;

    static meshInMemory = {
      mapId: null as number | null,
      mesh: [] as Partial<Polygon>[],
    };
    constructor() {
      throw new Error('This is a static class');
    }

    static getMesh = function (mapId: number, type: number) {
      type = type || CollisionMesh.WALK;

      if (CollisionMesh.meshInMemory.mapId === mapId) {
        return CollisionMesh.meshInMemory.mesh[type];
      }
      const cacheName = 'cache_mesh%1'.format(mapId.padZero(3));
      if (
        PLAY_TEST.COLLISION_MESH_CACHING &&
        $gameTemp.isPlaytest() &&
        StorageManager.exists(cacheName)
      ) {
        CollisionMesh.meshInMemory.mapId = mapId;
        const cachePath = StorageManager.filePath(cacheName);
        const data = StorageManager.fsReadFile(cachePath);
        CollisionMesh.meshInMemory.mesh = JsonEx.parse(data);
      } else {
        let gameMap;
        if ($gameMap.mapId() === mapId) {
          gameMap = $gameMap;
        } else {
          gameMap = new Game_Map();
          gameMap.setup(mapId);
        }

        CollisionMesh.meshInMemory.mapId = mapId;
        CollisionMesh.meshInMemory.mesh[CollisionMesh.WALK] =
          CollisionMesh.makeCollisionMesh(gameMap, gameMap.isPassable);
        if (!gameMap.boat().isTransparent()) {
          CollisionMesh.meshInMemory.mesh[CollisionMesh.BOAT] =
            CollisionMesh.makeCollisionMesh(gameMap, gameMap.isBoatPassable);
        }
        if (!gameMap.ship().isTransparent()) {
          CollisionMesh.meshInMemory.mesh[CollisionMesh.SHIP] =
            CollisionMesh.makeCollisionMesh(gameMap, gameMap.isShipPassable);
        }
        if (!gameMap.airship().isTransparent()) {
          CollisionMesh.meshInMemory.mesh[CollisionMesh.AIRSHIP] =
            CollisionMesh.makeCollisionMesh(gameMap);
        }
        StorageManager.saveObject(
          cacheName,
          pruneReplacer(CollisionMesh.meshInMemory.mesh),
        );
      }

      return CollisionMesh.meshInMemory.mesh[type];
    };

    static makeCollisionMesh = function (
      gameMap: Game_Map,
      passFunc?: (x: number, y: number, d: number) => boolean,
    ) {
      // Make collision mask
      const collisionGrid = [] as Array<Array<number>>;
      if (!passFunc) {
        passFunc = function () {
          return true;
        };
      }
      for (let xx = 0; xx < gameMap.width(); xx++) {
        collisionGrid[xx] = [];
        for (let yy = 0; yy < gameMap.height(); yy++) {
          collisionGrid[xx][yy] = 0;
          if (!passFunc.call(gameMap, xx, yy, Direction.UP)) {
            collisionGrid[xx][yy] |= 0x1 << 0;
          }
          if (!passFunc.call(gameMap, xx, yy, Direction.LEFT)) {
            collisionGrid[xx][yy] |= 0x1 << 1;
          }
          if (!passFunc.call(gameMap, xx, yy, Direction.DOWN)) {
            collisionGrid[xx][yy] |= 0x1 << 2;
          }
          if (!passFunc.call(gameMap, xx, yy, Direction.RIGHT)) {
            collisionGrid[xx][yy] |= 0x1 << 3;
          }
        }
      }

      const colliders = [] as PolygonV[];
      const d = 2;

      // Non-looping sides
      if (!gameMap.isLoopHorizontal()) {
        const q = gameMap.isLoopVertical() ? 0 : d;
        colliders.push(
          Collider.createPolygon([
            [0, 0],
            [0, gameMap.height()],
            [-d, gameMap.height() + q],
            [-d, -q],
          ]),
        );
        colliders.push(
          Collider.createPolygon([
            [gameMap.width(), gameMap.height()],
            [gameMap.width(), 0],
            [gameMap.width() + d, -q],
            [gameMap.width() + d, gameMap.height() + q],
          ]),
        );
      }
      if (!gameMap.isLoopVertical()) {
        const q = gameMap.isLoopHorizontal() ? 0 : d;
        colliders.push(
          Collider.createPolygon([
            [gameMap.width(), 0],
            [0, 0],
            [-q, -d],
            [gameMap.width() + q, -d],
          ]),
        );
        colliders.push(
          Collider.createPolygon([
            [0, gameMap.height()],
            [gameMap.width(), gameMap.height()],
            [gameMap.width() + q, gameMap.height() + d],
            [-q, gameMap.height() + d],
          ]),
        );
      }

      // Build tiles (Fixes some cases for humpy corner collision)
      for (let yy = 0; yy < gameMap.height(); yy++) {
        const top = gameMap.roundY(yy - 1);
        const bottom = gameMap.roundY(yy + 1);
        for (let xx = 0; xx < gameMap.width(); xx++) {
          if (collisionGrid[xx][yy] !== 0xf) {
            continue;
          }

          const left = gameMap.roundX(xx - 1);
          const right = gameMap.roundX(xx + 1);

          let open = 0;
          if (left < 0 || collisionGrid[left][yy] == 0) {
            open++;
          }
          if (top < 0 || collisionGrid[xx][top] == 0) {
            open++;
          }
          if (right >= gameMap.width() || collisionGrid[right][yy] == 0) {
            open++;
          }
          if (bottom >= gameMap.height() || collisionGrid[xx][bottom] == 0) {
            open++;
          }

          if (open === 4) {
            collisionGrid[xx][yy] = 0;
            colliders.push(
              Collider.createPolygon([
                [xx, yy],
                [xx + 1, yy],
                [xx + 1, yy + 1],
                [xx, yy + 1],
              ]),
            );
          }
        }
      }

      // Build horizontal lines
      let horizontalLine = null as Vertice[] | null;
      const hColliders = [];
      for (let yy = 0; yy < gameMap.height(); yy++) {
        for (let xx = 0; xx < gameMap.width(); xx++) {
          const y2 = gameMap.roundY(yy - 1);
          if (
            collisionGrid[xx][yy] & (0x1 << 0) ||
            (y2 >= 0 && collisionGrid[xx][y2] & (0x1 << 2))
          ) {
            // Can't move up or down
            // Is a horizontal line
            if (!horizontalLine) {
              horizontalLine = [[xx, yy]];
            }
            horizontalLine[1] = [xx + 1, yy];
          } else if (!!horizontalLine) {
            hColliders.push(Collider.createPolygon(horizontalLine));
            hColliders.push(
              Collider.createPolygon([
                [horizontalLine[1][0], horizontalLine[1][1]],
                [horizontalLine[0][0], horizontalLine[0][1]],
              ]),
            );
            horizontalLine = null;
          }
        }
        if (!!horizontalLine) {
          hColliders.push(Collider.createPolygon(horizontalLine));
          hColliders.push(
            Collider.createPolygon([
              [horizontalLine[1][0], horizontalLine[1][1]],
              [horizontalLine[0][0], horizontalLine[0][1]],
            ]),
          );
          horizontalLine = null;
        }
      }

      // Build vertical lines
      let verticalLine = null as Vertice[] | null;
      const vColliders = [];
      for (let xx = 0; xx < gameMap.width(); xx++) {
        for (let yy = 0; yy < gameMap.height(); yy++) {
          const x2 = gameMap.roundX(xx - 1);
          if (
            collisionGrid[xx][yy] & (0x1 << 1) ||
            (x2 >= 0 && collisionGrid[x2][yy] & (0x1 << 3))
          ) {
            // Can't move left or right
            // Is a vertical line
            if (!verticalLine) {
              verticalLine = [[xx, yy]];
            }
            verticalLine[1] = [xx, yy + 1];
          } else if (!!verticalLine) {
            vColliders.push(Collider.createPolygon(verticalLine));
            vColliders.push(
              Collider.createPolygon([
                [verticalLine[1][0], verticalLine[1][1]],
                [verticalLine[0][0], verticalLine[0][1]],
              ]),
            );
            verticalLine = null;
          }
        }
        if (!!verticalLine) {
          vColliders.push(Collider.createPolygon(verticalLine));
          vColliders.push(
            Collider.createPolygon([
              [verticalLine[1][0], verticalLine[1][1]],
              [verticalLine[0][0], verticalLine[0][1]],
            ]),
          );
          verticalLine = null;
        }
      }

      // TileD colliders
      CollisionMesh.tileDColliders(gameMap, colliders);

      // We sort the horizontal and vertical lines separately as we check
      // map collision in two stages: horizontal then vertical
      const collisionMesh = Collider.createList();
      if (colliders.length > 0) {
        Collider.addToList(collisionMesh, Collider.treeFromArray(colliders));
      }
      if (hColliders.length > 0) {
        Collider.addToList(collisionMesh, Collider.treeFromArray(hColliders));
      }
      if (vColliders.length > 0) {
        Collider.addToList(collisionMesh, Collider.treeFromArray(vColliders));
      }
      return collisionMesh;
    };

    static tileDColliders = function (
      gameMap: Game_Map,
      colliders: PolygonV[],
    ) {
      if (!gameMap.tiledData) return;
      const tileWidth = gameMap.tileWidth();
      const tileHeight = gameMap.tileHeight();
      const scale = gameMap.isHalfTile && gameMap.isHalfTile() ? 2 : 1;
      const tilesetColliders = [] as Array<{
        [x: string]: Array<TiledLayerObject>;
      }>;

      // Build tile colliders
      const tilesets = gameMap.tiledData.tilesets;
      for (let ii = 0; ii < tilesets.length; ii++) {
        tilesetColliders[ii] = {};

        const tiles = tilesets[ii].tiles;
        for (const key in tiles) {
          if (tiles[key].objectgroup) {
            tilesetColliders[ii][key] = tiles[key].objectgroup.objects;
          }
        }
      }

      // Place tile colliders
      for (let ii = 0; ii < gameMap.tiledData.layers.length; ii++) {
        const layer = gameMap.tiledData.layers[ii];
        for (let yy = 0; yy < layer.height; yy++) {
          const row = yy * layer.width;
          for (let xx = 0; xx < layer.width; xx++) {
            let tileId = layer.data[row + xx];
            if (tileId === 0) {
              continue;
            }
            tileId++;

            // Find tileset belonging to tileId
            let tilesetId = -1;
            let firstId = 0;
            for (let jj = 0; jj < gameMap.tiledData.tilesets.length; jj++) {
              firstId = gameMap.tiledData.tilesets[jj].firstgid;
              const lastId = firstId + gameMap.tiledData.tilesets[jj].tilecount;
              if (tileId >= firstId && tileId <= lastId) {
                tilesetId = jj;
                break;
              }
            }
            if (tilesetId < 0) {
              continue;
            }

            // Get objectGroup for this tileId
            const tileSet = tilesetColliders[tilesetId];
            const objectGroup = tileSet['' + (tileId - firstId - 1)];
            if (objectGroup) {
              for (let jj = 0; jj < objectGroup.length; jj++) {
                const object = objectGroup[jj];
                const x = xx * scale;
                const y = yy * scale;
                CollisionMesh.addTileDCollisionObject(
                  x,
                  y,
                  object,
                  scale,
                  tileWidth,
                  tileHeight,
                  colliders,
                );
              }
            }
          }
        }
      }

      // Find collision mesh layers
      for (let ii = 0; ii < gameMap.tiledData.layers.length; ii++) {
        const layer = gameMap.tiledData.layers[ii];
        if (
          layer.type == 'objectgroup' &&
          layer.properties &&
          layer.properties.collision == 'mesh'
        ) {
          for (let jj = 0; jj < layer.objects.length; jj++) {
            CollisionMesh.addTileDCollisionObject(
              0,
              0,
              layer.objects[jj],
              scale,
              tileWidth,
              tileHeight,
              colliders,
            );
          }
        }
      }
    };

    static addTileDCollisionObject = function (
      x: number,
      y: number,
      object: TiledLayerObject,
      scale: 2 | 1,
      tileWidth: number,
      tileHeight: number,
      colliders: PolygonV[],
    ) {
      x += object.x / tileWidth;
      y += object.y / tileHeight;
      if (object.polygon) {
        // Polygon
        const polygon = [] as Vertice[];
        for (let ii = 0; ii < object.polygon.length; ii++) {
          polygon[ii] = [
            x + object.polygon[ii].x / tileWidth,
            y + object.polygon[ii].y / tileHeight,
          ];
        }
        colliders.push(Collider.createPolygon(polygon));
      } else if (object.polyline) {
        // Polyline
        let polylines;
        if (object.polyline.length == 2) {
          polylines = Collider.createPolygon([
            [
              x + object.polyline[0].x / tileWidth,
              y + object.polyline[0].y / tileWidth,
            ],
            [
              x + object.polyline[1].x / tileHeight,
              y + object.polyline[1].y / tileHeight,
            ],
          ]);
        } else {
          polylines = Collider.createList();
          for (let ii = 0; ii < object.polyline.length - 1; ii++) {
            Collider.addToList(
              polylines,
              Collider.createPolygon([
                [
                  x + object.polyline[ii].x / tileWidth,
                  y + object.polyline[ii].y / tileWidth,
                ],
                [
                  x + object.polyline[ii + 1].x / tileHeight,
                  y + object.polyline[ii + 1].y / tileHeight,
                ],
              ]),
            );
          }
        }
        colliders.push(polylines);
      } else if (object.ellipse) {
        // Ellipse
        if (object.width == object.height) {
          // Circle
          const rad = object.width / tileWidth / 2;
          colliders.push(Collider.createCircle(x + rad, y + rad, rad));
        } else {
          // Regular polygon
          const rx = object.width / tileWidth / 2;
          const ry = object.height / tileHeight / 2;
          const points =
            object.properties && object.properties.points
              ? object.properties.points
              : 8;
          colliders.push(
            Collider.createRegularPolygon(x + rx, y + ry, rx, ry, points),
          );
        }
      } else {
        // Rect
        const w = object.width / tileWidth;
        const h = object.height / tileHeight;
        colliders.push(Collider.createRect(x, y, w, h));
      }
    };
  }

  function xmlParser(xml: string) {
    // filtering unknown shapes values
    function filterUnknownShapes(childNodes: Node[]) {
      return Array.from(childNodes).filter((node) =>
        [
          'rect',
          'circle',
          'line',
          'polygon',
          'regular',
          'preset',
          'ps',
        ].contains(node.nodeName),
      );
    }
    // Force xml in root tag
    const xmlDoc = DOM_PARSER.parseFromString(
      `<root>${xml}</root>`,
      'text/xml',
    );
    const colliderNodes = xmlDoc.querySelectorAll('collider, col');

    if (!colliderNodes.length) return '';

    const newCollider = xmlDoc.createElement('collider');

    if (colliderNodes.length === 1) {
      newCollider.append(...filterUnknownShapes(colliderNodes[0].childNodes));
      return newCollider;
    }
    // if multiple collider tags
    // merge all children in new unique collider tag
    colliderNodes.forEach((collider: { childNodes: Node[] }) => {
      newCollider.append(...filterUnknownShapes(collider.childNodes));
    });
    return newCollider;
  }

  class Collider {
    static CIRCLE = 0;
    static POLYGON = 1;
    static LIST = 2;
    static PRECISION = Math.pow(2, 7);
    static I_PRECISION = 1 / Collider.PRECISION;
    static PRESETS = {} as {
      [key: string]: PolygonV;
      [Symbol.iterator]: () => Generator<PolygonV>;
    };
    static _null: PolygonV;
    static _sharedTile: Omit<Polygon, 'colliders'>;
    static _sharedCircle: Omit<Polygon, 'colliders' | 'vertices'>;
    static _sharedCharacter: Omit<Polygon, 'colliders' | 'vertices'>;
    static _sharedAirship: Omit<Polygon, 'colliders' | 'vertices'>;
    static _sharedShip: Omit<Polygon, 'colliders' | 'vertices'>;
    static _sharedBoat: Omit<Polygon, 'colliders' | 'vertices'>;

    constructor() {
      throw new Error('This is a static class');
    }

    static createList = function (): Omit<Polygon, 'vertices' | 'x' | 'y'> {
      return {
        type: Collider.LIST,
        colliders: [],
        aabbox: {
          left: Number.POSITIVE_INFINITY,
          top: Number.POSITIVE_INFINITY,
          right: Number.NEGATIVE_INFINITY,
          bottom: Number.NEGATIVE_INFINITY,
        },
      };
    };

    static addToList = function (
      list: Omit<Polygon, 'vertices' | 'x' | 'y'>,
      collider:
        | Omit<Polygon, 'vertices' | 'x' | 'y'>
        | Omit<Polygon, 'vertices' | 'colliders'>,
    ) {
      if (!list.colliders) list.colliders = [];
      list.colliders.push(collider);
      list.aabbox.left =
        collider.aabbox.left < list.aabbox.left
          ? collider.aabbox.left
          : list.aabbox.left;
      list.aabbox.top =
        collider.aabbox.top < list.aabbox.top
          ? collider.aabbox.top
          : list.aabbox.top;
      list.aabbox.right =
        collider.aabbox.right > list.aabbox.right
          ? collider.aabbox.right
          : list.aabbox.right;
      list.aabbox.bottom =
        collider.aabbox.bottom > list.aabbox.bottom
          ? collider.aabbox.bottom
          : list.aabbox.bottom;
    };

    static importPresets() {
      if (Object.keys(Collider.PRESETS).length === 0) {
        // Index starts at 1 (first item is null collider)
        Collider.PRESETS[0] = Collider.null();
        for (let ii = 0; ii < PRESETS.length; ii++) {
          const xmlDoc = DOM_PARSER.parseFromString(
            '<collider>' + JSON.parse(PRESETS[ii]) + '</collider>',
            'text/xml',
          );
          Collider.PRESETS[ii + 1] = Collider.createFromXML(xmlDoc);

          const childNodes = xmlDoc.childNodes[0].childNodes;
          for (let jj = 0; jj < childNodes.length; jj++) {
            if (childNodes[jj].nodeName === 'name') {
              Collider.PRESETS[childNodes[jj].innerHTML.trim()] =
                Collider.PRESETS[ii + 1];
              break;
            }
          }
        }
      }
    }

    static getPreset = function (id: number | string) {
      Collider.importPresets();
      return Collider.PRESETS[id] || null;
    };

    static createFromXML = function (xml: string | Document) {
      const xmlDoc =
        typeof xml === 'string'
          ? DOM_PARSER.parseFromString(xml, 'text/xml')
          : xml;
      let childNodes = xmlDoc.childNodes;
      for (let ii = 0; ii < xmlDoc.childNodes.length; ii++) {
        if (xmlDoc.childNodes[ii].nodeName === 'collider') {
          childNodes = xmlDoc.childNodes[ii].childNodes;
          break;
        }
      }
      const filterNodes = [];
      for (let ii = 0; ii < childNodes.length; ii++) {
        switch (childNodes[ii].nodeName) {
          case 'rect':
          case 'circle':
          case 'line':
          case 'polygon':
          case 'regular':
            filterNodes.push(childNodes[ii]);
            break;
        }
      }
      childNodes = filterNodes;
      if (childNodes.length === 0) {
        return Collider.null();
      } else if (childNodes.length === 1) {
        switch (childNodes[0].nodeName) {
          case 'rect':
            const x = Number(childNodes[0].getAttribute('x'));
            const y = Number(childNodes[0].getAttribute('y'));
            const width = Number(childNodes[0].getAttribute('width'));
            const height = Number(childNodes[0].getAttribute('height'));
            return Collider.createRect(x, y, width, height);
          case 'circle':
            let cx = Number(childNodes[0].getAttribute('cx'));
            let cy = Number(childNodes[0].getAttribute('cy'));
            const r = Number(childNodes[0].getAttribute('r'));
            return Collider.createCircle(cx, cy, r);
          case 'line':
            const x1 = Number(childNodes[0].getAttribute('x1'));
            const y1 = Number(childNodes[0].getAttribute('y1'));
            const x2 = Number(childNodes[0].getAttribute('x2'));
            const y2 = Number(childNodes[0].getAttribute('y2'));
            return Collider.createLine(x1, y1, x2, y2);
          case 'polygon':
            const pointsAttr = childNodes[0].getAttribute('points')?.split(' ');
            if (!pointsAttr) return Collider.null();
            const points = [] as Array<Vertice>;
            for (let jj = 0; jj < pointsAttr.length; jj++) {
              const axis = pointsAttr[jj].split(',');
              for (let kk = 0; kk < axis.length; kk++) {
                points[jj][kk] = Number(axis[kk]);
              }
            }
            return Collider.createPolygon(points);
          case 'regular':
            cx = Number(childNodes[0].getAttribute('cx'));
            cy = Number(childNodes[0].getAttribute('cy'));
            const rx = Number(childNodes[0].getAttribute('rx'));
            const ry = Number(childNodes[0].getAttribute('ry'));
            const p = Number(childNodes[0].getAttribute('p'));
            return Collider.createRegularPolygon(cx, cy, rx, ry, p);
        }
      } else {
        const colliderList = Collider.createList();
        for (let ii = 0; ii < childNodes.length; ii++) {
          switch (childNodes[ii].nodeName) {
            case 'rect':
              const x = Number(childNodes[ii].getAttribute('x'));
              const y = Number(childNodes[ii].getAttribute('y'));
              const width = Number(childNodes[ii].getAttribute('width'));
              const height = Number(childNodes[ii].getAttribute('height'));
              Collider.addToList(
                colliderList,
                Collider.createRect(x, y, width, height),
              );
              break;
            case 'circle':
              let cx = Number(childNodes[ii].getAttribute('cx'));
              let cy = Number(childNodes[ii].getAttribute('cy'));
              const r = Number(childNodes[ii].getAttribute('r'));
              Collider.addToList(
                colliderList,
                Collider.createCircle(cx, cy, r),
              );
              break;
            case 'line':
              const x1 = Number(childNodes[ii].getAttribute('x1'));
              const y1 = Number(childNodes[ii].getAttribute('y1'));
              const x2 = Number(childNodes[ii].getAttribute('x2'));
              const y2 = Number(childNodes[ii].getAttribute('y2'));
              Collider.addToList(
                colliderList,
                Collider.createLine(x1, y1, x2, y2),
              );
              break;
            case 'polygon':
              const pointsAttr = childNodes[0]
                .getAttribute('points')
                ?.split(' ');
              if (!pointsAttr) return Collider.null();
              const points = [] as Array<Vertice>;
              for (let jj = 0; jj < pointsAttr.length; jj++) {
                const axis = pointsAttr[jj].split(',');
                for (let kk = 0; kk < axis.length; kk++) {
                  points[jj][kk] = Number(axis[kk]);
                }
              }
              Collider.addToList(colliderList, Collider.createPolygon(points));
              break;
            case 'regular':
              cx = Number(childNodes[ii].getAttribute('cx'));
              cy = Number(childNodes[ii].getAttribute('cy'));
              const rx = Number(childNodes[ii].getAttribute('rx'));
              const ry = Number(childNodes[ii].getAttribute('ry'));
              const p = Number(childNodes[ii].getAttribute('p'));
              Collider.addToList(
                colliderList,
                Collider.createRegularPolygon(cx, cy, rx, ry, p),
              );
              break;
          }
        }
        return colliderList;
      }
      return Collider.null(); // VELEE:
    };

    static createRect = function (
      x: number,
      y: number,
      width: number,
      height: number,
    ) {
      return Collider.createPolygon([
        [x, y],
        [x + width, y],
        [x + width, y + height],
        [x, y + height],
      ]);
    };

    static createLine = function (
      x1: number,
      y1: number,
      x2: number,
      y2: number,
    ) {
      return Collider.createPolygon([
        [x1, y1],
        [x2, y2],
      ]);
    };

    static createCircle = function (
      x: number,
      y: number,
      radius: number,
    ): Omit<Polygon, 'vertices' | 'colliders'> {
      return {
        type: Collider.CIRCLE,
        x: x,
        y: y,
        radius: radius,
        aabbox: {
          left: x - radius,
          top: y - radius,
          right: x + radius,
          bottom: y + radius,
        },
      };
    };

    static createPolygon = function (
      vertices: Vertice[],
    ): Omit<Polygon, 'colliders'> {
      const aabbox = {
        left: Number.POSITIVE_INFINITY,
        top: Number.POSITIVE_INFINITY,
        right: Number.NEGATIVE_INFINITY,
        bottom: Number.NEGATIVE_INFINITY,
      };
      vertices.forEach(function (vertex) {
        if (vertex[0] < aabbox.left) {
          aabbox.left = vertex[0];
        }
        if (vertex[1] < aabbox.top) {
          aabbox.top = vertex[1];
        }
        if (vertex[0] > aabbox.right) {
          aabbox.right = vertex[0];
        }
        if (vertex[1] > aabbox.bottom) {
          aabbox.bottom = vertex[1];
        }
      });
      // return { type: Collider.POLYGON, vertices: vertices, aabbox: aabbox };
      return { type: Collider.POLYGON, vertices, aabbox, x: 0, y: 0 }; // VELEE:
    };

    static createRegularPolygon = function (
      x: number,
      y: number,
      sx: number,
      sy: number,
      points: number,
    ) {
      if (!points || points < 3) {
        return Collider.createCircle(x, y, Math.sqrt(sx * sx + sy * sy));
      }
      const vertices = [] as Vertice[];
      const divisor = points / (Math.PI * 2);
      const pi2 = Math.PI / 2;
      for (let ii = 0; ii < points; ii++) {
        vertices.push([
          x + Math.cos(ii / divisor - pi2) * sx,
          y + Math.sin(ii / divisor - pi2) * sy,
        ]);
      }
      return Collider.createPolygon(vertices);
    };

    static null = function () {
      if (!Collider._null) {
        Collider._null = Collider.createPolygon([]);
      }
      return Collider._null;
    };

    static sharedTile = function () {
      if (!Collider._sharedTile) {
        Collider._sharedTile = Collider.createPolygon([
          [0, 0],
          [1, 0],
          [1, 1],
          [0, 1],
        ]);
      }
      return Collider._sharedTile;
    };

    static sharedCircle = function () {
      if (!Collider._sharedCircle) {
        Collider._sharedCircle = Collider.createCircle(0.5, 0.5, 0.5);
      }
      return Collider._sharedCircle;
    };

    static sharedCharacter = function () {
      if (!Collider._sharedCharacter) {
        Collider._sharedCharacter = Collider.createCircle(0.5, 0.7, 0.25);
      }
      return Collider._sharedCharacter;
    };

    static sharedAirship = function () {
      if (!Collider._sharedAirship) {
        Collider._sharedAirship = Collider.createCircle(0.5, 0.5, 0.25);
      }
      return Collider._sharedAirship;
    };

    static sharedShip = function () {
      if (!Collider._sharedShip) {
        Collider._sharedShip = Collider.createCircle(0.5, 0.5, 0.5);
      }
      return Collider._sharedShip;
    };

    static sharedBoat = function () {
      if (!Collider._sharedBoat) {
        Collider._sharedBoat = Collider.createCircle(0.5, 0.5, 1 / 3);
      }
      return Collider._sharedBoat;
    };

    static polygonsWithinColliderList = function (
      ax: number,
      ay: number,
      aabbox: Aabbox,
      bx: number,
      by: number,
      bc: Partial<Polygon>,
    ) {
      let polygons = [] as PolygonV[];
      if (!bc.colliders) return polygons;
      for (let ii = 0; ii < bc.colliders.length; ii++) {
        if (
          Collider.aabboxCheck(ax, ay, aabbox, bx, by, bc.colliders[ii].aabbox)
        ) {
          if (bc.colliders[ii].type === Collider.LIST) {
            polygons = polygons.concat(
              Collider.polygonsWithinColliderList(
                ax,
                ay,
                aabbox,
                bx,
                by,
                bc.colliders[ii],
              ),
            );
          } else {
            polygons.push(bc.colliders[ii]);
          }
        }
      }
      return polygons;
    };

    static encaseCircleCircle = function (
      ax: number,
      ay: number,
      ac: Partial<Polygon>,
      bx: number,
      by: number,
      bc: Partial<Polygon>,
    ) {
      if (!(ac.x && ac.y && bc.x && bc.y && ac.radius && bc.radius))
        return false;
      ax = ax + ac.x;
      ay = ay + ac.y;
      bx = bx + bc.x;
      by = by + bc.y;

      const dx = ax - bx;
      const dy = ay - by;
      let dd = dx * dx + dy * dy;
      dd -= bc.radius * bc.radius;
      if (dd < ac.radius * ac.radius) {
        return true;
      }

      return false;
    };

    static intersectCircleCircle = function (
      ax: number,
      ay: number,
      ac: Partial<Polygon>,
      bx: number,
      by: number,
      bc: Partial<Polygon>,
    ) {
      if (!(ac.x && ac.y && bc.x && bc.y && ac.radius && bc.radius))
        return false;

      ax = ax + ac.x;
      ay = ay + ac.y;
      bx = bx + bc.x;
      by = by + bc.y;

      const dx = ax - bx;
      const dy = ay - by;
      const dd = dx * dx + dy * dy;
      const rr = bc.radius + ac.radius;
      if (dd < rr * rr) {
        return true;
      }

      return false;
    };

    static moveCircleCircle = function (
      ax: number,
      ay: number,
      ac: Partial<Polygon>,
      bx: number,
      by: number,
      bc: Partial<Polygon>,
      vector: Vector,
    ) {
      if (!(ac.x && ac.y && bc.x && bc.y && ac.radius && bc.radius))
        return vector;

      ax = ax + ac.x;
      ay = ay + ac.y;
      bx = bx + bc.x;
      by = by + bc.y;

      const dx = ax + vector.x - bx;
      const dy = ay + vector.y - by;
      let dd = dx * dx + dy * dy;
      const rr = bc.radius + ac.radius;
      if (dd < rr * rr) {
        dd = rr - Math.sqrt(dd);
        const dl = Math.sqrt(dx * dx + dy * dy);
        vector.x += (dx / dl) * dd;
        vector.y += (dy / dl) * dd;
      }

      return vector;
    };

    static encaseCirclePolygon = function (
      ax: number,
      ay: number,
      ac: Partial<Polygon>,
      bx: number,
      by: number,
      bc: Partial<Polygon>,
    ) {
      if (!(ac.x && ac.y && ac.radius && bc.vertices)) return false;

      const aradius = ac.radius + Collider.I_PRECISION;
      ax = ax + ac.x;
      ay = ay + ac.y;

      const closestPoint = {
        distance: Number.POSITIVE_INFINITY,
        dx: 0,
        dy: 0,
        index: 0,
      };

      for (let ii = 0; ii < bc.vertices.length; ii++) {
        const dx = ax - (bx + bc.vertices[ii][0]);
        const dy = ay - (by + bc.vertices[ii][1]);
        const d = dx * dx + dy * dy;
        if (d < closestPoint.distance) {
          closestPoint.dx = dx;
          closestPoint.dy = dy;
          closestPoint.distance = d;
          closestPoint.index = ii;
        }
      }

      let planeX = closestPoint.dx;
      let planeY = closestPoint.dy;
      const length = Math.sqrt(planeX * planeX + planeY * planeY);
      planeX /= length;
      planeY /= length;

      // Project circle
      const point = planeX * ax + planeY * ay;
      const maxA = point + aradius;
      const minA = point - aradius;

      // Project polygon
      let minB = Number.POSITIVE_INFINITY;
      let maxB = Number.NEGATIVE_INFINITY;
      for (let ii = 0; ii < bc.vertices.length; ii++) {
        const projection =
          planeX * (bx + bc.vertices[ii][0]) +
          planeY * (by + bc.vertices[ii][1]);
        if (projection < minB) minB = projection;
        if (projection > maxB) maxB = projection;
      }

      if (minB < minA || maxB > maxA) {
        return false;
      }

      let jj;
      for (let ii = 0; ii < bc.vertices.length; ii++) {
        jj = ii + 1;
        if (jj == bc.vertices.length) {
          jj = 0;
        }

        let planeX = bc.vertices[jj][1] - bc.vertices[ii][1];
        let planeY = bc.vertices[ii][0] - bc.vertices[jj][0];
        const length = Math.sqrt(planeX * planeX + planeY * planeY);
        planeX /= length;
        planeY /= length;

        // Project circle
        const point = planeX * ax + planeY * ay;
        const maxA = point + aradius;
        const minA = point - aradius;

        // Project polygon
        let minB = Number.POSITIVE_INFINITY;
        let maxB = Number.NEGATIVE_INFINITY;
        for (let kk = 0; kk < bc.vertices.length; kk++) {
          const projection =
            planeX * (bx + bc.vertices[kk][0]) +
            planeY * (by + bc.vertices[kk][1]);
          if (projection < minB) minB = projection;
          if (projection > maxB) maxB = projection;
        }

        if (minB < minA || maxB > maxA) {
          return false;
        }
      }

      return true;
    };

    static intersectCirclePolygon = function (
      ax: number,
      ay: number,
      ac: Partial<Polygon>,
      bx: number,
      by: number,
      bc: Partial<Polygon>,
    ) {
      if (!(ac.x && ac.y && ac.radius && bc.vertices)) return false;

      const aradius = ac.radius;
      ax = ax + ac.x;
      ay = ay + ac.y;

      const closestPoint = {
        distance: Number.POSITIVE_INFINITY,
        dx: 0,
        dy: 0,
        index: 0,
      };

      for (let ii = 0; ii < bc.vertices.length; ii++) {
        const dx = ax - (bx + bc.vertices[ii][0]);
        const dy = ay - (by + bc.vertices[ii][1]);
        const d = dx * dx + dy * dy;
        if (d < closestPoint.distance) {
          closestPoint.dx = dx;
          closestPoint.dy = dy;
          closestPoint.distance = d;
          closestPoint.index = ii;
        }
      }

      let planeX = closestPoint.dx;
      let planeY = closestPoint.dy;
      const length = Math.sqrt(planeX * planeX + planeY * planeY);
      planeX /= length;
      planeY /= length;

      // Project circle
      const point = planeX * ax + planeY * ay;
      const maxA = point + aradius;
      const minA = point - aradius;

      // Project polygon
      let minB = Number.POSITIVE_INFINITY;
      let maxB = Number.NEGATIVE_INFINITY;
      for (let ii = 0; ii < bc.vertices.length; ii++) {
        const projection =
          planeX * (bx + bc.vertices[ii][0]) +
          planeY * (by + bc.vertices[ii][1]);
        if (projection < minB) minB = projection;
        if (projection > maxB) maxB = projection;
      }

      if (minA >= maxB || maxA <= minB) {
        // No collision
        return false;
      }

      let jj;
      for (let ii = 0; ii < bc.vertices.length; ii++) {
        jj = ii + 1;
        if (jj == bc.vertices.length) {
          jj = 0;
        }

        let planeX = bc.vertices[jj][1] - bc.vertices[ii][1];
        let planeY = bc.vertices[ii][0] - bc.vertices[jj][0];
        const length = Math.sqrt(planeX * planeX + planeY * planeY);
        planeX /= length;
        planeY /= length;

        // Project circle
        const point = planeX * ax + planeY * ay;
        const maxA = point + aradius;
        const minA = point - aradius;

        // Project polygon
        let minB = Number.POSITIVE_INFINITY;
        let maxB = Number.NEGATIVE_INFINITY;
        for (let kk = 0; kk < bc.vertices.length; kk++) {
          const projection =
            planeX * (bx + bc.vertices[kk][0]) +
            planeY * (by + bc.vertices[kk][1]);
          if (projection < minB) minB = projection;
          if (projection > maxB) maxB = projection;
        }

        if (minA > maxB || maxA < minB) {
          // No collision
          return false;
        }
      }

      return true;
    };

    static moveCirclePolygon = function (
      ax: number,
      ay: number,
      ac: Partial<Polygon>,
      bx: number,
      by: number,
      bc: Partial<Polygon>,
      vector: Vector,
    ) {
      if (!(ac.x && ac.y && ac.radius && bc.vertices)) return vector;
      const aradius = ac.radius;
      ax = ax + ac.x;
      ay = ay + ac.y;

      const closestPoint = {
        distance: Number.POSITIVE_INFINITY,
        dx: 0,
        dy: 0,
        index: 0,
      };

      for (let ii = 0; ii < bc.vertices.length; ii++) {
        const dx = ax + vector.x - (bx + bc.vertices[ii][0]);
        const dy = ay + vector.y - (by + bc.vertices[ii][1]);
        const d = dx * dx + dy * dy;
        if (d < closestPoint.distance) {
          closestPoint.dx = dx;
          closestPoint.dy = dy;
          closestPoint.distance = d;
          closestPoint.index = ii;
        }
      }

      let correctionDistance;
      let correctionX;
      let correctionY;
      let absDistance;

      let planeX = closestPoint.dx;
      let planeY = closestPoint.dy;
      const length = Math.sqrt(planeX * planeX + planeY * planeY);
      planeX /= length;
      planeY /= length;

      // Project circle
      const point = planeX * (ax + vector.x) + planeY * (ay + vector.y);
      const maxA = point + aradius;
      const minA = point - aradius;

      // Project polygon
      let minB = Number.POSITIVE_INFINITY;
      let maxB = Number.NEGATIVE_INFINITY;

      for (let ii = 0; ii < bc.vertices.length; ii++) {
        const projection =
          planeX * (bx + bc.vertices[ii][0]) +
          planeY * (by + bc.vertices[ii][1]);
        if (projection < minB) minB = projection;
        if (projection > maxB) maxB = projection;
      }

      if (minA > maxB || maxA < minB) {
        // No collision
        return vector;
      }

      correctionDistance = maxB - minA;
      correctionX = planeX;
      correctionY = planeY;
      absDistance = Math.abs(correctionDistance);

      let jj;
      for (let ii = 0; ii < bc.vertices.length; ii++) {
        jj = ii + 1;
        if (jj == bc.vertices.length) {
          jj = 0;
        }

        let planeX = bc.vertices[jj][1] - bc.vertices[ii][1];
        let planeY = bc.vertices[ii][0] - bc.vertices[jj][0];
        const length = Math.sqrt(planeX * planeX + planeY * planeY);
        planeX /= length;
        planeY /= length;

        // Project circle
        const point = planeX * (ax + vector.x) + planeY * (ay + vector.y);
        const maxA = point + aradius;
        const minA = point - aradius;

        // Project polygon
        let minB = Number.POSITIVE_INFINITY;
        let maxB = Number.NEGATIVE_INFINITY;
        for (let kk = 0; kk < bc.vertices.length; kk++) {
          const projection =
            planeX * (bx + bc.vertices[kk][0]) +
            planeY * (by + bc.vertices[kk][1]);
          if (projection < minB) minB = projection;
          if (projection > maxB) maxB = projection;
        }

        if (minA > maxB || maxA < minB) {
          // No collision
          return vector;
        }

        const distance = maxB - minA;
        const gap = Math.abs(distance);
        if (gap < absDistance) {
          correctionDistance = distance;
          correctionX = planeX;
          correctionY = planeY;
          absDistance = gap;
        }
      }

      vector.x += correctionX * correctionDistance;
      vector.y += correctionY * correctionDistance;

      return vector;
    };

    static encasePolygonCircle = function (
      ax: number,
      ay: number,
      ac: Partial<Polygon>,
      bx: number,
      by: number,
      bc: Partial<Polygon>,
    ) {
      if (!(bc.x && bc.y && bc.radius && ac.vertices)) return false;

      const aradius = bc.radius - Collider.I_PRECISION;
      bx = bx + bc.x;
      by = by + bc.y;

      const closestPoint = {
        distance: Number.POSITIVE_INFINITY,
        dx: 0,
        dy: 0,
        index: 0,
      };

      for (let ii = 0; ii < ac.vertices.length; ii++) {
        const dx = bx - (ax + ac.vertices[ii][0]);
        const dy = by - (ay + ac.vertices[ii][1]);
        const d = dx * dx + dy * dy;
        if (d < closestPoint.distance) {
          closestPoint.dx = dx;
          closestPoint.dy = dy;
          closestPoint.distance = d;
          closestPoint.index = ii;
        }
      }

      let planeX = closestPoint.dx;
      let planeY = closestPoint.dy;
      const length = Math.sqrt(planeX * planeX + planeY * planeY);
      planeX /= length;
      planeY /= length;

      // Project circle
      const point = planeX * bx + planeY * by;
      const maxA = point + aradius;
      const minA = point - aradius;

      // Project polygon
      let minB = Number.POSITIVE_INFINITY;
      let maxB = Number.NEGATIVE_INFINITY;
      for (let ii = 0; ii < ac.vertices.length; ii++) {
        const projection =
          planeX * (ax + ac.vertices[ii][0]) +
          planeY * (ay + ac.vertices[ii][1]);
        if (projection < minB) minB = projection;
        if (projection > maxB) maxB = projection;
      }

      if (minA < minB || maxA > maxB) {
        return false;
      }

      let jj;
      for (let ii = 0; ii < ac.vertices.length; ii++) {
        jj = ii + 1;
        if (jj == ac.vertices.length) {
          jj = 0;
        }

        let planeX = ac.vertices[jj][1] - ac.vertices[ii][1];
        let planeY = ac.vertices[ii][0] - ac.vertices[jj][0];
        const length = Math.sqrt(planeX * planeX + planeY * planeY);
        planeX /= length;
        planeY /= length;

        // Project circle
        const point = planeX * bx + planeY * by;
        const maxA = point + aradius;
        const minA = point - aradius;

        // Project polygon
        let minB = Number.POSITIVE_INFINITY;
        let maxB = Number.NEGATIVE_INFINITY;
        for (let kk = 0; kk < ac.vertices.length; kk++) {
          const projection =
            planeX * (ax + ac.vertices[kk][0]) +
            planeY * (ay + ac.vertices[kk][1]);
          if (projection < minB) minB = projection;
          if (projection > maxB) maxB = projection;
        }

        if (minA < minB || maxA > maxB) {
          return false;
        }
      }

      return true;
    };

    static intersectPolygonCircle = function (
      ax: number,
      ay: number,
      ac: Partial<Polygon>,
      bx: number,
      by: number,
      bc: Partial<Polygon>,
    ) {
      return Collider.intersectCirclePolygon(bx, by, bc, ax, ay, ac);
    };

    static movePolygonCircle = function (
      ax: number,
      ay: number,
      ac: Partial<Polygon>,
      bx: number,
      by: number,
      bc: Partial<Polygon>,
      vector: Vector,
    ) {
      let ivector = {
        x: -vector.x,
        y: -vector.y,
      };
      ivector = Collider.moveCirclePolygon(bx, by, bc, ax, ay, ac, ivector);
      vector.x = -ivector.x;
      vector.y = -ivector.y;
      return vector;
    };

    static encasePolygonPolygon = function (
      ax: number,
      ay: number,
      ac: Partial<Polygon>,
      bx: number,
      by: number,
      bc: Partial<Polygon>,
    ) {
      let jj: number;
      const colliders = [bc, ac];
      if (!(ac.vertices && bc.vertices)) return true;
      for (let cc = 0; cc < colliders.length; cc++) {
        for (let ii = 0; ii < (colliders[cc].vertices?.length ?? 0); ii++) {
          jj = ii + 1;
          const vertices = colliders[cc].vertices;
          if (vertices) {
            if (jj == vertices.length) {
              jj = 0;
            }
            let planeX = vertices[jj][1] - vertices[ii][1];
            let planeY = vertices[ii][0] - vertices[jj][0];
            const length = Math.sqrt(planeX * planeX + planeY * planeY);
            planeX /= length;
            planeY /= length;

            // Project polygon A
            let minA = Number.POSITIVE_INFINITY;
            let maxA = Number.NEGATIVE_INFINITY;

            for (let kk = 0; kk < ac.vertices.length; kk++) {
              const projection =
                planeX * (ax + ac.vertices[kk][0]) +
                planeY * (ay + ac.vertices[kk][1]);
              if (projection < minA) minA = projection;
              if (projection > maxA) maxA = projection;
            }

            // Project polygon B
            let minB = Number.POSITIVE_INFINITY;
            let maxB = Number.NEGATIVE_INFINITY;
            for (let kk = 0; kk < bc.vertices.length; kk++) {
              const projection =
                planeX * (bx + bc.vertices[kk][0]) +
                planeY * (by + bc.vertices[kk][1]);
              if (projection < minB) minB = projection;
              if (projection > maxB) maxB = projection;
            }

            if (minB < minA || maxB > maxA) {
              return false;
            }
          }
        }
      }

      return true;
    };

    static intersectPolygonPolygon = function (
      ax: number,
      ay: number,
      ac: Partial<Polygon>,
      bx: number,
      by: number,
      bc: Partial<Polygon>,
    ) {
      let jj;
      const colliders = [bc, ac];
      for (let cc = 0; cc < 2; cc++) {
        const vertices = colliders[cc].vertices;
        if (!(vertices && ac.vertices && bc.vertices)) return true;
        for (let ii = 0; ii < vertices.length; ii++) {
          jj = ii + 1;
          if (jj == vertices.length) {
            jj = 0;
          }

          let planeX = vertices[jj][1] - vertices[ii][1];
          let planeY = vertices[ii][0] - vertices[jj][0];
          const length = Math.sqrt(planeX * planeX + planeY * planeY);
          planeX /= length;
          planeY /= length;

          // Project polygon A
          let minA = Number.POSITIVE_INFINITY;
          let maxA = Number.NEGATIVE_INFINITY;
          for (let kk = 0; kk < ac.vertices.length; kk++) {
            const projection =
              planeX * (ax + ac.vertices[kk][0]) +
              planeY * (ay + ac.vertices[kk][1]);
            if (projection < minA) minA = projection;
            if (projection > maxA) maxA = projection;
          }

          // Project polygon B
          let minB = Number.POSITIVE_INFINITY;
          let maxB = Number.NEGATIVE_INFINITY;
          for (let kk = 0; kk < bc.vertices.length; kk++) {
            const projection =
              planeX * (bx + bc.vertices[kk][0]) +
              planeY * (by + bc.vertices[kk][1]);
            if (projection < minB) minB = projection;
            if (projection > maxB) maxB = projection;
          }

          if (minA > maxB || maxA < minB) {
            // No collision
            return false;
          }
        }
      }

      return true;
    };

    static movePolygonPolygon = function (
      ax: number,
      ay: number,
      ac: Partial<Polygon>,
      bx: number,
      by: number,
      bc: Partial<Polygon>,
      vector: Vector,
    ) {
      let correctionDistance = 0; // VELEE:
      let correctionX = 0; // VELEE:
      let correctionY = 0; // VELEE:
      let absDistance = Number.POSITIVE_INFINITY;
      let jj;
      const colliders = [bc, ac];
      if (!(ac.vertices && bc.vertices)) return vector;
      for (let cc = 0; cc < 2; cc++) {
        const vertices = colliders[cc].vertices;
        if (!vertices) return vector;
        for (let ii = 0; ii < vertices.length; ii++) {
          jj = ii + 1;
          if (jj == vertices.length) {
            jj = 0;
          }

          let planeX = vertices[jj][1] - vertices[ii][1];
          let planeY = vertices[ii][0] - vertices[jj][0];
          const length = Math.sqrt(planeX * planeX + planeY * planeY);
          planeX /= length;
          planeY /= length;

          // Project polygon A
          let minA = Number.POSITIVE_INFINITY;
          let maxA = Number.NEGATIVE_INFINITY;
          for (let kk = 0; kk < ac.vertices.length; kk++) {
            const projection =
              planeX * (ax + vector.x + ac.vertices[kk][0]) +
              planeY * (ay + vector.y + ac.vertices[kk][1]);
            if (projection < minA) minA = projection;
            if (projection > maxA) maxA = projection;
          }

          // Project polygon B
          let minB = Number.POSITIVE_INFINITY;
          let maxB = Number.NEGATIVE_INFINITY;
          for (let kk = 0; kk < bc.vertices.length; kk++) {
            const projection =
              planeX * (bx + bc.vertices[kk][0]) +
              planeY * (by + bc.vertices[kk][1]);
            if (projection < minB) minB = projection;
            if (projection > maxB) maxB = projection;
          }

          if (minA > maxB || maxA < minB) {
            // No collision
            return vector;
          }

          const distance = maxB - minA;
          const gap = Math.abs(distance);
          if (gap < absDistance) {
            correctionDistance = distance;
            correctionX = planeX;
            correctionY = planeY;
            absDistance = gap;
          }
        }
      }

      vector.x += correctionX * correctionDistance;
      vector.y += correctionY * correctionDistance;

      return vector;
    };

    /**
     * Does collider A encase B
     * @param  {Number}   ax X-position collider A
     * @param  {Number}   ay Y-position collider A
     * @param  {Collider} ac Collider A
     * @param  {Number}   bx X-position collider B
     * @param  {Number}   by Y-position collider B
     * @param  {Collider} bc Collider B
     * @return {Boolean} true if A encases B
     */
    static encase = function (
      ax: number,
      ay: number,
      ac: Partial<Polygon>,
      bx: number,
      by: number,
      bc: Partial<Polygon>,
    ) {
      if (ac.type == Collider.LIST) {
        if (!ac.colliders) return false;
        for (let ii = 0; ii < ac.colliders.length; ii++) {
          if (Collider.encase(ax, ay, ac.colliders[ii], bx, by, bc)) {
            return true;
          }
        }
        return false;
      }

      if (bc.type == Collider.LIST) {
        if (!bc.colliders) return false;
        for (let ii = 0; ii < bc.colliders.length; ii++) {
          if (Collider.encase(ax, ay, ac, bx, by, bc.colliders[ii])) {
            return true;
          }
        }
        return false;
      }

      if (ac.type == Collider.CIRCLE && bc.type == Collider.CIRCLE) {
        // Circle circle test
        return Collider.encaseCircleCircle(ax, ay, ac, bx, by, bc);
      }

      if (ac.type == Collider.CIRCLE && bc.type == Collider.POLYGON) {
        // Circle polygon test
        return Collider.encaseCirclePolygon(ax, ay, ac, bx, by, bc);
      }

      if (ac.type == Collider.POLYGON && bc.type == Collider.CIRCLE) {
        // Polygon circle test
        return Collider.encasePolygonCircle(ax, ay, ac, bx, by, bc);
      }

      if (ac.type == Collider.POLYGON && bc.type == Collider.POLYGON) {
        // Polygon polygon test
        return Collider.encasePolygonPolygon(ax, ay, ac, bx, by, bc);
      }

      return false;
    };

    /**
     * Do colliders A & B touch
     * @param  {Number}   ax X-position collider A
     * @param  {Number}   ay Y-position collider A
     * @param  {Collider} ac Collider A
     * @param  {Number}   bx X-position collider B
     * @param  {Number}   by Y-position collider B
     * @param  {Collider} bc Collider B
     * @return {Boolean} true if touching, false otherwise
     */
    static intersect = function (
      ax: number,
      ay: number,
      ac: Partial<Polygon>,
      bx: number,
      by: number,
      bc: Partial<Polygon>,
    ) {
      if (ac.type == Collider.LIST) {
        if (!ac.colliders) return false;
        for (let ii = 0; ii < ac.colliders.length; ii++) {
          if (Collider.intersect(ax, ay, ac.colliders[ii], bx, by, bc)) {
            return true;
          }
        }
        return false;
      }

      if (bc.type == Collider.LIST) {
        if (!bc.colliders) return false;
        for (let ii = 0; ii < bc.colliders.length; ii++) {
          if (Collider.intersect(ax, ay, ac, bx, by, bc.colliders[ii])) {
            return true;
          }
        }
        return false;
      }

      if (ac.type == Collider.CIRCLE && bc.type == Collider.CIRCLE) {
        // Circle circle test
        return Collider.intersectCircleCircle(ax, ay, ac, bx, by, bc);
      }

      if (ac.type == Collider.CIRCLE && bc.type == Collider.POLYGON) {
        // Circle polygon test
        return Collider.intersectCirclePolygon(ax, ay, ac, bx, by, bc);
      }

      if (ac.type == Collider.POLYGON && bc.type == Collider.CIRCLE) {
        // Polygon circle test
        return Collider.intersectPolygonCircle(ax, ay, ac, bx, by, bc);
      }

      if (ac.type == Collider.POLYGON && bc.type == Collider.POLYGON) {
        // Polygon polygon test
        return Collider.intersectPolygonPolygon(ax, ay, ac, bx, by, bc);
      }

      return false;
    };

    /**
     * Move and collide A towards B
     * @param  {Number}   ax X-position collider A
     * @param  {Number}   ay Y-position collider A
     * @param  {Collider} ac Collider A
     * @param  {Number}   bx X-position collider B
     * @param  {Number}   by Y-position collider B
     * @param  {Collider} bc Collider B
     * @param  {Vector}   vector Input movement vector A to B
     * @return {Vector} New movement vector
     */
    static move = function (
      ax: number,
      ay: number,
      ac: Partial<Polygon>,
      bx: number,
      by: number,
      bc: Partial<Polygon>,
      vector: Vector,
    ) {
      if (ac.type == Collider.LIST) {
        if (!ac.colliders) return vector;
        for (let ii = 0; ii < ac.colliders.length; ii++) {
          vector = Collider.move(ax, ay, ac.colliders[ii], bx, by, bc, vector);
          if (vector.x === 0 && vector.y === 0) {
            break;
          }
        }
        return vector;
      }

      if (bc.type == Collider.LIST) {
        if (!bc.colliders) return vector;
        for (let ii = 0; ii < bc.colliders.length; ii++) {
          vector = Collider.move(ax, ay, ac, bx, by, bc.colliders[ii], vector);
          if (vector.x === 0 && vector.y === 0) {
            break;
          }
        }
        return vector;
      }

      if (ac.type == Collider.CIRCLE && bc.type == Collider.CIRCLE) {
        // Circle circle test
        return Collider.moveCircleCircle(ax, ay, ac, bx, by, bc, vector);
      }

      if (ac.type == Collider.CIRCLE && bc.type == Collider.POLYGON) {
        // Circle polygon test
        return Collider.moveCirclePolygon(ax, ay, ac, bx, by, bc, vector);
      }

      if (ac.type == Collider.POLYGON && bc.type == Collider.CIRCLE) {
        // Polygon circle test
        return Collider.movePolygonCircle(ax, ay, ac, bx, by, bc, vector);
      }

      if (ac.type == Collider.POLYGON && bc.type == Collider.POLYGON) {
        // Polygon polygon test
        return Collider.movePolygonPolygon(ax, ay, ac, bx, by, bc, vector);
      }

      return vector;
    };

    static treeFromArray = function (colliders: PolygonV[]) {
      while (colliders.length > 1) {
        let shortestDist = Number.POSITIVE_INFINITY;
        let closestNode = -1;
        for (let ii = 1; ii < colliders.length; ii++) {
          const leftDistance = Math.abs(
            colliders[ii].aabbox.right - colliders[0].aabbox.left,
          );
          if (leftDistance < shortestDist) {
            shortestDist = leftDistance;
            closestNode = ii;
            continue;
          }

          const rightDistance = Math.abs(
            colliders[ii].aabbox.left - colliders[0].aabbox.right,
          );
          if (rightDistance < shortestDist) {
            shortestDist = rightDistance;
            closestNode = ii;
            continue;
          }

          const topDistance = Math.abs(
            colliders[ii].aabbox.bottom - colliders[0].aabbox.top,
          );
          if (topDistance < shortestDist) {
            shortestDist = topDistance;
            closestNode = ii;
            continue;
          }

          const bottomDistance = Math.abs(
            colliders[ii].aabbox.top - colliders[0].aabbox.bottom,
          );
          if (bottomDistance < shortestDist) {
            shortestDist = bottomDistance;
            closestNode = ii;
            continue;
          }
        }

        // Create pairing
        const pair = Collider.createList();
        Collider.addToList(pair, colliders[0]);
        Collider.addToList(pair, colliders[closestNode]);
        colliders.splice(closestNode, 1);
        colliders[0] = pair;
      }

      return colliders[0];
    };

    /**
     * Check if A and B roughly intersect with AABBoxes
     * @param  {Number}   ax X-position collider A
     * @param  {Number}   ay Y-position collider A
     * @param  {AABBox}   ac AABBox A
     * @param  {Number}   bx X-position collider B
     * @param  {Number}   by Y-position collider B
     * @param  {AABBox}   bc AABBox B
     * @param  {Number}   vx Adjustment vector of A toB
     * @param  {Number}   vy Adjustment vector of A to B
     * @return {Boolean}  True is AABBoxes intersect
     */
    static aabboxCheck = function (
      ax: number,
      ay: number,
      ac: Aabbox,
      bx: number,
      by: number,
      bc: Aabbox,
      vx?: number,
      vy?: number,
    ) {
      vx = vx || 0;
      vy = vy || 0;
      const left = ax + ac.left + (vx < 0 ? vx : 0);
      if (left > bx + bc.right) {
        return false;
      }

      const top = ay + ac.top + (vy < 0 ? vy : 0);
      if (top > by + bc.bottom) {
        return false;
      }

      const right = ax + ac.right + (vx > 0 ? vx : 0);
      if (right < bx + bc.left) {
        return false;
      }

      const bottom = ay + ac.bottom + (vy > 0 ? vy : 0);
      if (bottom < by + bc.top) {
        return false;
      }

      return true;
    };
  }

  /**
   * Direction
   * Utility for managing directions
   */
  class Direction {
    static DOWN_LEFT = 1;
    static DOWN = 2;
    static DOWN_RIGHT = 3;
    static LEFT = 4;
    static RIGHT = 6;
    static UP_LEFT = 7;
    static UP = 8;
    static UP_RIGHT = 9;

    constructor() {
      throw new Error('This is a static class');
    }

    static isUp = function (d: number) {
      return d >= 7;
    };

    static isRight = function (d: number) {
      return d % 3 == 0;
    };

    static isDown = function (d: number) {
      return d <= 3;
    };

    static isLeft = function (d: number) {
      return (d + 2) % 3 == 0;
    };

    static fromVector = function (vx: number, vy: number) {
      if (vx && vy) {
        if (vy < 0) {
          if (vx < 0) {
            return Direction.UP_LEFT;
          } else {
            return Direction.UP_RIGHT;
          }
        } else {
          if (vx < 0) {
            return Direction.DOWN_LEFT;
          } else {
            return Direction.DOWN_RIGHT;
          }
        }
      } else if (vx < 0) {
        return Direction.LEFT;
      } else if (vx > 0) {
        return Direction.RIGHT;
      } else if (vy < 0) {
        return Direction.UP;
      }
      return Direction.DOWN;
    };

    static normalize = function (vx: number, vy: number, length: number) {
      length = length || Math.sqrt(vx * vx + vy * vy);
      return { x: vx / length, y: vy / length, l: length };
    };

    static normalizeSquare = function (
      vx: number,
      vy: number,
      length?: number,
    ) {
      const angle = Math.atan2(vy, vx);
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);
      if (!length) {
        const absCos = Math.abs(cos);
        const absSin = Math.abs(sin);
        if (absSin <= absCos) {
          length = 1 / absCos;
        } else {
          length = 1 / absSin;
        }
      }
      return { x: vx * length, y: vy * length, l: length };
    };
  }

  function pruneReplacer(mesh: Partial<Polygon>[]): string {
    return JSON.stringify(
      mesh.map((root) => ({
        ...root,
        colliders: root.colliders?.map((vehicle: Partial<Polygon>) => ({
          ...vehicle,
          colliders: vehicle.colliders?.map((collider) => ({
            ...collider,
            colliders: undefined,
            vertices: undefined,
            aabbox: undefined,
          })),
        })),
      })),
    );
  }

  /**
   * Plugin Commands
   */

  const logPluginCommandWarning = function (warningMsg: string) {
    const currentEventId = $gameMap._interpreter._eventId;
    const currentEvent = $gameMap.event(currentEventId);
    if (currentEvent.characterName())
      console.warn(
        `EV${currentEventId
          .toString()
          .padStart(3, '0')}(${currentEvent.characterName()}): ${warningMsg}`,
      );
    else
      console.warn(
        `EV${currentEventId.toString().padStart(3, '0')}: ${warningMsg}`,
      );
  };

  PluginManager.registerCommand(pluginName, 'setPlayerCollider', (args) => {
    const presetCollider = Collider.getPreset(args.colliderPreset);
    if (presetCollider) {
      $gamePlayer.setCollider(presetCollider);
    } else {
      logPluginCommandWarning(
        `Preset Collider (${args.colliderPreset}) not found!`,
      );
    }
  });

  PluginManager.registerCommand(pluginName, 'setThisCollider', (args) => {
    const presetCollider = Collider.getPreset(args.colliderPreset);
    if (presetCollider) {
      const eventId = $gameMap._interpreter._eventId;
      const event = $gameMap.event(eventId);
      if (event) {
        event.setCollider(presetCollider);
      } else {
        logPluginCommandWarning(`This Event (${eventId}) not found!`);
      }
    } else {
      logPluginCommandWarning(
        `Preset Collider (${args.colliderPreset}) not found!`,
      );
    }
  });

  PluginManager.registerCommand(pluginName, 'setEventCollider', (args) => {
    const presetCollider = Collider.getPreset(args.colliderPreset);
    if (presetCollider) {
      let eventId = args.eventId;
      if (isNaN(eventId)) {
        for (let ii = 0; ii < $dataMap.events.length; ii++) {
          if ($dataMap.events[ii] && $dataMap.events[ii].name === eventId) {
            eventId = $dataMap.events[ii].id;
            break;
          }
        }
      }
      if (isNaN(eventId)) {
        logPluginCommandWarning(`Event (${eventId}) not found!`);
        return;
      }
      const event = $gameMap.event(eventId);
      if (event) {
        event.setCollider(presetCollider);
      } else {
        logPluginCommandWarning(`Event (${eventId}) not found!`);
      }
    } else {
      logPluginCommandWarning(
        `Preset Collider (${args.colliderPreset}) not found!`,
      );
    }
  });

  PluginManager.registerCommand(pluginName, 'setVehicleCollider', (args) => {
    const presetCollider = Collider.getPreset(args.colliderPreset);
    if (!presetCollider) {
      logPluginCommandWarning(
        `Preset Collider (${args.colliderPreset}) not found!`,
      );
      return;
    }
    const vehicle = $gameMap.vehicle(args.vehicleId);
    if (!vehicle) {
      logPluginCommandWarning(`Vehicle (${args.vehicleId}) not found!`);
      return;
    }
    vehicle.setCollider(presetCollider);
  });

  PluginManager.registerCommand(pluginName, 'setFollowerCollider', (args) => {
    const presetCollider = Collider.getPreset(args.colliderPreset);
    if (!presetCollider) {
      logPluginCommandWarning(
        `Preset Collider (${args.colliderPreset}) not found!`,
      );
      return;
    }
    const follower = $gamePlayer.followers().follower(args.followerId - 1);
    if (!follower) {
      logPluginCommandWarning(`Follower (${args.followerId}) not found!`);
      return;
    }
    follower.setCollider(presetCollider);
  });

  PluginManager.registerCommand(pluginName, 'setFollowersDistance', (args) => {
    $gameSystem._followerDistance = args.distance;
  });

  PluginManager.registerCommand(pluginName, 'setFollowersFollow', (args) => {
    if (args.followerId === 'all') {
      for (const follower of $gamePlayer.followers()._data) {
        follower.setFrozen(args.shouldFollow);
      }
    } else {
      const follower = $gamePlayer.followers().follower(args.followerId - 1);
      if (!follower) {
        logPluginCommandWarning(`Follower (${args.followerId}) not found!`);
        return;
      }
      follower.setFrozen(args.shouldFollow === 'true');
    }
  });

  PluginManager.registerCommand(pluginName, 'move', (args) => {
    let mover;
    const skip = args.isSkippable === 'true';
    const wait = args.wait === 'true';
    const step = JSON.parse(args.moveCommand);
    //Update mover if needed
    if (!step.mvr) {
      if (!mover) {
        logPluginCommandWarning(`Mover not set!`);
        return;
      }
    } else if (step.mvr === 'event') {
      mover = JSON.stringify(step.moverEventId);
    } else if (step.mvr.startsWith('follower')) {
      // Lower follower number to be 0 based
      const followerNumber = step.mvr.substring('follower'.length);
      step.mvr = String.prototype.concat(
        step.mvr.substring(0, 'follower'.length),
        `${followerNumber - 1}`,
      );
    } else mover = step.mvr;

    const subMoveArgs = ['move'];
    subMoveArgs.push(mover);
    subMoveArgs.push(step.dir);
    if (step.dir === 'towards' || step.dir === 'away') {
      let target = step.other;
      if (step.other === 'event') {
        target = JSON.stringify(step.moverEventId);
      } else if (step.other.startsWith('follower')) {
        // Lower follower number to be 0 based
        const followerNumber = step.other.substring('follower'.length);
        step.other = String.prototype.concat(
          step.other.substring(0, 'follower'.length),
          `${followerNumber - 1}`,
        );
      }
      subMoveArgs.push(target);
    }
    subMoveArgs.push(step.dist);
    if (wait) subMoveArgs.push('wait');
    if (skip) subMoveArgs.push('skip');
    $gameMap._interpreter.altMovementMoveCharacter(subMoveArgs);
  });

  PluginManager.registerCommand(pluginName, 'setTouchMouse', (args) => {
    $gameSystem._enableTouchMouse = args.value === 'true';
  });
})();
