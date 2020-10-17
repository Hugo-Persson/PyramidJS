import 'module-alias/register';
import Core from "@lib/Core";
import Initialize from "@lib/Initialize";
import { start } from "repl";


class Start extends Initialize {
    constructor() {
        super();
        new Core(this);
    }
    PostStart() {
        console.log("Server up and running");
    }
}
new Start();