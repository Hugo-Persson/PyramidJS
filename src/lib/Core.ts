import readline from "readline";
import http from "http";
// ---------------------------------- //
import Controller from "@lib/Controller";
import Initialize from "@lib/Initialize";
import Request from "@lib/Request";
import Response from "@lib/Response";


export default class Core {
    private port: number = parseInt(process.env.PORT) || 3000;


    private server: http.Server;
    private initObj: Initialize;
    /**
     * @param {Initialize} init - Your init object
     * 
     */
    constructor(init: Initialize) {
        init.PreStart();
        this.StartServer();
        this.initObj = init;
        init.PostStart(this.port);

    }
    private StartServer(): void {
        this.server = http.createServer(this.HandleHttpRequest);
        this.server.listen(this.port);
    }

    private ImportController(controller: string): Promise<Controller> {
        return new Promise<Controller>(async (resolve, reject) => {
            try {
                var importedFile = await import(`../controllers/${controller}`);
                var ImportedClass = importedFile.default;
            }
            catch (error) {
                reject("404")
                return;
            }
            if (!ImportedClass) {
                reject("404");
                return;
            }
            if (!(ImportedClass.prototype instanceof Controller)) {
                reject("404")
            }
            const instance = new ImportedClass();
            console.log(instance);

            resolve(instance);
        });
    }


    private HandleHttpRequest = async (req: http.IncomingMessage, res: http.OutgoingMessage): Promise<void> => {
        const chunks: Array<string> = req.url.split("/");

        chunks.shift(); // Remove empty element in the start
        let controller: Controller | Initialize;
        let action: Function;

        if (chunks[0] == "") { // the / route
            controller = this.initObj;
            action = this.initObj.IndexAction;
        }
        else {
            if (chunks.length == 1) {
                chunks.push("Index"); // If they don't specify a action then we default it to an index action
            }
            try {
                controller = await this.ImportController(chunks[0]);
                if (controller[chunks[1]]) {
                    action = controller[chunks[1]];
                }
                else {
                    controller = this.initObj;
                    action = this.initObj.NoPageFound;
                }
            }
            catch (error) {
                if (error == "404") {
                    controller = this.initObj;
                    action = this.initObj.NoPageFound;
                }
            }
        }

        controller.req = new Request(req);
        controller.res = new Response(res);
        action.bind(controller)(); // I don't want to force the user to declare arrow functions for every function so instead I overwrite the this and now they can write this.req
    }



}

