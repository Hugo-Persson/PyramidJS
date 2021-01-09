import http from "http";
import querystring from "querystring";
import { ActionType } from "./Controller";

export default class Request extends http.IncomingMessage {
    private queryStringsSave: object;
    private privateParam: object = {};
    private parsedCookies: object = {};

    public authed = false;

    readonly body: any;
    constructor(socket) {
        super(socket);
        this.queryStringsSave = querystring.parse(this.url);

        const pathSegments = this.url.split("/");
        if (pathSegments.length > 3) {
            for (let index = 3; index + 1 < pathSegments.length; index += 2) {
                const element = pathSegments[index];
                this.privateParam[element] = pathSegments[index + 1];
            }
        }
        //this.parsedCookies = this.parseCookies();
        //this.body = body;
    }

    private parseCookies(): object {
        if (!this.headers.cookie) {
            return {};
        }
        const chunks = this.headers.cookie.split(";");
        const result = {};
        chunks.map((value) => {
            const pairs = value.split("=");
            if (pairs.length != 2) return;
            result[pairs[0].trim()] = pairs[1];
        });
        this.parsedCookies = result;
    }

    public get queryStrings(): object {
        return this.queryStrings;
    }
    public get params(): any {
        return this.privateParam;
    }
    public get cookies(): object {
        return this.parsedCookies;
    }
    /* public get method(): ActionType {
        return ActionType[this.req.method];
    } */
}
