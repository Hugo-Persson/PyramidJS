import Controller, { GET, POST } from "@lib/Controller";
import IndexView from "@views/IndexView";
import { addMiddleware } from "@lib/Middleware";
import AuthenticationController from "@controllers/AuthenticationController";

import User from "@models/User";
import Car from "@models/Car";
import UsersCars from "@models/Users-Cars";
import { formidableWrapper } from "@lib/FormidableWrapper";

export default class ExampleController extends Controller {
    //controllerSpecificMiddleware = [testMiddleware];

    @GET
    public async tryJson() {
        this.res.jsonAddData.data = { data: "HAHA" };
        this.res.json({ DATA: "DATA" });
    }
    @GET
    @addMiddleware([AuthenticationController.checkAuthentication])
    public async tryViews() {
        this.res.render(new IndexView("Jesus"));
    }
    @GET
    @addMiddleware([AuthenticationController.checkAuthentication])
    public amILoggedIn() {
        this.res.send(this.authData ? "Yes" : "No");
    }

    @GET
    public async tryCookies() {
        await this.tryViews();
        this.tryViews();
    }
    @GET
    public trySetCookie() {
        this.res.setCookie("aCookiee", "aValue");
    }
    @GET
    public async tryTokens() {
        await this.setTokenData("test", { name: "Hugo Persson" });
        this.res.send("Token set");
    }
    @GET
    public async testGettingTokenData() {
        this.res.json(await this.getTokenData("auth"));
    }
    @POST
    public tryPostBody() {
        this.res.json(this.req.body);
    }
    @GET
    public async createCar() {
        const car = new Car(undefined, "Tesla", 2015);
        const result = await car.save();
        this.res.json(result);
    }
    @GET
    public async createConnection() {
        const connection = new UsersCars();
        connection.carId = 3;
        connection.userId = 1;
        const result = await connection.save();
        this.res.json(result);
    }
    @GET
    @addMiddleware([AuthenticationController.checkAuthentication])
    public async getCars() {
        console.log(this.authData);
        if (!this.authData) {
            this.res.send("No auth");
            return;
        }
        const user = await User.getSingleRowByFilter(
            new User(this.authData.id)
        );
        this.res.json(user.cars);
    }
    @GET
    public async getUsersFromCar() {
        const id = this.req.params.id;
        const car = await Car.getSingleRowByFilter(new Car(id));
        this.res.json(await car.users);
    }
    @GET
    public async tryFetching() {
        this.res.json(await Car.getManyRowsByFilter(new Car(1)));
    }
    @GET
    @addMiddleware([now])
    public async testFunction() {
        this.res.send("TEST");
    }

    @GET
    public async tryHeaders() {
        this.res.send("TEST");
    }

    @POST
    @addMiddleware([formidableWrapper])
    public async tryFormData() {
        console.log("Here", this.req.files);
        this.res.json(this.req.files);
    }
}
async function testMiddleware(controller: Controller) {
    console.log("a middleware");
}
async function now(controller: Controller) {
    console.log("now");
}
