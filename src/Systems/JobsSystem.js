import { System } from "ant-ecs";

let elapsedTime = 0;

const getID = ( () => {
	let nextId = 0;
	return () => ++nextId;
} )();

class Job {
	constructor( t, cb ) {
		this.id = getID();
		this.t = t;
		this.cb = cb;
		this.n = null;
	}
}

class JobsLinkedList {
	constructor() {
		this.flush();
	}

	flush() {
		// POTENTIAL MEMORY LEAK ... WE NEED TO DELETE THE OBJECTS.
		this.head = null;
		this.length = 0;
	}

	add( t, cb ) {
		const newNode = new Job( t, cb );

		// If the list is empty or the new node should be the new head
		if ( this.head === null || this.head.t >= newNode.t) {
			newNode.n = this.head;
			this.head = newNode;
		} else {
			let current = this.head;

			// Traverse the list to find the correct position
			while ( current.n !== null && current.n.t < newNode.t) {
				current = current.n;
			}
			newNode.n = current.n;
			current.n = newNode;
		}
		this.length++;
		
		return newNode.id;
	}

	pop() {
		if ( this.length == 0 ) {
			throw 'EMPTY LIST';
		}

		const topNode = this.head;
		this.head = this.head.n;
		this.length--;

		return topNode;
	}

	remove( id ) {
		let current = this.head;
		let previous = null;

		while ( current !== null ) {
			if ( current.id === id ) {
				if ( previous === null ) {
					this.head = current.n;
				} else {
					previous.n = current.n;
				}
				this.length--;
				return current;
			}
			previous = current;
			current = current.n;
		}

		return null;
	}
}

const schedule = new JobsLinkedList();

export default class JobsSystem extends System {
	update( delta ) {
		elapsedTime += delta;
		while ( schedule.head != null && schedule.head.t <= elapsedTime ) {
			const job = schedule.pop();
			job.cb();
		}
	}

	add( t, cb ) {
		return schedule.add( elapsedTime + t, cb );
	}

	cancel( jobID ) {
		schedule.remove( jobID );
	}

	flush() {
		// clear list.
	}
}
