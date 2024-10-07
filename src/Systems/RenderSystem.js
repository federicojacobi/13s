import { System } from "ant-ecs";
import { BODY, CAMERA, DAMAGE, HOOK, LEFT, POSITION, RIGHT, SPRITE, TEXT, TEXTURE } from "../constants";
import ResourceManager from "../ResourceManager";

const viewRect = {
	x: 0,
	y: 0,
	left: 0,
	right: 0,
	top: 0,
	bottom: 0,
};

const TILEWIDTH = 8;
const TILEHEIGHT = 8;

let paintedSprites = 0;

export default class RenderSystem extends System {
	constructor( canvas ) {
		super();
		this.view = canvas;
		this.ctx = canvas.getContext( '2d' );
		this.ctx.imageSmoothingEnabled = false;

		console.log( 'RenderSystem.1 started' );

		this.cameraSelector = ( e ) => e.components.has( CAMERA );
		this.spriteSelector = ( e ) => e.components.has( POSITION ) && e.components.has( BODY ) &&  e.components.has( SPRITE );

		this.textSelector = ( e ) => e.components.has( POSITION ) && e.components.has( TEXT );
	}

	update( delta ) {
		const ctx = this.ctx;
		paintedSprites = 0;

		ctx.clearRect( 0, 0, this.view.width, this.view.height );

		this.ecs.query( this.cameraSelector ).forEach( camera => {
			const camPosition = camera.components.get( POSITION );
			const ZOOM = camera.components.get( CAMERA ).zoom;

			viewRect.x = camPosition.x * TILEWIDTH * ZOOM;
			viewRect.y = camPosition.y * TILEHEIGHT * ZOOM;
			viewRect.left = ( viewRect.x - this.view.width / 2 ) / ZOOM;
			// viewRect.right = ( viewRect.x + this.view.width / 2 ) / ZOOM;
			viewRect.top = ( viewRect.y - this.view.height / 2 ) / ZOOM;
			// viewRect.bottom = ( viewRect.y + this.view.height / 2 ) / ZOOM;
			// viewRect.w = ( viewRect.right - viewRect.left ) / ZOOM;
			// viewRect.h = ( viewRect.bottom - viewRect.top ) / ZOOM;

			this.ecs.query( this.spriteSelector ).forEach( ( entity ) => {
				const position = entity.components.get( POSITION );
				const body = entity.components.get( BODY );
				const sprite = entity.components.get( SPRITE );

				const dw = sprite.displayWidth * TILEWIDTH;
				const dh = sprite.displayHeight * TILEHEIGHT;

				let dx = position.x * TILEWIDTH - dw * body.anchorX - viewRect.left;
				let dy = position.y * TILEHEIGHT - dh * body.anchorY - viewRect.top;

				if (
					dx + dw < 0 ||
					dx * ZOOM > this.view.width ||
					dy + dh < 0 ||
					dy * ZOOM > this.view.height
				) {
					// Culling
					return;
				}

				if ( position.rotation > 0 ) {
					ctx.translate(
						( dx + dw * body.anchorX ) * ZOOM,
						( dy + dh * body.anchorY ) * ZOOM
					);
					dx = 0 - dw * body.anchorX;
					dy = 0 - dh * body.anchorY;
					ctx.rotate( position.rotation );
				}
				
				ctx.strokeStyle = '#ff0000';
				ctx.lineWidth = 1;

				if ( sprite.alpha && sprite.alpha > 0 ) {
					ctx.globalAlpha = sprite.alpha;
				}

				if ( 
					body && (
					body.touchUp ||
					body.touchDown ||
					body.touchLeft ||
					body.touchRight
					)
				) {
					ctx.strokeStyle = '#00ff00';
				}

				if ( entity.components.has( TEXTURE ) ) {
					const texture = ResourceManager.get( entity.components.get( TEXTURE ).key );
					ctx.save();
					if ( body.facing === LEFT ) {
						ctx.translate( dx * ZOOM + sprite.displayWidth * TILEWIDTH * ZOOM, dy * ZOOM );
						ctx.scale( -1, 1 );
						ctx.drawImage(
							texture,
							sprite.textureOffsetX, sprite.textureOffsetY,
							sprite.width, sprite.height,
							0, 0,
							dw * ZOOM, dh * ZOOM
						);
					} else {
						ctx.drawImage(
							texture,
							sprite.textureOffsetX, sprite.textureOffsetY,
							sprite.width, sprite.height,
							dx * ZOOM, dy * ZOOM,
							dw * ZOOM, dh * ZOOM
						);
					}

					ctx.restore();
					paintedSprites++;
				}

				if ( body ) {
					const bw = body.width * TILEWIDTH;
					const bh = body.height * TILEHEIGHT;
					const bx = position.x * TILEWIDTH - ( bw * body.anchorX ) - viewRect.left;
					const by = position.y * TILEHEIGHT - ( bh * body.anchorY ) - viewRect.top;
					ctx.strokeStyle = '#00FF00';
					// if ( entity.components.has( DAMAGE ) ){
					// 	ctx.strokeStyle = '#FF0000';
					// }
					// ctx.strokeRect( bx * ZOOM, by * ZOOM, bw * ZOOM, bh * ZOOM );

					const hook = entity.components.get( HOOK );
					if ( hook ) {
						ctx.strokeStyle = '#FFFFFF';
						ctx.lineWidth = 3;
						ctx.beginPath();
						ctx.moveTo( (position.x * TILEWIDTH - viewRect.left) * ZOOM , (position.y * TILEHEIGHT - viewRect.top) * ZOOM );
						ctx.lineTo(
							( hook.x * TILEWIDTH - viewRect.left ) * ZOOM,
							( hook.y * TILEHEIGHT - viewRect.top ) * ZOOM
						);
						ctx.stroke();
					}
				}

				ctx.globalAlpha = 1;
				ctx.resetTransform();
			} );

			this.ecs.query( this.textSelector ).forEach( ( entity ) => {
				const position = entity.components.get( POSITION );
				const text = entity.components.get( TEXT );
	
				if ( text.content ) {
					const dx = position.x * TILEWIDTH - viewRect.left;
					const dy = position.y * TILEHEIGHT - viewRect.top;
	
					if ( text.fillStyle ) {
						ctx.fillStyle = text.fillStyle;
					}
					if ( text.font ) {
						ctx.font = text.font;
					}
					ctx.save();
					ctx.globalAlpha = text.opacity;
					ctx.fillText( text.content, dx * ZOOM, dy * ZOOM );
					ctx.restore();
				}
			} );
		} );

		// ctx.fillStyle = "#f00";
		// ctx.font = 'normal 10px Arial';
		// ctx.fillText( 'FPS: ' + window.fps, 10, 10 );
		// ctx.fillText( 'Sprites: ' + paintedSprites, 10, 20 );
	}
}