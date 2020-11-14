import Request from "@lib/Request";
import Response from "@lib/Response";
import jwt from "jsonwebtoken";
import { exit } from "process";

export default class Controller {
    req: Request;
    res: Response;

    public async getTokenData(name: string): Promise<Object> {
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
        value: Object,
        assignmentMethod: TokenAssignmentMethod = TokenAssignmentMethod.renew,
        expiration?: number
    ) {
        if (assignmentMethod == TokenAssignmentMethod.overwrite) {
            this.res.setCookie(name, await this.createToken(value));
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
                        )
                    );
                } catch (err) {
                    this.res.setCookie(
                        name,
                        await this.createToken(value, expiration)
                    );
                }
            } else {
                this.res.setCookie(
                    name,
                    await this.createToken(value, expiration)
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
                        await this.createToken(value, expiration)
                    );
                }
            } else {
                this.res.setCookie(
                    name,
                    await this.createToken(value, expiration)
                );
            }
        }
    }
    private createToken(data: string | object, expiration?: number) {
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
}
enum TokenAssignmentMethod {
    renew = 0,
    append = 1,
    overwrite = 2,
}
