require("dotenv").config();
import http from "http";
import fs from "fs/promises";
// ---------------------------------- //
import Controller, { ActionType } from "@lib/Controller";
import Initialize from "@lib/Initialize";
import Request from "@lib/Request";
import Response from "@lib/Response";
import { Model } from "@lib/Model";
import { runInThisContext } from "vm";

export default class Core {
    private port: number = parseInt(process.env.PORT) || 3000;
    private userEnabledStaticFiles;

    private server: http.Server;
    private initObj: Initialize;
    /**
     * @param {Initialize} init - Your init object
     *
     */
    constructor(init: Initialize, enableStaticFiles = false) {
        this.userEnabledStaticFiles = enableStaticFiles;
        this.initObj = init;
        this.startServer();
    }
    private async startServer(): Promise<void> {
        this.initObj.preStart();
        await Model.startDatabaseConnection();
        this.server = http.createServer(this.handleHttpRequest);
        this.server.listen(this.port, "localhost", () =>
            this.initObj.postStart(this.port)
        );
    }

    private importController(controller: string): Promise<Controller> {
        return new Promise<Controller>(async (resolve, reject) => {
            try {
                var importedFile = await import(
                    `../controllers/${controller}Controller`
                ); // eslint-disable-line no-use-before-define

                var ImportedClass = importedFile.default; // eslint-disable-line no-use-before-define
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

            resolve(instance);
        });
    }

    private handleHttpRequest = async (
        req: http.IncomingMessage,
        res: http.ServerResponse
    ): Promise<void> => {
        const chunks: Array<string> = req.url.split("/");
        if (await this.getStaticFile(req, res)) return;
        chunks.shift(); // Remove empty element in the start
        let controller: Controller | Initialize;
        let action: string;

        if (chunks[0] == "") {
            // the / route
            controller = this.initObj;
            action = "indexAction";
        } else {
            if (chunks.length == 1) {
                chunks.push("index"); // If they don't specify a action then we default it to an index action
            }
            try {
                controller = await this.importController(chunks[0]);
                action = chunks[1];
            } catch (error) {
                if (error == "404") {
                    controller = this.initObj;
                    action = "noPageFound";
                } else {
                    console.log(error);
                    return;
                }
            }
        }

        controller.req = new Request(req);
        controller.res = new Response(res);
        if (
            action == "noPageFound" ||
            !(await controller.runAction(action, ActionType[req.method]))
        ) {
            this.initObj.req = controller.req;
            this.initObj.res = controller.res;
            await this.initObj.noPageFound();
        }
        if (!controller.res.sendingFile) controller.res.end();
        console.log("ended");
    };

    private async getStaticFile(
        req: http.IncomingMessage,
        res: http.ServerResponse
    ): Promise<boolean> {
        if (this.userEnabledStaticFiles) {
            try {
                const stat = await fs.lstat(
                    process.cwd() + "/public" + req.url
                );

                if (stat.isFile()) {
                    const responseObj = new Response(res);
                    responseObj.sendFile(process.cwd() + "/public/" + req.url);
                    return true;
                } else {
                    return false;
                }
            } catch (error) {
                return false;
            }
        } else {
            return false;
        }
    }
}
