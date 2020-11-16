import Controller, { POST, TokenAssignmentMethod } from "@lib/Controller";
import Users from "@models/Users";
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
            this.res.send("NoUsername");

            return;
        }
        if (!password) {
            this.res.setStatusCode(400); // Bad Request
            this.res.send("NoPassword");
        }
        const user = await Users.getSingleRowByFilter(
            // Fetch the desired user from the database
            new Users(undefined, username)
        );
        if (!user.id) {
            this.res.setStatusCode(400); // Bad Request
            this.res.send(
                "ERROR, no user exists with that username, please register a new account"
            );

            return;
        }
        try {
            if (await bcrypt.compare(password, user.password)) {
                this.res.setStatusCode(200);
                await this.generateToken({
                    id: user.id,
                    username: user.username,
                });
                this.res.send("SUCCESS, you are logged in");
            } else {
                this.res.setStatusCode(403); // Forbidden
                this.res.send("WrongPassword");
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
            this.res.send("NoUsername");

            return;
        }
        if (!password) {
            this.res.setStatusCode(400); // Bad Request
            this.res.send("NoPassword");
            return;
        }
        const userInDb = await Users.getSingleRowByFilter(
            // Fetch the desired user from the database
            new Users(undefined, username)
        );
        if (userInDb.id) {
            this.res.setStatusCode(400); // Bad Request
            this.res.send("UserExists");

            return;
        }
        try {
            const newUser = new Users(
                undefined,
                username,
                await await bcrypt.hash(password, 10)
            );
            await newUser.save();
            await this.generateToken({
                id: newUser.id,
                username: newUser.username,
            });
            this.res.setStatusCode(200);

            this.res.send("User created and you are signed in");
        } catch (error) {
            console.error(error);
            this.res.send("Unknown Error");
            this.res.setStatusCode(500); // Internal server error
        }
    }

    public static checkAuthentication(req: Request,res: Response,next:Function):void{
        console.log("WHOAH I AM A MIDDLEWARE");
        next();
    }
    

}
