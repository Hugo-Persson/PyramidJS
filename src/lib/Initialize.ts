import Request from "@lib/Request";
import Response from "@lib/Response";
import Controller, { ActionType } from "./Controller";
import { executeMiddlewareStack } from "./Middleware";

export default abstract class Initialize extends Controller {
    preStart(): void {
        return;
    }
    postStart(port: number): any {
        return;
    }
    /**
     * @description For 404 requests, do not call it instead use res.throw404()
     *
     */
    abstract noPageFound(): any;

    /**
     * @description When the user want to reach the path "/"
     *
     */
    abstract indexAction(): any;

    public async runMiddleware(): Promise<void> {
        if (this.controllerSpecificMiddleware.length) {
            // Apply controller specific middleware
            await executeMiddlewareStack(
                this.controllerSpecificMiddleware,
                this
            );
        }
        if (Controller.applicationSpecificMiddleware.length) {
            // Apply application specific middleware
            await executeMiddlewareStack(
                Controller.applicationSpecificMiddleware,
                this
            );
        }
    }
}
