import Controller from "@lib/Controller";


export default class Users extends Controller {
    public index(){
        this.res.send("Hey");
    }
}
