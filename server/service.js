// Écrit par Alexis Brosseau
// 16 sept. 24

export class Route {
    
    methods = {};

    constructor(methods) {
        this.methods = methods;
    }

    async handleRequest(req, res, stack) {
        
        let arg = this.parseArg(stack);

        if (!(req.method in this.methods)) {
            res.writeHead(501);
            res.end("Error: The endpoint PATCH api/contacts is not implemented.");
            return true;
        }

        return await this.methods[req.method](req, res, arg);
    }

    parseArg(stack) {

        if (stack.length != 1)
            return null;
        
        let arg = parseInt(stack[0]);
        if (!isNaN(arg))
            return arg;

        return stack[0];
    }
}

export class Router {

    routes = {};

    constructor(routes) {
        this.routes = routes;
    }

    async handleRequest(req, res, stack) {
        
        let next = stack[0];

        if (!(next in this.routes)) return false;

        stack.shift();
        return await this.routes[next].handleRequest(req, res, stack);
    }
}

export class Service extends Router {

    headers = {};
    acesses = {};

    handleCORS(req, res) {

        if (req.headers['sec-fetch-mode'] == 'cors') {
            for (let access in this.acesses)
                 res.setHeader(access, this.acesses[access]);

            console.log("Client browser CORS check request");
        }

        if (req.method === 'OPTIONS') {
            res.end();
            console.log("Client browser CORS preflight check request");
            return true;
        }

        return false;
    }

    async respond(req, res) {

        for (let [header, val] in this.headers)
            res.setHeader(header, val);

        if (this.handleCORS(req, res))
            return true;

        let stack = req.url.split('/').filter(e => e != '');
        if (await this.handleRequest(req, res, stack)) 
            return true;

        return false;
    }
}