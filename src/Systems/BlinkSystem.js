import { System } from "ant-ecs";
import { BLINK, TEXT } from "../constants";

export default class BlinkSystem extends System {
	constructor() {
		super();
		console.log( 'Blink system ON' );
		this.query = e => e.components.has( BLINK );
	}

	update( delta ) {
		this.ecs.query( this.query ).forEach( entity => {
			const blink = entity.components.get( BLINK );
			blink.accumulator += delta;
			if ( blink.accumulator > blink.speed ) {
				blink.accumulator = 0;
				if ( entity.components.has( TEXT ) ) {
					let opacity = entity.components.get( TEXT ).opacity;
					if ( opacity == 1 ) {
						entity.components.get( TEXT ).opacity = 0;
					} else {
						entity.components.get( TEXT ).opacity = 1;
					}
				}
			}
		} );
	}
}