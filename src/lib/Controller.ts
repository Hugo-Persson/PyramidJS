import Request from "@lib/Request";
import Response from "@lib/Response";

export class Controller {
    req: Request;
    res: Response;
    constructor(req: Request, res: Response) {
        this.req = req;
        this.res = res;
    }



}