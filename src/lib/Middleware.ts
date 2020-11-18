import Request from "@lib/Request";
import Response from "@lib/Response";
import { ExecOptionsWithBufferEncoding } from "child_process";
import Controller from "./Controller";

// Method Decorator
export function addMiddleware(stack: Array<IMiddlewareFunction>) {
    console.log("Middleware running");
    return function (
        target: Controller,
        key: string | symbol,
        descriptor: PropertyDescriptor
    ) {
        const original = descriptor.value;
        descriptor.value = async function (...args: any[]) {
            executeMiddlewareStack(stack, this, 0);
            return original.apply(this, args);
        };
        return descriptor;
    };
}

async function executeMiddlewareStack(
    stack: Array<IMiddlewareFunction>,
    controller: Controller,
    index: number
) {
    if (index < stack.length) await stack[index](controller);
}

export interface IMiddlewareFunction {
    (controller: Controller): Promise<void>;
}
