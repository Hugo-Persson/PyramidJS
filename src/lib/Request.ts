import http from "http";
import querystring from "querystring";
import { ActionType } from "./Controller";

export default class Request {
    private req: http.IncomingMessage;
    private queryStringsSave: object;
    private privateParam: object = {};
    private parsedCookies: object = {};

    public authed = false;

    readonly body: any;
    constructor(req: http.IncomingMessage, body: any) {
        this.req = req;
        this.queryStringsSave = querystring.parse(req.url);

        const pathSegments = req.url.split("/");
        if (pathSegments.length > 3) {
            for (let index = 3; index + 1 < pathSegments.length; index += 2) {
                const element = pathSegments[index];
                this.privateParam[element] = pathSegments[index + 1];
            }
        }
        this.parsedCookies = this.parseCookies();
        this.body = body;
    }

    private parseCookies(): object {
        if (!this.req.headers.cookie) {
            return {};
        }
        const chunks = this.req.headers.cookie.split(";");
        const result = {};
        chunks.map((value) => {
            const pairs = value.split("=");
            if (pairs.length != 2) return;
            result[pairs[0].trim()] = pairs[1];
        });
        return result;
    }

    public get queryStrings(): object {
        return this.queryStrings;
    }
    public get params(): object {
        return this.privateParam;
    }
    public get cookies(): object {
        return this.parsedCookies;
    }
    public get method(): ActionType {
        return ActionType[this.req.method];
    }
}
