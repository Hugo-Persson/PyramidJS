import { column, Model, primaryKey } from "@lib/Model";

export default class Video extends Model {
    @primaryKey
    @column
    public id: number;
    @column
    public userId: number;
    @column
    public name: string;

    protected static tableName = "videos";

    constructor(userId?) {
        super();
        this.userId = userId;
    }
}
