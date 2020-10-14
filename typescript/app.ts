import { Index } from "./controllers/index";
import readline from "readline";

let myClass = new Index("man");


//myClass["greet"]();

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

rl.question("Class name", function (className: string) {

    rl.question("function name", function (functionName: string) {

    });
});