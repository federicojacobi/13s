import {scaffold, ECS} from "ant-ecs";
import ResourceManager from "./ResourceManager";
import RenderSystem from "./Systems/RenderSystem";

import SpriteSheet from "./assets/1bit_pack0_alpha_byAMProjects-spaced-optimized.png";
import { ALIVE, ANIMATION, BLINK, BODY, CAMERA, COLLIDER, DAMAGE, FX, GRAVITY, HOOK, IMAGE, KEYBOARDCONTROL, LEFT, MUSIC, POSITION, RIGHT, SPRITE, TEXT, TEXTURE, WALKSPEED } from "./constants";
import KeyboardControlSystem from "./Systems/KeyboardControlSystem";
import PhysicsSystem from "./Systems/PhysicsSystem";
import mapBuilder, { getTile, getTileEntity, setTile } from "./helpers/MapBuilder";
import map from "./assets/map.json";
import CameraSystem from "./Systems/CameraSystem";
import PickupSystem from "./Systems/PickupSystem";
import AnimationSystem from "./Systems/AnimationSystem";
import DamageSystem from "./Systems/DamageSystem";
import JobsSystem from "./Systems/JobsSystem";
import HookSystem from "./Systems/HookSystem";
import { initAudioContext, zzfxP } from "./helpers/zzfxm";
import { endTheme, explosion, fireHook, jump, land, mainTheme, teleport } from "./assets/audio";
import { generateExplosion } from "./helpers/Explosions";
import { TextFactory, TileFactory } from "./helpers/Factories";
import BlinkSystem from "./Systems/BlinkSystem";

let lastFrameTimestamp = 0;

let frames = 0;
let perSecond = 0;
window.fps = 0;

const config = {
	width: 1024,
	height: 768,
};

const canvas = document.createElement( 'canvas' );
canvas.id = 'view';
canvas.height = config.height;
canvas.width = config.width;
canvas.style.imageRendering = 'pixelated';
document.body.appendChild( canvas );

const ecs = new ECS();
scaffold.setup( ecs );
window.ecs = ecs;

ecs.registerComponent( { type: KEYBOARDCONTROL } );
ecs.registerComponent( {
	type: HOOK,
	hooked: false,
	attachX: null,
	attachY: null,
	elapsed: 0,
	x: 0,
	y: 0,
	vx: 0,
	vy: 0
} );
ecs.registerComponent( { type: COLLIDER } );
ecs.registerComponent( { type: DAMAGE } );
ecs.registerComponent( {
	type: BLINK,
	speed: 0.25,
	accumulator: 0
} );
ecs.registerComponent( {
	type: POSITION,
	x: 0,
	y: 0,
	rotation: 0
} );
ecs.registerComponent( {
	type: BODY,
	width: 1,
	height: 1,
	anchorX: 0,
	anchorY: 0,
	vx: 0,
	vy: 0,
	gravity: 0,
	angularVelocity: 0,
	immovable: false,
	touchUp: false,
	touchDown: false,
	touchLeft: false,
	touchRight: false,
	facing: RIGHT
} );
ecs.registerComponent( {
	type: CAMERA,
	zoom: 6
} );
ecs.registerComponent( { type: ALIVE } );
ecs.registerComponent( {
	type: TEXTURE,
	key: '',
	width: 64,
	height: 64,
} );

ecs.registerComponent( {
	type: SPRITE,
	width: 16,
	height: 16,
	textureOffsetX: 0,
	textureOffsetY: 0,
	anchorX: 0,
	anchorY: 0,
	displayWidth: 1,
	displayHeight: 1,
	scale: 1
} );
ecs.registerComponent( {
	type: TEXT,
	content: '',
	font: '10px sans-serif',
	fillStyle: '',
	opacity: 1
} );
ecs.registerComponent( {
	type: ANIMATION,
	key: '',
	currentFrame: 0,
	elapsed: 0,
	loop: true
} );

scaffold.create()
.addComponent( CAMERA )
.addComponent( POSITION, { x: 0, y: 0 } )
.addComponent( KEYBOARDCONTROL );
const cam = scaffold.entity;
const camSystem = new CameraSystem( cam );
const pickupSystem = new PickupSystem();
const damageSystem = new DamageSystem();
const jobSystem = new JobsSystem();

ecs.addSystem( new KeyboardControlSystem() );
ecs.addSystem( new BlinkSystem() );
ecs.addSystem( pickupSystem );
ecs.addSystem( new HookSystem() );
ecs.addSystem( new PhysicsSystem() );
ecs.addSystem( damageSystem );
ecs.addSystem( new AnimationSystem() );
ecs.addSystem( camSystem );
ecs.addSystem( new RenderSystem( canvas ) );

// Add jobs system LAST
ecs.addSystem( jobSystem );
ecs.jobs = jobSystem;

function startGame() {
	mapBuilder( map );

	const mainmusic = zzfxP(...ResourceManager.get( 'mainTheme' ) );
	mainmusic.loop = true;

	// Player
	scaffold
	.create()
	.addComponent( POSITION )
	.addComponent( BODY, {
		width: 1/16 * 8,
		height: 1/16 * 11,
		anchorX: 0.5,
		anchorY: 1
	} )
	.addComponent( TEXTURE, { key: 'tileset' } )
	.addComponent( KEYBOARDCONTROL )
	.addComponent( COLLIDER )
	.addComponent( ANIMATION, {
		key: 'idle'
	} )
	.addComponent( SPRITE, {
		textureOffsetX: 17 * 6,
		textureOffsetY: 17 * 2
	} );
	const player = scaffold.entity;
	pickupSystem.setPlayer( player );
	damageSystem.setPlayer( player );
	damageSystem.deathCallback = () => {
		const pBody = player.components.get( BODY );
		const pPos = player.components.get( POSITION );

		pBody.vx = 0;
		pBody.vy = 0;

		// Create grave site.
		for ( let i = 0; i < 6; i++ ) {
			const tile = getTile( pPos.x, pPos.y + i );
			if ( tile > 0 ) {
				scaffold.create()
				.addComponent( POSITION, {
					x: Math.floor( pPos.x ),
					y: Math.floor( pPos.y + i - 1 )
				} )
				.addComponent( BODY, {
					immovable: true,
				} )
				.addComponent( TEXTURE, { key: 'tileset' } )
				.addComponent( SPRITE, {
					width: 16,
					height: 16,
					textureOffsetX: 0,
					textureOffsetY: 16
				} );
				break;
			}
		}

		ecs.removeComponent( player, [ ALIVE, KEYBOARDCONTROL, SPRITE ] );
		zzfxP( ResourceManager.get( 'explosion' ) );

		generateExplosion( pPos.x, pPos.y, 3, 4 );
		ecs.jobs.add( 2.25, ()=>{
			resetPlayer();
			callbacks[currentLevel]();
		} );
	};

	const resetPlayer = ( x = 5, y = 5 ) => {
		const pc = player.components;
		pc.get( POSITION ).x = x;
		pc.get( POSITION ).y = y;
		pc.get( BODY ).vx = 0;
		pc.get( BODY ).vy = 0;
		pc.get( BODY ).gravity = GRAVITY;
		camSystem.follow( player.components.get( POSITION ) );
		if ( ! pc.has( ALIVE ) ) {
			scaffold.entity = player;
			scaffold.addComponent( KEYBOARDCONTROL )
			.addComponent( SPRITE, {
				textureOffsetX: 17 * 6,
				textureOffsetY: 17 * 2
			} )
			.addComponent( ALIVE );
		}
		// Focus on level 0
		camSystem.clamp( {
			x: 11,
			y: 0,
			width: 18-11,
			height: 6
		} );
	};
	resetPlayer();

	TextFactory( 3, 4, '13-S', 'bold 64px Courier New' );
	TextFactory( 3, 4.5, 'The Director\'s Cut', 'normal 18px Courier New' );
	TextFactory( 3, 5.5, 'WASD or arrows to move', 'normal 18px Courier New' );
	TextFactory( 3, 6, '7 levels. 13 seconds each. Go.', 'normal 18px Courier New' );
	TextFactory( 45, 13.5, 'A game under 13k by Fede Jacobi', 'bold 18px Courier New' );
	TextFactory( 45, 10, 'That was fun. Thank you for playing!', 'bold 18px Courier New' );

	// setup end screen
	pickupSystem.addZone( {
		x: 115.5,
		y: 5,
		width: 1,
		height: 1,
		callback: () => {
			resetPlayer( 48.5, 10 );
			mainmusic.stop();
			const node = zzfxP(...ResourceManager.get( 'endTheme' ) );
			node.loop = true;
			ecs.removeComponent( player, [KEYBOARDCONTROL] );
			player.components.get( ANIMATION ).key = 'idle';

			camSystem.clamp( null );
			camSystem.follow( null );
			cam.components.get( POSITION ).x = 48;
			cam.components.get( POSITION ).y = 6;

			zzfxP( ResourceManager.get( 'teleport' ) );
			for ( let i = 0; i < 13; i++ ) {
				ecs.jobs.add( 3 * i, () => {
					const dx = Math.random() * 18 + 39;
					const dy = Math.random() * 8 + 1;

					const vec = {
						x: dx - 48.5,
						y: dy - 10
					};
					const len = Math.sqrt( vec.x * vec.x + vec.y * vec.y );
					vec.x = vec.x / len;
					vec.y = vec.y / len;

					scaffold.create()
					.addComponent( POSITION, { x: 48.5, y: 10 } )
					.addComponent( BODY, {
						vx: vec.x * 5,
						vy: vec.y * 6
					} )
					.addComponent( TEXTURE, { key: 'tileset' } )
					.addComponent( SPRITE )
					.addComponent( ANIMATION, { key: 'fireworks' } );
					const firework = scaffold.entity;
					ecs.jobs.add( 1, () => {
						zzfxP( ResourceManager.get( 'explosion' ) );
						generateExplosion(
							firework.components.get( POSITION ).x,
							firework.components.get( POSITION ).y,
							5,
							13
						);
						ecs.killEntity( firework );
					} );
				} );
			}
		}
	} );

	const createHook = ( x, y ) => {
		TileFactory( x, y );
		scaffold
		.addComponent( ANIMATION, {
			key: 'grapplePickup'
		} );

		const doHook = () => {
			const hook = player.components.get( HOOK );
			if ( ! hook ) {
				zzfxP( ResourceManager.get( 'hook' ) );
				const hookComponent = ecs.getNextComponent( HOOK );
				hookComponent.x = player.components.get( POSITION ).x;
				hookComponent.y = player.components.get( POSITION ).y;
				ecs.addComponent( player, hookComponent );
			}
		};
	
		pickupSystem.addZone( {
			x: x,
			y: y,
			width: 1,
			height: 1,
			callback: doHook
		} );
		return scaffold.entity;
	}

	// Grapple hook
	createHook( 21, 6 );
	createHook( 73, 20 );
	createHook( 72, 16 );
	createHook( 82, 55 );

	let currentLevel = 0;
	let callbacks = {};

	const level1CrashingCeiling = [];
	for ( let i = 0; i < 45; i++ ) {
		level1CrashingCeiling.push( TileFactory( i, 16, 0, 0, 17 * 3, 17 * 2 ) );
		level1CrashingCeiling.push( TileFactory( i, 17, 0, 0, 17 * 3, 17 * 6, true ) );
	}

	const level1jobs = [];
	const resetLevel1 = () => {
		while ( level1jobs.length ) {
			ecs.jobs.cancel( level1jobs.pop() );
		}

		level1CrashingCeiling.forEach( ( e, i ) => {
			e.components.get( POSITION ).y = i % 2 == 0 ? 16 : 17;
			e.components.get( BODY ).vy = 0;
		} );
	};
	const startLevel1 = () => {
		level1CrashingCeiling.forEach( ( e, i ) => {
			e.components.get( BODY ).vy = 7/13;
			e.components.get( POSITION ).y = i % 2 == 0 ? 16 : 17;

			level1jobs.push( ecs.jobs.add( 13, () => {
				e.components.get( BODY ).vy = 0;
			} ) );
		} );
	};
	callbacks[1] = () => {
		currentLevel = 1;
		resetPlayer( 1.5, 19 );
		ecs.removeComponent( player, KEYBOARDCONTROL );
		resetLevel1();
		camSystem.clamp( {
			x: 11,
			y: 19,
			width: 55-10-11,
			height: 7
		} );
		zzfxP( ResourceManager.get( 'teleport' ) );
		const readyText = TextFactory( 3, 21, 'Level 1 - Ready', 'bold 64px Courier New' );
		scaffold.addComponent( BLINK );
		ecs.jobs.add( 3, () => {
			ecs.killEntity( readyText );
			ecs.addComponent( player, ecs.getNextComponent( KEYBOARDCONTROL ) );
			startLevel1();
		} );
	};

	// setup level 1
	pickupSystem.addZone( {
		x: 27.5,
		y: 8,
		width: 1,
		height: 1,
		callback: callbacks[1]
	} );

	const level2MovingWall = [];
	for ( let i = 0; i < 6; i++ ) {
		level2MovingWall.push( TileFactory( -4 - i, i + 32, 0, 0, 17 * 3, 17 * 2 ) );

		// The factory sets up the scaffold, we can just use it directly.
		const spike = TileFactory( -3 - i, i + 32, 0, 0, 17 * 4, 17 * 2, true );

		level2MovingWall.push( spike );
	}

	const level2jobs = [];
	const resetLevel2 = () => {
		while ( level2jobs.length ) {
			ecs.jobs.cancel( level2jobs.pop() );
		}

		level2MovingWall.forEach( ( e, i ) => {
			e.components.get( BODY ).vx = 0;
			e.components.get( POSITION ).x = ( i % 2 == 0 ? -4 : -3 ) - Math.floor( i / 2 );
		} );
	};
	const startLevel2 = () => {
		level2MovingWall.forEach( ( e, i ) => {
			e.components.get( BODY ).vx = 3.5;

			level2jobs.push( ecs.jobs.add( 13, () => {
				e.components.get( BODY ).vx = 0;
			} ) );
		} );
	};
	callbacks[2] = () => {
		currentLevel = 2;
		resetPlayer( 1.5, 35 );
		ecs.removeComponent( player, KEYBOARDCONTROL );
		resetLevel2();
		camSystem.clamp( {
			x: 11,
			y: 32,
			width: 55-10-11,
			height: 7
		} );
		zzfxP( ResourceManager.get( 'teleport' ) );
		const readyText = TextFactory( 4, 34, 'Level 2 - Ready', 'bold 64px Courier New' );
		scaffold.addComponent( BLINK );
		ecs.jobs.add( 3, () => {
			ecs.killEntity( readyText );
			ecs.addComponent( player, ecs.getNextComponent( KEYBOARDCONTROL ) );
			startLevel2();
		} );
	};
	// setup level 2
	pickupSystem.addZone( {
		x: 50.5,
		y: 24,
		width: 1,
		height: 1,
		callback: callbacks[2]
	} );

	const level3MovingBottom = [];
	for ( let i = 0; i < 9; i++ ) {
		const saw = TileFactory( 69 + i, 31, 0, 0, 17 * 3, 17 * 4, true );
		scaffold.entity.components.get( BODY ).angularVelocity = Math.PI * 2;
		scaffold.entity.components.get( BODY ).anchorX = 0.5;
		scaffold.entity.components.get( BODY ).anchorY = 0.5;
		level3MovingBottom.push( saw );
	}

	const level3jobs = [];
	const resetLevel3 = () => {
		while ( level3jobs.length ) {
			ecs.jobs.cancel( level3jobs.pop() );
		}
		level3MovingBottom.forEach( ( e ) => {
			e.components.get( BODY ).vy = 0;
			e.components.get( POSITION ).y = 31
		} );
	};
	const startLevel3 = () => {
		level3MovingBottom.forEach( ( e ) => {
			e.components.get( BODY ).vy = -1;
			level3jobs.push(
				ecs.jobs.add( 18, () => {
					e.components.get( BODY ).vy = 0;
				} )
			);
		} );
	};
	callbacks[3] = () => {
		resetPlayer( 71, 27 );
		currentLevel = 3;
		ecs.removeComponent( player, KEYBOARDCONTROL );
		resetLevel3();
		camSystem.clamp( null );
		zzfxP( ResourceManager.get( 'teleport' ) );
		const readyText = TextFactory( 65, 26, 'Level 3 & 4 - Ready', 'bold 64px Courier New' );
		scaffold.addComponent( BLINK );
		ecs.jobs.add( 3, () => {
			ecs.killEntity( readyText );
			ecs.addComponent( player, ecs.getNextComponent( KEYBOARDCONTROL ) );
			startLevel3();
		} );
	};

	// setup level 3
	pickupSystem.addZone( {
		x: 50.5,
		y: 37,
		width: 1,
		height: 1,
		callback: callbacks[3]
	} );

	const createSaw = ( x, y, vx = 10, delay = 1 ) => {
		const entity = TileFactory( x, y, 0, 0, 17 * 3, 17 * 4, true );
		scaffold.entity.components.get( BODY ).angularVelocity = Math.PI * 2;
		scaffold.entity.components.get( BODY ).anchorX = 0.5;
		scaffold.entity.components.get( BODY ).anchorY = 0.5;
		ecs.jobs.add( delay, () => {
			entity.components.get( BODY ).vx = vx;
			ecs.jobs.add( 2, () => {
				ecs.killEntity( entity );
			})
		} );
	};
	callbacks[4] = () => {
		pickupSystem.setPlayer( null );
		const pc = player.components;
		zzfxP( ResourceManager.get( 'teleport' ) );
		camSystem.clamp( null );
		camSystem.follow( player.components.get( POSITION ) );
		ecs.removeComponent( player, [ KEYBOARDCONTROL, SPRITE, COLLIDER ] );
		pc.get( BODY ).vx = WALKSPEED;
		pc.get( BODY ).vy = 0;
		pc.get( BODY ).gravity = 0;
		ecs.jobs.add( 13 / WALKSPEED, () => {
			pickupSystem.setPlayer( player );
			resetPlayer( 84, 11 );
			camSystem.clamp( null );
			ecs.addComponent( player, ecs.getNextComponent( SPRITE ) );
			ecs.addComponent( player, ecs.getNextComponent( KEYBOARDCONTROL ) );
			ecs.addComponent( player, ecs.getNextComponent( COLLIDER ) );
			createSaw( 78.5, 10, 8, 2 );
			createSaw( 78.5, 11, 8, 2 );
			createSaw( 78.5, 12, 8, 2.3 );
			createSaw( 78.5, 26, 8, 3 );
			createSaw( 78.5, 26, 8, 3.3 );
			createSaw( 78.5, 27, 8, 3.3 );
			createSaw( 77.5, 27, 8, 3.3 );
			createSaw( 78.5, 31, 8, 5.3 );

			createSaw( 86.5, 16, -8, 2.5 );
			createSaw( 86.5, 21, -8, 3.5 );
			createSaw( 86.5, 22, -8, 3.5 );
			createSaw( 86.5, 23, -8, 3.5 );
			createSaw( 86.5, 24, -8, 3.5 );

			createSaw( 86.5, 29, -8, 4.9 );
			createSaw( 95.5, 58, -10, 13 );
		} );
	}

	// setup level 4
	pickupSystem.addZone( {
		x: 70.5,
		y: 11,
		width: 1,
		height: 1,
		callback: callbacks[4]
	} );

	// setup level 5
	createHook( 5, 51 );
	createHook( 9, 52 );
	createHook( 12, 52 );
	createHook( 15, 52 );
	createHook( 20, 54 );

	const level5jobs = [];
	const level5spikes = [];
	const resetLevel5 = () => {
		while ( level5jobs.length ) {
			ecs.jobs.cancel( level5jobs.pop() );
		}
		while ( level5spikes.length ) {
			ecs.killEntity( level5spikes.pop() );
		}
	};
	callbacks[5] = () => {
		resetPlayer( 2, 50 );
		ecs.removeComponent( player, KEYBOARDCONTROL );
		resetLevel5();
		currentLevel = 5;
		camSystem.clamp( null );
		zzfxP( ResourceManager.get( 'teleport' ) );

		const readyText = TextFactory( -1, 51, 'Level 5 - Ready', 'bold 64px Courier New' );
		scaffold.addComponent( BLINK );
		ecs.jobs.add( 3, () => {
			ecs.killEntity( readyText );
			ecs.addComponent( player, ecs.getNextComponent( KEYBOARDCONTROL ) );
		} );

		level5jobs.push(
			ecs.jobs.add( 16, () => {
				for ( let i = 0; i < 6; i++ ) {
					level5spikes.push( TileFactory( i, 53, 0, 0, 17 * 4, 17 * 3, true ) );
					level5spikes.push( TileFactory( 24 + i, 62, 0, 0, 17 * 4, 17 * 3, true ) );
				}
			} )
		);
		level5jobs.push(
			ecs.jobs.add( 21, () => {
				while ( level5spikes.length ) {
					ecs.killEntity( level5spikes.pop() );
				}
			} )
		);
	};
	pickupSystem.addZone( {
		x: 91.5,
		y: 58,
		width: 1,
		height: 1,
		callback: callbacks[5]
	} );

	const level6jobs = [];
	let level6door = null;
	const resetLevel6 = () => {
		while ( level6jobs.length ) {
			ecs.jobs.cancel( level6jobs.pop() );
		}
		if ( level6door == null ) {
			setTile( 51, 58, 18 );
			level6door = getTileEntity( 51, 58 );
		}
	};
	callbacks[6] = () => {
		resetPlayer( 46, 48 );
		ecs.removeComponent( player, KEYBOARDCONTROL );
		resetLevel6();
		currentLevel = 6;
		camSystem.clamp( {
			x: 41,
			y: 46,
			width: 11,
			height: 18-9
		} );
		
		zzfxP( ResourceManager.get( 'teleport' ) );

		const createFallingPiece = ( x ) => {
			const e = TileFactory( x + 42, 46, 0, 19, 17 * 3, 17 * 6, true );
			// Schedule destroy entity
			ecs.jobs.add( 12 / 19, () => {
				e.components.get( BODY ).vy = 0;
				ecs.removeComponent( e, [ DAMAGE ] );
				ecs.addComponent( e, ecs.getNextComponent( ANIMATION ) );
				e.components.get( ANIMATION ).key = 'implosion';
				ecs.jobs.add( 0.4, () => {
					ecs.killEntity( e );
				} );
			} );

			return e;
		};

		const readyText = TextFactory( 44, 50, 'Level 6', 'bold 64px Courier New' );
		scaffold.addComponent( BLINK );
		const readyText2 = TextFactory( 44, 51, 'Ready', 'bold 64px Courier New' );
		scaffold.addComponent( BLINK );
		ecs.jobs.add( 3, () => {
			ecs.killEntity( readyText );
			ecs.killEntity( readyText2 );
			ecs.addComponent( player, ecs.getNextComponent( KEYBOARDCONTROL ) );
			for ( let i = 0; i < 13; i++ ) {
				level6jobs.push( 
					ecs.jobs.add( i, () => {
						createFallingPiece( Math.floor( player.components.get( POSITION ).x - 42 ) );
					} )
				);
			}
		} );

		level6jobs.push(
			ecs.jobs.add( 17, () => {
				const door = level6door;
				ecs.addComponent( door, ecs.getNextComponent( ANIMATION ) );
				door.components.get( ANIMATION ).key = 'implosion';
				ecs.jobs.add( 0.4, () => {
					setTile( 51, 58, 0 );
					ecs.killEntity( door );
					level6door = null;
				} );
			} )
		);
	}
	// Setup level 6
	pickupSystem.addZone( {
		x: 27.5,
		y: 62,
		width: 1,
		height: 1,
		callback: callbacks[6]
	} );
	pickupSystem.addZone( {
		x: 53,
		y: 58,
		width: 1,
		height: 1,
		callback: () => {
			if ( ! level6door ) {
				setTile( 51, 58, 18 );
			}
		}
	} );

	callbacks[7] = () => {
		resetPlayer( 98.5, 2 );
		ecs.removeComponent( player, KEYBOARDCONTROL );
		currentLevel = 7;
		camSystem.clamp( null );

		zzfxP( ResourceManager.get( 'teleport' ) );
		const readyText = TextFactory( 94.5, -1, 'Level 7 - Ready', 'bold 64px Courier New' );
		scaffold.addComponent( BLINK );
		ecs.jobs.add( 3, () => {
			ecs.killEntity( readyText );
			ecs.addComponent( player, ecs.getNextComponent( KEYBOARDCONTROL ) );
		} );
	}
	// Setup level 7
	pickupSystem.addZone( {
		x: 55.5,
		y: 58,
		width: 1,
		height: 1,
		callback: callbacks[7]
	} );
	pickupSystem.addZone( {
		x: 100,
		y: 2,
		width: 2,
		height: 1,
		callback: () => {
			// Going down
			const pc = player.components;
			pc.get( BODY ).vy = 62 / 5;
			pc.get( BODY ).gravity = 0;
		}
	} );
	pickupSystem.addZone( {
		// Going up
		x: 103,
		y: 61,
		width: 3,
		height: 1,
		callback: () => {
			const pc = player.components;
			pc.get( BODY ).vy = - 62 / 5;
			pc.get( BODY ).gravity = 0;
		}
	} );
	pickupSystem.addZone( {
		// At bottom ... stable
		x: 98,
		y: 62,
		width: 8,
		height: 1,
		callback: () => {
			const pc = player.components;
			pc.get( BODY ).gravity = GRAVITY;
		}
	} );
	pickupSystem.addZone( {
		// at the top. back to stable
		x: 103,
		y: 5,
		width: 3,
		height: 1,
		callback: () => {
			const pc = player.components;
			pc.get( BODY ).gravity = GRAVITY;
		}
	} );
}

let animationFrame = null;
function update( timestamp ) {
	let delta = ( timestamp - lastFrameTimestamp );
	lastFrameTimestamp = timestamp;

	ecs.update( delta / 1000 );

	animationFrame = requestAnimationFrame( update );
	frames++;
	perSecond += delta;

	if ( perSecond > 1000 ) {
		window.fps = Math.round( frames / perSecond * 1000 );
		perSecond = 0;
		frames = 0;
	}
}

scaffold
.create()
.addComponent( POSITION, { x: -10, y: 1 } )
.addComponent( BODY, {
	width: 1,
	height: 1,
	anchorX: 0,
	anchorY: 0
} )
.addComponent( TEXT, {
	content: 'Press <SPACE> to start',
	font: 'bold 64px Courier New',
	fillStyle: '#FFFFFF'
});
const introText = scaffold.entity;
scaffold
.create()
.addComponent( POSITION, { x: -10, y: 2 } )
.addComponent( BODY, {
	width: 1,
	height: 1,
	anchorX: 0,
	anchorY: 0
} )
.addComponent( TEXT, {
	content: 'Yes, this is a little dumb but we need it for AudioContext ¯\\_(ツ)_/¯',
	font: 'normal 14px Courier New',
	fillStyle: '#FFFFFF'
});
const introText2 = scaffold.entity;
let introGuy;
ResourceManager.load( 'tileset', IMAGE, SpriteSheet );
ResourceManager.ready().then( () => {
	scaffold
	.create()
	.addComponent( POSITION, {x: -10.2, y: -1.2 } )
	.addComponent( BODY, {
		width: 1/16 * 8,
		height: 1/16 * 11,
	} )
	.addComponent( TEXTURE, { key: 'tileset' } )
	.addComponent( ANIMATION, {
		key: 'idle'
	} )
	.addComponent( SPRITE, {
		textureOffsetX: 17 * 6,
		textureOffsetY: 17 * 2
	} );
	introGuy = scaffold.entity;
});

const bootstrap = (e) => {
	if ( e.code === 'Space' ) {
		introText.components.get( TEXT ).content = 'Loading ...';
		window.removeEventListener( 'keyup', bootstrap );
	} else {
		return;
	}

	initAudioContext();
	ResourceManager.load( 'endTheme', MUSIC, endTheme );
	ResourceManager.load( 'mainTheme', MUSIC, mainTheme );
	ResourceManager.load( 'explosion', FX, explosion );
	ResourceManager.load( 'teleport', FX, teleport );
	ResourceManager.load( 'jump', FX, jump );
	ResourceManager.load( 'land', FX, land );
	ResourceManager.load( 'hook', FX, fireHook );
	ResourceManager.ready().then( () => {
		ecs.killEntity( introText );
		ecs.killEntity( introText2 );
		ecs.killEntity( introGuy );
		startGame();
	} );
};
window.addEventListener( 'keyup', bootstrap );

lastFrameTimestamp = performance.now();
animationFrame = requestAnimationFrame( update );

// Prevent game from running while out of focus.
window.addEventListener( 'blur', () => {
	cancelAnimationFrame( animationFrame );
	window.addEventListener( 'focus', () => {
		lastFrameTimestamp = performance.now();
		animationFrame = requestAnimationFrame( update );
	}, {
		once: true
	} );
} );

// Prevent game from running while out of focus.
window.addEventListener( 'blur', () => {
	cancelAnimationFrame( animationFrame );
	window.addEventListener( 'focus', () => {
		lastFrameTimestamp = performance.now();
		animationFrame = requestAnimationFrame( update );
	}, {
		once: true
	} );
} );