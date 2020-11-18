import Controller, { GET, POST } from "@lib/Controller";
import IndexView from "@views/IndexView";
import { PassThrough } from "stream";
import { addMiddleware } from "@lib/Middleware";
import AuthenticationController from "@controller/AuthenticationController";

import Request from "@lib/Request";
import Response from "@lib/Response";

export default class Dashboard extends Controller {
    public tryParams() {
        this.res.json(this.req.params);
    }

    @addMiddleware([checkAuthentication])
    @GET
    public tryViews() {
        this.res.render(new IndexView("Jesus"));
    }
    @GET
    public tryCookies() {
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
export function checkAuthentication(
    req: Request,
    res: Response,
    next: Function
): void {
    console.log("WHOAH I AM A MIDDLEWARE");
    next();
}
