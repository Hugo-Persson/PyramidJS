import { Model, column } from "@lib/Model";
import Cars from "@models/Cars";
export default class Users extends Model {
    @column
    public id: number;
    @column
    public name: string;

    tableName = "users";

    constructor(id?: number, name?: string) {
        super();

        this.id = id;
        this.name = name;
    }

    public get myCars() {
        return this.hasMany(Cars, "carId");
    }
}
