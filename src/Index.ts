import "module-alias/register";
import Core from "@lib/Core";
import Initialize from "@lib/Initialize";
import Controller, { GET } from "@lib/Controller";
import cors from "@lib/Cors";

class Start extends Initialize {
    core: Core;

    constructor() {
        super();
        Controller.applicationSpecificMiddleware.push(cors);
        this.core = new Core(this, true);
    }
    async postStart(port: number) {
        console.log("Server up and running on port " + port);
    }
    @GET
    async noPageFound() {
        this.res.send("404 and heartbreak");
    }
    @GET
    indexAction() {
        this.res.sendFile(process.cwd() + "/resources/index.html");
    }
}
new Start();
