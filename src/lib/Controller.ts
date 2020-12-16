import Request from "@lib/Request";
import Response from "@lib/Response";
import jwt from "jsonwebtoken";
import { exit } from "process";
import { executeMiddlewareStack, IMiddlewareFunction } from "@lib/Middleware";

export default class Controller {
    req: Request;
    res: Response;
    public authData = undefined;

    protected controllerSpecificMiddleware: Array<IMiddlewareFunction> = [];

    static applicationSpecificMiddleware: Array<IMiddlewareFunction> = [];
    /**
     * Will try to get the data for a token, will be rejected if the data can not be verified
     * @param name The name of the token, the name of the cookie that is stored
     */
    public async getTokenData(name: string): Promise<any> {
        if (this.req.cookies[name]) {
            return this.verifyPromiseWrapper(this.req.cookies[name]);
        } else {
            return {};
        }
    }
    private async verifyPromiseWrapper(token: string): Promise<Object> {
        return new Promise<Object>((resolve, reject) => {
            const secret = this.getSecret();

            jwt.verify(token, secret, (err, data) => {
                if (err) reject(err);
                else resolve(data);
            });
        });
    }

    /**
     * @param {string} name - The name of the token, every token is a object
     * @param {Object} key - The values or value for the key you want to set, so if you want to set age and id pass {id: 420, age:69}
     * @param {TokenAssignmentMethod=} assignmentMethod  - How the data should be processed if a token already exists
     * @param {number=} expiration - When the token will expire, this setting will be affected by assignmentMethod setting
     */
    public async setTokenData(
        name: string,
        value: object,
        assignmentMethod: TokenAssignmentMethod = TokenAssignmentMethod.renew,
        expiration?: number
    ) {
        if (assignmentMethod == TokenAssignmentMethod.overwrite) {
            this.res.setCookie(name, await this.createToken(value), {
                path: "/",
                maxAge: expiration,
            });
        } else if (assignmentMethod == TokenAssignmentMethod.append) {
            const cookie = this.req.cookies[name];
            if (cookie) {
                try {
                    const data = await this.getTokenData(cookie);

                    this.res.setCookie(
                        name,
                        await this.createToken(
                            Object.assign(data, value),
                            data["exp"]
                        ),
                        {
                            path: "/",
                            maxAge: expiration,
                        }
                    );
                } catch (err) {
                    this.res.setCookie(
                        name,
                        await this.createToken(value, expiration),
                        {
                            path: "/",
                            maxAge: expiration,
                        }
                    );
                }
            } else {
                this.res.setCookie(
                    name,
                    await this.createToken(value, expiration),
                    {
                        path: "/",
                        maxAge: expiration,
                    }
                );
            }
        } else {
            const cookie = this.req.cookies[name];
            if (cookie) {
                try {
                    const data = await this.getTokenData(cookie);

                    this.res.setCookie(
                        name,
                        await this.createToken(
                            Object.assign(data, value),
                            expiration
                        )
                    );
                } catch (err) {
                    this.res.setCookie(
                        name,
                        await this.createToken(value, expiration),
                        {
                            path: "/",
                            maxAge: expiration,
                        }
                    );
                }
            } else {
                this.res.setCookie(
                    name,
                    await this.createToken(value, expiration),
                    {
                        path: "/",
                        maxAge: expiration,
                    }
                );
            }
        }
    }
    private createToken(
        data: string | object,
        expiration?: number
    ): Promise<string> {
        return new Promise((resolve, reject) => {
            if (expiration) data["exp"] = expiration;
            jwt.sign(data, this.getSecret(), (err, token) => {
                if (err) reject(err);
                else resolve(token);
            });
        });
    }
    private getSecret(): string {
        const secret = process.env.SECRET;
        if (!secret) {
            console.log("No Secret found");
            exit(1);
        } else {
            return secret;
        }
    }

    private getAction(arrayName: string, actionName: string): string {
        if (Object.getPrototypeOf(this)[arrayName]) {
            return Object.getPrototypeOf(this)[arrayName].includes(actionName)
                ? actionName
                : undefined;
        } else {
            return undefined;
        }
    }
    /**
     * Is used to run an action in a controller, this should only be called by the core
     * @param name The name of the action you want to run
     * @param method What type of http request is sent
     */
    public async runAction(name: string, method: ActionType): Promise<boolean> {
        let action: string;
        if (method == ActionType.POST) {
            action = this.getAction("postActions", name);
        } else if (method == ActionType.GET) {
            action = this.getAction("getActions", name);
        } else if (method == ActionType.DELETE) {
            action = this.getAction("deleteActions", name);
        } else if (method == ActionType.PUT) {
            action = this.getAction("putActions", name);
        } else if (method == ActionType.OPTIONS) {
            action = this.getAction("optionsActions", name);
        } else {
            console.log("No method provided");
            return true;
        }

        if (action) {
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
            await this[action].bind(this)(); // I use bind because I want this to be tied to this object not this function, it gets a bit buggy when I run the code like this
            return true;
        } else {
            return false;
        }
    }
}

export enum TokenAssignmentMethod {
    renew = 0,
    append = 1,
    overwrite = 2,
}
export enum ActionType {
    GET,
    POST,
    PUT,
    DELETE,
    OPTIONS,
}

export function GET(
    target: any,
    propertyKey: string,
    description: PropertyDescriptor
) {
    if (!target.getActions) target.getActions = [];
    target.getActions.push(propertyKey);
}
export function POST(
    target: any,
    propertyKey: string,
    description: PropertyDescriptor
) {
    if (!target.postActions) target.postActions = [];
    target.postActions.push(propertyKey);
}
export function DELETE(
    target: any,
    propertyKey: string,
    description: PropertyDescriptor
) {
    if (!target.deleteActions) target.deleteActions = [];
    target.deleteActions.push(propertyKey);
}
export function PUT(
    target: any,
    propertyKey: string,
    description: PropertyDescriptor
) {
    if (!target.putActions) target.putActions = [];
    target.putActions.push(propertyKey);
}
