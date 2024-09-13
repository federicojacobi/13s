import { System } from "ant-ecs";
import { BODY, HOOK, POSITION } from "../constants";
import { getTile } from "../helpers/MapBuilder";

export default class HookSystem extends System {
	constructor() {
		super();
		console.log( 'Hook System on' );
		this.selector = ( e ) => e.components.has( HOOK );
	}

	update( delta ) {
		this.ecs.query( this.selector ).forEach( entity => {
			const hook = entity.components.get( HOOK );
			const position = entity.components.get( POSITION );
			const body = entity.components.get( BODY );

			hook.elapsed += delta;

			if ( hook.hooked ) {
				// Hook is attached and pulling.
				const vec = {
					x: hook.x - position.x,
					y: hook.y - position.y
				};

				const len = Math.sqrt( vec.x * vec.x + vec.y * vec.y );
				if ( len >= 0.5 && hook.elapsed <= 1 ) {
					vec.x = vec.x / len;
					vec.y = vec.y / len;

					body.vx = vec.x * 15;
					body.vy = vec.y * 15;
				} else {
					hook.x = 0;
					hook.y = 0;
					hook.hooked = false;
					body.vx = body.vx / 2;
					body.vy = body.vy / 2;
					this.ecs.removeComponent( entity, HOOK );
				}

			} else {
				// Hooks flying in a direction.
				if ( hook.elapsed >= 1 ) {
					this.ecs.removeComponent( entity, [ HOOK ] );
					return;
				}
				hook.x += hook.vx * delta;
				hook.y += hook.vy * delta;

				if ( getTile( hook.x, hook.y ) > 0 ) {
					hook.vx = 0;
					hook.vy = 0;
					hook.elapsed = 0;
					hook.hooked = true;
				}
			}
		} );
	}
}