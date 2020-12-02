import Controller, { GET, POST } from "@lib/Controller";
import IndexView from "@views/IndexView";
import { PassThrough } from "stream";
import { addMiddleware } from "@lib/Middleware";
import AuthenticationController from "@controllers/AuthenticationController";

import Request from "@lib/Request";
import Response from "@lib/Response";
import User from "@models/User";
import Car from "@models/Car";
import UsersCars from "@models/Users-Cars";

export default class Dashboard extends Controller {
    public tryParams() {
        this.res.json(this.req.params);
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
    public tryManyToMany() {
        const user = new User();
        user.cars;
        this.res.send("TEST");
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
        const user = await User.getSingleRowByFilter(
            new User(this.authData.id)
        );
        console.log("CARS", await user.cars);
        this.res.send("DONE");
    }
    @GET
    public async getUsersFromCar() {
        const id = this.req.params.id;
        const car = await Car.getSingleRowByFilter(new Car(id));
        console.log(car);

        this.res.json(await car.users);
    }
}
