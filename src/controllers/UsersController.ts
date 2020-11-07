import Controller from "@lib/Controller";
import Cars from "@models/Cars";

export default class Users extends Controller {
    public index() {
        this.res.send("Hey");
    }
    public async createCar() {
        console.log("Started creating");
        const car = new Cars(2);
        car.name = "Tesla Model 3";
        await car.save();
        this.res.send("Success");
    }
}
