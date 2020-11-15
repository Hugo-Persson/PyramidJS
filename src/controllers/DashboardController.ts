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
    @GET
    public tryCookies() {
        this.res.setCookie("something", "VALUE");
        this.res.send("hEllo");
    }
    @GET
    public trySetCookie() {
        this.res.setCookie("aCookiee", "aValue");
    }
    @GET
    public async tryTokens() {
        await this.setTokenData("test", { name: "Hugo Persson" });
        this.res.send("Token set");
    }
    @GET
    public async testGettingTokenData() {
        this.res.json(await this.getTokenData("auth"));
    }
    @POST
    public tryPostBody() {
        this.res.json(this.req.body);
    }
}
