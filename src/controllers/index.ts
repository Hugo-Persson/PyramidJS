import Controller from "../lib/Controller";
import { addMiddleware, IMiddlewareFunction } from "@lib/Middleware"
import Request from "@lib/Request";
import Response from "@lib/Response";
import Users from "@models/Cars";

export default class Index extends Controller {
    public index(): void {
        console.log(
            "This is the index method, it is called when no actions is specified"
        );
    }

    @addMiddleware([middlewareExample, middlewareExampleSecond])
    public newUser(): void {
        this.res.send("Create a new user here");
    }
    public getUserFile(): void {
        this.res.download(process.cwd() + "/resources/index.html");
    }
    public tryModels(): void {
        const userInstance = new Users();
        console.log(userInstance.cars);
    }


}
function middlewareExample(req: Request, res: Response, next: Function): void {
    console.log("WHOAH I AM A MIDDLEWARE");
    next();
}
function middlewareExampleSecond(req: Request, res: Response, next: Function): void {
    console.log("WHOAH I AM ALSO A MIDDLEWARE");
    next();
}
