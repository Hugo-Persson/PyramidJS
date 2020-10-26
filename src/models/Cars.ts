import { column, Model } from "@lib/Model";

export default class Cars extends Model {
    @column
    public id: number;
    @column
    public userId: number;

    constructor(userId) {
        super();
        this.userId = userId;
    }
}