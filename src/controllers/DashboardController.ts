import Controller, { GET, POST } from "@lib/Controller";
import IndexView from "@views/IndexView";
import { PassThrough } from "stream";

export default class Dashboard extends Controller {
    public tryParams() {
        this.res.json(this.req.params);
    }
    @POST
    public tryViews() {
        this.res.render(new IndexView("Jesus"));
    }
    public tryCookies() {
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
    @POST
    public tryPostBody() {
        this.res.json(this.req.body);
    }
}
