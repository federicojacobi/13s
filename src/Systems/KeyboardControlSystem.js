import { System } from "ant-ecs";
import { AIRXSPEED, ANIMATION, BODY, CAMERA, HOOK, HOOKSPEED, JUMPSPEED, KEYBOARDCONTROL, LEFT, POSITION, RIGHT, TEXT, WALKSPEED } from "../constants";
import { zzfxP } from "../helpers/zzfxm";
import ResourceManager from "../ResourceManager";

const jumpSpeed = JUMPSPEED

const keys = {
	W: false,
	A: false,
	S: false,
	D: false,
};

export default class KeyboardControlSystem extends System {
	constructor() {
		super();
		console.log( 'Keyboard System on' );

		this.query = e => e.components.has( KEYBOARDCONTROL ) && e.components.has( BODY );

		window.addEventListener( 'keydown', this.keydown );
		window.addEventListener( 'keyup', this.keyup );
	}

	keydown( e ) {
		switch ( e.code ) {
			case "KeyS":
			case "ArrowDown":
				keys.S = true;
				break;
			  
			case "KeyW":
			case "ArrowUp":
				keys.W = true;
				break;

			case "KeyA":
			case "ArrowLeft":
				keys.A = true;
				break;

			case "KeyD":
			case "ArrowRight":
				keys.D = true;
				break;

			case "KeyR":
				keys.R = true;
				break;
		}
	}

	keyup( e ) {
		switch ( e.code ) {
			case "KeyS":
			case "ArrowDown":
				keys.S = false;
				break;
			  
			case "KeyW":
			case "ArrowUp":
				keys.W = false;
				break;

			case "KeyA":
			case "ArrowLeft":
				keys.A = false;
				break;

			case "KeyD":
			case "ArrowRight":
				keys.D = false;
				break;
		}
	}

	destroy() {
		window.removeEventListener( 'keydown', this.keydown );
		window.removeEventListener( 'keyup', this.keyup );
	}

	update( delta ) {
		let entities = this.ecs.query( this.query )
		entities.forEach( entity => {
			const body = entity.components.get( BODY );
			const hook = entity.components.get( HOOK );

			if ( hook && hook.vx == 0 && hook.vy == 0 ) {
				if ( keys.W ) {
					hook.vy = - HOOKSPEED;
				} else if ( keys.S ) {
					hook.vy = HOOKSPEED;
				}

				if ( keys.A ) {
					hook.vx = - HOOKSPEED;
				} else if ( keys.D ) {
					hook.vx = HOOKSPEED;
				}

				return;
			}

			if ( keys.W && body.touchDown ) {
				body.vy = - jumpSpeed;
				zzfxP( ResourceManager.get( 'jump' ) );
			}

			if ( ( keys.A || keys.D ) ) {
				if ( keys.A && ! body.touchLeft ) {
					body.vx = body.touchDown ? -WALKSPEED : -AIRXSPEED;
					body.facing = LEFT;
					entity.components.get( ANIMATION ).key = 'walkRight';
				} else if ( keys.D && ! body.touchRight ) {
					body.vx = body.touchDown ? WALKSPEED : AIRXSPEED;
					body.facing = RIGHT;
					entity.components.get( ANIMATION ).key = 'walkRight';
				}
			} else {
				body.vx = 0;
				entity.components.get( ANIMATION ).key = 'idle';
			}
		} );
	}
}