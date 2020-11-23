import { additionalProperties, column, Model, primaryKey } from "@lib/Model";

export default class Video extends Model {
    @primaryKey
    @column
    public id: number;
    @column
    @additionalProperties({ type: "INT(8)", notNull: true })
    public userId: number;
    @column
    @additionalProperties({ type: "VARCHAR(50)", notNull: true })
    public name: string;

    protected static tableName = "videos";

    constructor(userId?) {
        super();
        this.userId = userId;
    }
}
