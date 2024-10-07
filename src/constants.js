export const TOP = 0, RIGHT = 1, BOTTOM = 2, LEFT = 3;

export const 
// Resource Manager
IMAGE = 1,
MUSIC = 2,
FX = 3,

// Physics
POSITION = 1,
BODY = 11,
PHYSICS = 12,
WALKSPEED = 5,
AIRXSPEED = 3,
HOOK = 13,
HOOKSPEED = 11,

// Graphics
TEXTURE = 2,
SPRITE = 21,
ANIMATION = 22,
TEXT = 23,
BLINK = 24,

// Other
ALIVE = 2,
COLLIDER = 3,
PLAYER = 5,
DAMAGE = 6,

// Render
CAMERA = 7,
KEYBOARDCONTROL = 8;

const T = 250 / 1000;

export const GRAVITY = 3 / ( 2 * ( T ** 2 ) );
// jump speed = sqrt(2Hg)   -> H height
export const JUMPSPEED = Math.sqrt( 2 * 2.5 * GRAVITY );