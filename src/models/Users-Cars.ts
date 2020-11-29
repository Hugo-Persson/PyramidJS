import IJunctionTable from "@lib/IJunctionTable";
import { additionalProperties, column, Model, primaryKey } from "@lib/Model";
import Car from "./Car";
import User from "./User";

export default class UsersCars extends Model implements IJunctionTable {
    @column
    @primaryKey
    @additionalProperties({ type: "INT(8)", notNull: true })
    public userId: number;
    @column
    @primaryKey
    @additionalProperties({ type: "INT(8)", notNull: true })
    public carId: number;

    public firstClassDef = User;
    public secondClassDef = Car;

    protected static tableName = "users_cars";

    public getFirst(): Promise<Model> {
        return this.oneToOne<User>(User, "userId", "id");
    }
    public getSecond(): Promise<Model> {
        return this.oneToOne<Car>(Car, "carId", "id");
    }
}
