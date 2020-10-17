import http from "http";

export default class Request {
    private req: http.IncomingMessage;
    constructor(req: http.IncomingMessage) {
        this.req = req;
    }
}
