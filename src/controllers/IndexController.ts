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
        const user = new Users(undefined, "Hugo");
        const result: Array<Users> = await Users.getManyRowsByFilter<Users>(
            user
        );
        console.log(result);
        const result2: Users = await Users.getSingleRowByFilter(user);
        console.log("RESULT 2", result2);
    }
    public getUserFile(): void {
        this.res.download(process.cwd() + "/resources/index.html");
    }
    public tryModels(): void {
        //const userInstance = new Users();
    }
    public async editUser() {
        const user = new Users(1);
        const result2: Users = await Users.getSingleRowByFilter(user);
        result2.name = "Anton";
        result2.save();
    }
    /**
     * deleteUser
     */
    public async deleteUser() {
        const filter = new Users(1);
        const result: Users = await Users.getSingleRowByFilter(filter);
        await result.delete();
    }
    /**
     * tryRelationShio
     */
    public async tryRelationShips() {
        const user = await Users.getSingleRowByFilter(new Users(2));
        this.res.send(JSON.stringify(await user.cars));
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