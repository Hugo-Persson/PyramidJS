import Controller from "@lib/Controller";
import IndexView from "@views/IndexView";
import { PassThrough } from "stream";

export default class Dashboard extends Controller {
    public tryParams() {
        this.res.json(this.req.params);
    }
    public tryViews() {
        this.res.render(new IndexView("Jesus"));
    }
    public tryCookies() {
        console.log(this.req.cookies);
        this.res.send("hEllo");
    }
    public trySetCookie() {
        this.res.setCookie("aCookiee", "aValue");
    }
    public async tryTokens() {
        await this.setTokenData("test", { name: "Hugo Persson" });
        this.res.send("Token set");
    }
    public async testGettingTokenData() {
        this.res.json(await this.getTokenData("test"));
    }
}
