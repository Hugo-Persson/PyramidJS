import Request from "@lib/Request";
import Response from "@lib/Response";
import Controller from "./Controller";

// Method Decorator
export function addMiddleware(stack: Array<IMiddlewareFunction>) {
    console.log("Adding middleware");
    return function (
        target: Controller,
        key: string | symbol,
        descriptor: PropertyDescriptor
    ) {
        const original = descriptor.value;
        descriptor.value = async function (...args: any[]) {
            executeMiddlewareStack(stack, this);
            return original.apply(this, args);
        };
        return descriptor;
    };
}

async function executeMiddlewareStack(
    stack: Array<IMiddlewareFunction>,
    controller: Controller,
) {
    for (let index = 0; index < stack.length; index++) {
        await stack[index](controller);
    }
}

export interface IMiddlewareFunction {
    (controller: Controller): Promise<void>;
}
