import { System } from "ant-ecs";
import { POSITION } from "../constants";

export default class CameraSystem extends System {
	constructor( camera ) {
		super();
		console.log( 'Camera System on' );

		this.camera = camera;
		this.followComponent = null;
		this.clampRect = null;
	}

	follow( positionComponent ) {
		this.followComponent = positionComponent;
	}

	/**
	 * 
	 * @param {*} rect Rectangle {x,y,width,height} to clamp the camera.
	 */
	clamp( rect ) {
		this.clampRect = rect;
	}

	update( delta ) {
		const camPos = this.camera.components.get( POSITION );

		if ( this.followComponent ) {
			camPos.x = this.followComponent.x;
			camPos.y = this.followComponent.y;
		}

		if ( this.clampRect ) {
			camPos.x = Math.min( Math.max( camPos.x, this.clampRect.x ), this.clampRect.x + this.clampRect.width );
			camPos.y = Math.min( Math.max( camPos.y, this.clampRect.y ), this.clampRect.y + this.clampRect.height );
		}
	}
}