import { Model, column, primaryKey } from "@lib/Model";
import Cars from "@models/Cars";
export default class Users extends Model {
    @column
    @primaryKey
    public id: number;
    @column
    public name: string;

    protected static tableName = "users";

    constructor(id?: number, name?: string) {
        super();

        this.id = id;
        this.name = name;
    }

    public get cars(): Promise<Array<Cars>> {
        return this.oneToMany<Cars>(Cars, "id", "userId");
    }
}
