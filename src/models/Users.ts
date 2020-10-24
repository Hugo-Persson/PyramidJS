import Model from "@lib/Model";
import Cars from "@models/Cars"
export default class Users extends Model {


    public get myCars() {
        return this.hasOne(Cars);
    }
    public set myCars(val) {
        return;
    }
}