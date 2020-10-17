import http from "http";

export default class Response {
    private res: http.OutgoingMessage;
    constructor(res: http.OutgoingMessage) {
        this.res = res;
    }

    Send(message: any): void {
        this.res.write(message)
        this.res.end();
    }
}