import { column, Model, primaryKey } from "@lib/Model";

export default class Cars extends Model {
    @primaryKey
    @column
    public id: number;
    @column
    public name: string;

    protected static tableName = "cars";

    constructor() {
        super();
    }
}
