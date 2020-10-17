import Request from "@lib/Request";
import Response from "@lib/Response";

export default abstract class Initialize {
    req: Request;
    res: Response;

    PreStart(): void {
        return;
    }
    PostStart(port: number): void {
        return;
    }
    /**
     * @description For 404 requests, do not call it instead use res.throw404()
     * 
     */
    abstract NoPageFound();

    /**
     * @description When the user want to reach the path "/"
     * 
     */
    abstract IndexAction();

}