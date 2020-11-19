import Controller, { GET, POST } from "@lib/Controller";
import IndexView from "@views/IndexView";
import { PassThrough } from "stream";
import { addMiddleware } from "@lib/Middleware";
import AuthenticationController from "@controllers/AuthenticationController";

import Request from "@lib/Request";
import Response from "@lib/Response";

export default class Dashboard extends Controller {
    public tryParams() {
        this.res.json(this.req.params);
    }

    @GET
    @addMiddleware([
        AuthenticationController.checkAuthentication,
        AuthenticationController.secondMiddle,
    ])
    public async tryViews() {
        console.log("RUN");
        this.res.render(new IndexView("Jesus"));
    }
    @GET
    public async tryCookies() {
        await this.tryViews();
        this.tryViews();
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
