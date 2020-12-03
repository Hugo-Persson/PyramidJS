import { additionalProperties, column, Model, primaryKey } from "@lib/Model";
import User from "./User";
import UsersCars from "./Users-Cars";

export default class Car extends Model {
    @column
    @primaryKey
    @additionalProperties({
        type: "INT(8)",
        notNull: true,
        autoIncrement: true,
    })
    public id: number;
    @column
    @additionalProperties({ type: "VARCHAR(40)", notNull: true })
    public name: string;

    @column
    @additionalProperties({ type: "INT(4)", notNull: true })
    public year: number;

    protected static tableName = "cars";

    constructor(id?: number, name?: string, year?: number) {
        super();

        this.id = id;
        this.name = name;
        this.year = year;
    }
    public get users() {
        return this.manyToMany<User>(User, UsersCars, "id", "carId");
    }
}
