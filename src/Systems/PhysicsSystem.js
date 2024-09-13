import { System } from "ant-ecs";
import { BODY, COLLIDER, POSITION } from "../constants";
import { getTile } from "../helpers/MapBuilder";
import { zzfxP } from "../helpers/zzfxm";
import ResourceManager from "../ResourceManager";

export default class PhysicsSystem extends System {
	constructor( scene ) {
		super( scene );
		this.query = e => e.components.has( BODY );
	}

	update( delta ) {
		this.ecs.query( this.query ).forEach( entity => {
			let position = entity.components.get( POSITION );
			let body = entity.components.get( BODY );

			if ( body.immovable ) {
				return;
			}

			const nextPos = {
				x: position.x + ( body.vx * delta ),
				y: position.y + ( body.vy * delta ) + ( 0.5 * body.gravity * delta * delta ),
				width: body.width,
				height: body.height,
				vx: body.vx,
				vy: body.vy + body.gravity * delta,
			};
			nextPos.top = nextPos.y - body.height * body.anchorY;
			nextPos.bottom = nextPos.y + ( body.height * ( 1 - body.anchorY ) );
			nextPos.left = nextPos.x - body.width * body.anchorX;
			nextPos.right = nextPos.x + ( body.width * ( 1 - body.anchorX ) );

			if ( entity.components.has( COLLIDER ) ) {
				// X collision
				if (
					getTile( nextPos.right, position.y - body.height * body.anchorY ) > 0 ||
					getTile( nextPos.right, position.y + ( body.height * ( 1 - body.anchorY ) ) - 0.1 ) > 0
				) {
					// colliding right
					// nextPos.vx = 0;
					nextPos.x = position.x;
					nextPos.left = nextPos.x - body.width * body.anchorX;
					nextPos.right = nextPos.x + ( body.width * ( 1 - body.anchorX ) );
					body.touchRight = true;
				} else if (
					getTile( nextPos.left, position.y - body.height * body.anchorY ) > 0 ||
					getTile( nextPos.left, position.y + ( body.height * ( 1 - body.anchorY ) ) - 0.1 ) > 0
				) {
					// collide left
					// nextPos.vx = 0;
					nextPos.x = position.x;
					nextPos.left = nextPos.x - body.width * body.anchorX;
					nextPos.right = nextPos.x + ( body.width * ( 1 - body.anchorX ) );
					body.touchLeft = true;
				} else {
					body.touchLeft = false;
					body.touchRight = false;
				}

				// Y collision
				if (
					getTile( nextPos.left, nextPos.top + 0.1 ) > 0 ||
					getTile( nextPos.right, nextPos.top + 0.1 ) > 0 ||
					nextPos.top <= 0
				) {
					// colliding top
					nextPos.vy *= -0.5;
					nextPos.y = position.y;
					nextPos.top = nextPos.y - body.height * body.anchorY;
					nextPos.bottom = nextPos.y + ( body.height * ( 1 - body.anchorY ) );
					body.touchUp = true;
				} else if (
					getTile( nextPos.left, nextPos.bottom ) > 0 ||
					getTile( nextPos.right, nextPos.bottom ) > 0
				) {
					// colliding bottom
					nextPos.vy = 0;
					// nextPos.y = Math.floor( position.y ) + body.anchorY * body.height;
					nextPos.y = Math.floor( nextPos.bottom ) - ( body.height * ( 1 - body.anchorY ) );

					nextPos.top = nextPos.y - body.height * body.anchorY;
					nextPos.bottom = nextPos.y + ( body.height * ( 1 - body.anchorY ) );
					if ( ! body.touchDown && body.vy > 7 ) {
						zzfxP( ResourceManager.get( 'land' ) );
					}
					body.touchDown = true;
				} else {
					body.touchUp = false;
					body.touchDown = false;
				}
			}

			position.x = nextPos.x;
			position.y = nextPos.y;
			body.vx = nextPos.vx;
			body.vy = nextPos.vy;

			position.angle += body.angularVelocity * delta;
		} );
	}
}