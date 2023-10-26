# AltimitMovement-MZ
AltimitMovement refactor for rpg maker MZ

Put plugins from 'js/plugins' in your game 'js/plugins' directory and add the plugin in the plugin manager.

'.js.map' files can safely be removed but can be useful for debugging.

Source code and definitions are available under the 'src' directory.

Made in typescript, AltimitMovement.js should:

 - Fix double Show Choices following Show Text
 - Fix lag left/up when speed is decimal
 - Fix click/touch destination not resetting after transferring
 - Enable collider in notes
 - Added default "wall" preset collider as an example (1:1 square for player speed > 5 or just mapping)
 -  - Can now use <col><ps>wall</ps></col>(or <col><ps>1</ps></col>) to use preset collider (instead of <collider><preset>wall</preset></collider>)
 - seems that any event without images but with same as character priority will be a 1:1 square
 - Fixed Game_Player regionId thanks to GaryCXJk code
 - Removed obsolete plugin command from MV
 - Added airship auto getOn when clicked/touched option in plugin parameters
 - Add example shapes in plugin help
 - Factorized code

Also in typescript, AltimitMovementDebug.js should:

 - show collision shapes by default
 - allow to disable it in plugin parameters
 - allow to toggle it with F11 or Plugin command 
