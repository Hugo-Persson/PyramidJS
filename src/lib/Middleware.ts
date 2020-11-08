import Request from "@lib/Request";
import Response from "@lib/Response";
import Controller from "./Controller";

// Method Decorator
export function addMiddleware(stack: Array<IMiddlewareFunction>) {
    return function (
        target: Controller,
        key: string | symbol,
        descriptor: PropertyDescriptor
    ) {
        const original = descriptor.value;
        descriptor.value = function (...args: any[]) {
            executeMiddlewareStack(stack, target.res, target.req, 0);
            return original.apply(this, args);
        };
        return descriptor;
    };
}

function executeMiddlewareStack(
    stack: Array<IMiddlewareFunction>,
    res: Response,
    req: Request,
    index: number
) {
    if (index < stack.length)
        stack[index](req, res, () =>
            executeMiddlewareStack(stack, res, req, index + 1)
        );
}

export interface IMiddlewareFunction {
    (req: Request, res: Response, next: Function): void;
}
