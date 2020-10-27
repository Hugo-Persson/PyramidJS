import { Model, column } from "@lib/Model";
import Cars from "@models/Cars";
export default class Users extends Model {
    @column
    public id: number;
    @column
    public name: string;

    tableName = "users";

    constructor(name: string) {
        super();

        this.name = name;
    }

    public get myCars() {
        return this.hasMany(Cars, "carId");
    }
}
