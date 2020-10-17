import Controller from "../lib/Controller";

export default class Index extends Controller {
    public index(): void {
        console.log(
            "This is the index method, it is called when no actions is specified"
        );
    }

    public newUser(): void {
        this.res.send("Create a new user here");
    }
}
