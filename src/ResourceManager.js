import { FX, IMAGE, MUSIC } from "./constants";
import { zzfxG, zzfxM } from "./helpers/zzfxm";

const promises = [];
const resources = {};

const ResourceManager = {
	load( key, type, src ) {
		if ( resources.hasOwnProperty( 'key' ) ) {
			throw `key: ${key} already exists`;
		}

		switch( type ) {
			case IMAGE:
				let image = new Image();
				image.src = src;

				let promise = new Promise( ( resolve, reject ) => {
					image.addEventListener( 'load', () => {
						resolve();
					} );
				} );

				resources[ key ] = image;
				promises.push( promise );
				break;

			case MUSIC:
				resources[ key ] = zzfxM( ...src );
				break;
				
			case FX:
				resources[ key ] = zzfxG( ...src );
				break;

			default:
				console.error( `CANT LOAD ${type} type` );
		}
	},
	get( key ) {
		return resources[key];
	},
	ready() {
		return Promise.all( promises );
	}
}

export default ResourceManager;