import { Model, column, primaryKey, additionalProperties } from "@lib/Model";
export default class Users extends Model {
    @column
    @primaryKey
    @additionalProperties({ type: "INT(8)", notNull: true })
    public id: number;
    @column
    @additionalProperties({ type: "VARCHAR(40)", notNull: true })
    public username: string;

    @column
    @additionalProperties({ type: "VARCHAR(255)", notNull: true })
    public password: string;

    protected static tableName = "users";

    constructor(id?: number, username?: string, password?: string) {
        super();

        this.id = id;
        this.username = username;
        this.password = password;
    }
}
