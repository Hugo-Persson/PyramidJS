import { Model, column, primaryKey } from "@lib/Model";
import Cars from "@models/Cars";
export default class Users extends Model {
    @column
    @primaryKey
    public id: number;
    @column
    public username: string;

    @column
    public password: string;

    protected static tableName = "users";

    constructor(id?: number, username?: string, password?: string) {
        super();

        this.id = id;
        this.username = username;
        this.password = password;
    }

    public get cars(): Promise<Array<Cars>> {
        return this.oneToMany<Cars>(Cars, "id", "userId");
    }
}
