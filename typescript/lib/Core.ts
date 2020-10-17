import 'module-alias/register';
import readline from "readline";
import http from "http";
// ---------------------------------- //
import { Controller } from "@lib/Controller";
import Initialize from "@lib/Initialize";


export default class Core {
    private port: number = parseInt(process.env.PORT) || 3000;
    private server: http.Server;
    /**
     * @param {Initialize} init - Your init object
     */
    constructor(init: Initialize) {
        init.PreStart();
        this.StartServer();
        init.PostStart(this.port);

    }
    private StartServer() {
        this.server = http.createServer(this.HandleHttpRequest);
    }
    private HandleHttpRequest(req: http.IncomingMessage, res: http.OutgoingMessage) {

    }
}







async function asyncRun() {


}
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

rl.question("Controller name?", async function (className: string) {
    try {
        const awaited = await import("../controllers/" + className);

        const IndexClass = awaited[className];
        const instance = new IndexClass("hello");
        instance["Index"]();
        //console.log(instance instanceof Controller);

    }
    catch (erro) {
        console.log("FIle doesn't exist");
    }

});


