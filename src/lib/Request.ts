import http from "http";
import querystring from "querystring";

export default class Request {
    private req: http.IncomingMessage;
    private queryStringsSave: object;
    private privateParam: object = {};
    constructor(req: http.IncomingMessage) {
        this.req = req;
        this.queryStringsSave = querystring.parse(req.url);

        const pathSegments = req.url.split("/");
        if (pathSegments.length > 3) {
            for (let index = 3; index + 1 < pathSegments.length; index += 2) {
                const element = pathSegments[index];
                this.privateParam[element] = pathSegments[index + 1];
            }
        }
    }

    public get queryStrings(): object {
        return this.queryStrings;
    }
    public get params(): object {
        return this.privateParam;
    }
}
