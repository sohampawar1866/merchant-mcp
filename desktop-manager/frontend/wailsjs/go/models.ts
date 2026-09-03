export namespace main {
	
	export class ConfigState {
	    envExists: boolean;
	    encryptionPassphrase: string;
	    gatewayPort: string;
	    mcpTransport: string;
	    customerAppPort: string;
	    postgresPort: string;
	    redisPort: string;
	    includeSimulation: boolean;
	
	    static createFrom(source: any = {}) {
	        return new ConfigState(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.envExists = source["envExists"];
	        this.encryptionPassphrase = source["encryptionPassphrase"];
	        this.gatewayPort = source["gatewayPort"];
	        this.mcpTransport = source["mcpTransport"];
	        this.customerAppPort = source["customerAppPort"];
	        this.postgresPort = source["postgresPort"];
	        this.redisPort = source["redisPort"];
	        this.includeSimulation = source["includeSimulation"];
	    }
	}
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
	    message: string;
	
	    static createFrom(source: any = {}) {
	        return new LaunchResult(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.success = source["success"];
	        this.error = source["error"];
	        this.message = source["message"];
	    }
	}
	export class ServiceStatus {
	    id: string;
	    name: string;
	    port: string;
	    url: string;
	    running: boolean;
	
	    static createFrom(source: any = {}) {
	        return new ServiceStatus(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.name = source["name"];
	        this.port = source["port"];
	        this.url = source["url"];
	        this.running = source["running"];
	    }
	}

}

