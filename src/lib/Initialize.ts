import Request from "@lib/Request";
import Response from "@lib/Response";
import Controller from "./Controller";

export default abstract class Initialize extends Controller {
    preStart(): void {
        return;
    }
    postStart(port: number): void {
        return;
    }
    /**
     * @description For 404 requests, do not call it instead use res.throw404()
     *
     */
    abstract async noPageFound(): Promise<void>;

    /**
     * @description When the user want to reach the path "/"
     *
     */
    abstract indexAction(): void;
}
