import Controller from "@lib/Controller";
import IndexView from "@views/IndexView";

export default class Dashboard extends Controller {
    public tryParams() {
        this.res.json(this.req.params);
    }
    public tryViews() {
        this.res.render(new IndexView("Jesus"));
    }
}
