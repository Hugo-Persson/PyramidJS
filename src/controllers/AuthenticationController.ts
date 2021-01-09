import Controller, { POST, TokenAssignmentMethod } from "@lib/Controller";
import User from "@models/User";
import bcrypt from "bcrypt";
import Request from "@lib/Request";
import Response from "@lib/Response";

export default class AuthenticationController extends Controller {
    /**
     * login
     */
    @POST
    public async login() {
        const { username, password } = this.req.body;
        if (!username) {
            this.res.setStatusCode(400); // Bad Request
            this.res.json({ error: true, message: "NoUsername" });

            return;
        }
        if (!password) {
            this.res.setStatusCode(400); // Bad Request
            this.res.json({ error: true, message: "NoPassword" });
        }
        const user = await User.getSingleRowByFilter(
            // Fetch the desired user from the database
            new User(undefined, username)
        );
        console.log(Boolean(user));
        if (!user || user.id === undefined) {
            //this.res.setStatusCode(400); // Bad Request
            this.res.json({
                error: true,
                message: "NoUser",
            });

            return;
        }
        try {
            if (await bcrypt.compare(password, user.password)) {
                this.res.setStatusCode(200);
                await this.generateToken({
                    type: "auth",
                    id: user.id,
                    username: user.username,
                });
                this.res.json({
                    error: false,
                    message: "LoggedIn",
                });
            } else {
                this.res.setStatusCode(403); // Forbidden
                this.res.json({ error: true, message: "WrongPassword" });
            }
        } catch (error) {
            this.res.setStatusCode(500);
            throw error;
        }
    }

    private generateToken(data: object): Promise<void> {
        return this.setTokenData("auth", data, TokenAssignmentMethod.overwrite); // TODO: Expiration day
    }
    /**
     * register
     */
    @POST
    public async register() {
        const { username, password } = this.req.body;
        if (!username) {
            this.res.setStatusCode(400); // Bad Request
            this.res.json({
                error: true,
                message: "User created and you are signed in",
            });

            return;
        }
        if (!password) {
            this.res.setStatusCode(400); // Bad Request
            this.res.json({ error: true, message: "NoPassword" });
            return;
        }
        const userInDb = await User.getSingleRowByFilter(
            // Fetch the desired user from the database
            new User(undefined, username)
        );
        if (userInDb && userInDb.id) {
            //this.res.setStatusCode(400); // Bad Request
            this.res.json({ error: true, message: "UserExists" });

            return;
        }
        try {
            const newUser = new User(
                undefined,
                username,
                await await bcrypt.hash(password, 10)
            );
            await newUser.save();
            await this.generateToken({
                type: "auth",
                id: newUser.id,
                username: newUser.username,
            });
            this.res.setStatusCode(200);

            this.res.json({
                error: false,
                message: "User created and you are signed in",
            });
        } catch (error) {
            console.error(error);
            this.res.json({ error: true, message: "Unknown Error" });
            this.res.setStatusCode(500); // Internal server error
        }
    }
    public static async checkAuthentication(
        controller: Controller
    ): Promise<void> {
        try {
            const data = await controller.getTokenData("auth");
            if (data.type == "auth") {
                controller.authData = data;
            } else {
                controller.authData = undefined;
            }
        } catch (error) {
            controller.authData = undefined;
        }
    }
}
