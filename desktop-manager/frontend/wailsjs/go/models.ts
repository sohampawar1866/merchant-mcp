export namespace main {
	
	export class DockerStatus {
	    installed: boolean;
	    running: boolean;
	    composeCmd: string;
	    message: string;
	
	    static createFrom(source: any = {}) {
	        return new DockerStatus(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.installed = source["installed"];
	        this.running = source["running"];
	        this.composeCmd = source["composeCmd"];
	        this.message = source["message"];
	    }
	}
	export class LaunchResult {
	    success: boolean;
	    error: string;
	
	    static createFrom(source: any = {}) {
	        return new LaunchResult(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.success = source["success"];
	        this.error = source["error"];
	    }
	}

}

