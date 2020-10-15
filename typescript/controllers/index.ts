import { Controller } from "../lib/Controller";

export class Index extends Controller {
    constructor(message: string) {
        super();
        console.log(message);
    }

    Index() {
        console.log("HELLO WORLDD");
    }

}