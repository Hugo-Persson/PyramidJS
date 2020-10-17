import Controller from "../lib/Controller";

export default class Index extends Controller {

    public Index() {
        console.log("This is the index method, it is called when no actions is specified");
    }
    public NewUser() {
        this.res.Send("Create a new user here");
    }

}