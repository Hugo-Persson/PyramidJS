import Controller from "../lib/Controller";
import { addMiddleware, IMiddlewareFunction } from "@lib/Middleware";
import Request from "@lib/Request";
import Response from "@lib/Response";
import Users from "@models/Users";
import Cars from "@models/Cars";

export default class Index extends Controller {
    public index(): void {
        console.log(
            "This is the index method, it is called when no actions is specified"
        );
    }

    @addMiddleware([middlewareExample, middlewareExampleSecond])
    public async newUser(): Promise<void> {
        const user = new Users(undefined, "Hugo");
        await user.save();
        const cars = new Cars(35);
        this.res.send("Create a new user here");
    }
    public async getUserByFilter(): Promise<void> {
        const user = new Users(1);

        console.log(await Users.getRowByFilter(user, Users));
    }
    public getUserFile(): void {
        this.res.download(process.cwd() + "/resources/index.html");
    }
    public tryModels(): void {
        //const userInstance = new Users();
    }
}
function middlewareExample(req: Request, res: Response, next: Function): void {
    console.log("WHOAH I AM A MIDDLEWARE");
    next();
}
function middlewareExampleSecond(
    req: Request,
    res: Response,
    next: Function
): void {
    console.log("WHOAH I AM ALSO A MIDDLEWARE");
    next();
}
