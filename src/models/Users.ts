import Model from "@lib/Model";
import Cars from "@models/Cars"
export default class Users extends Model {
    public id: number = undefined;
    public name: string = undefined;


    constructor(name: string) {
        super();
        this.name = name;
    }

    public get myCars() {
        return this.hasMany(Cars, "carId", "id");

    }

}