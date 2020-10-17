import 'module-alias/register';
import Core from "@lib/Core";
import Initialize from "@lib/Initialize";


class Start extends Initialize {
    core: Core;
    constructor() {
        super();
        this.core = new Core(this);
    }
    PostStart() {
        console.log("Server up and running");
    }

    NoPageFound() {
        this.res.Send("404 and heartbreak");
    }
    IndexAction() {
        this.res.Send("You have reaced the index \n Hello");
        console.log("hell")
    }
}
new Start();