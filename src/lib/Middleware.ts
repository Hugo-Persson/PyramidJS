import Request from "@lib/Request";
import Response from "@lib/Response";
import Controller from "./Controller";

// Method Decorator
export function addMiddleware(stack: Array<Function>) {
    return function (
        target: Controller,
        key: string | symbol,
        descriptor: PropertyDescriptor
    ) {
        const original = descriptor.value;
        descriptor.value = async function (...args: any[]) {
            await executeMiddlewareStack(stack, this);
            return await original.apply(this, args);
        };
        return descriptor;
    };
}

export async function executeMiddlewareStack(
    stack: Array<Function>,
    controller: Controller
): Promise<void> {
    for (let index = 0; index < stack.length; index++) {
        await stack[index](controller);
    }
}
