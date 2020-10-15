import { format } from "path";
import Init from "../App";
import { Controller } from "./Controller";
import readline from "readline"

Init();
asyncRun();

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
        instance["greet"]();
        //console.log(instance instanceof Controller);

    }
    catch (erro) {
        console.log("FIle doesn't exist");
    }

});


