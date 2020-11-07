import Controller from "@lib/Controller";

export default class Dashboard extends Controller {
    public tryParams() {
        this.res.json(this.req.params);
    }
}
