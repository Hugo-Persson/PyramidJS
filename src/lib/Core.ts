require('dotenv').config()
import http from "http";
// ---------------------------------- //
import Controller from "@lib/Controller";
import Initialize from "@lib/Initialize";
import Request from "@lib/Request";
import Response from "@lib/Response";
import { Model } from "@lib/Model";


export default class Core {
    private port: number = parseInt(process.env.PORT) || 3000;

    private server: http.Server;
    private initObj: Initialize;
    /**
     * @param {Initialize} init - Your init object
     *
     */
    constructor(init: Initialize) {
        this.initObj = init;
        this.startServer();
    }
    private async startServer(): Promise<void> {
        console.log("Start");
        this.initObj.preStart();
        await Model.startDatabaseConnection();
        this.server = http.createServer(this.handleHttpRequest);
        this.server.listen(this.port, "localhost", () => this.initObj.postStart(this.port));

    }

    private importController(controller: string): Promise<Controller> {
        return new Promise<Controller>(async (resolve, reject) => {
            try {
                console.log("start", `../controllers/${controller}`);
                var importedFile = await import(`../controllers/${controller}`); // eslint-disable-line no-use-before-define
                console.log(importedFile);
                var ImportedClass = importedFile.default; // eslint-disable-line no-use-before-define
                console.log(ImportedClass);
            } catch (error) {
                if (error.code == "MODULE_NOT_FOUND") reject("404");
                else reject(error);
                return;
            }
            if (!ImportedClass) {
                reject("404");
                return;
            }

            if (!(ImportedClass.prototype instanceof Controller)) {
                reject("404");
            }
            const instance = new ImportedClass();
            console.log(instance);

            resolve(instance);
        });
    }

    private handleHttpRequest = async (
        req: http.IncomingMessage,
        res: http.ServerResponse
    ): Promise<void> => {
        const chunks: Array<string> = req.url.split("/");

        chunks.shift(); // Remove empty element in the start
        let controller: Controller | Initialize;
        let action: Function;

        if (chunks[0] == "") {
            // the / route
            controller = this.initObj;
            action = this.initObj.indexAction;
        } else {
            if (chunks.length == 1) {
                chunks.push("index"); // If they don't specify a action then we default it to an index action
            }
            try {
                controller = await this.importController(chunks[0]);
                console.log(controller);
                if (controller[chunks[1]]) {
                    action = controller[chunks[1]];
                } else {
                    controller = this.initObj;
                    action = this.initObj.noPageFound;
                }
            } catch (error) {

                if (error == "404") {
                    controller = this.initObj;
                    action = this.initObj.noPageFound;
                }
                else {
                    console.log(error);
                    return;
                }
            }
        }

        controller.req = new Request(req);
        controller.res = new Response(res);
        await action.bind(controller)(); // I don't want to force the user to declare arrow functions for every function so instead I overwrite the this and now they can write this.req
        if (!controller.res.sendingFile) controller.res.end();
        console.log("ended");
    };
}
