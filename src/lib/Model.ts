import { rejects } from "assert";
import { time } from "console";
import mariadb from "mariadb";
export abstract class Model {

    public static dbConnection: mariadb.PoolConnection;
    public static dbPool: mariadb.Pool;

    protected tableName: string;
    private tableColumns: Array<string>;

    protected newlyCreated: boolean = true;


    constructor() {
        this.tableColumns = Object.getPrototypeOf(this).tableColumns

    }
    public static startDatabaseConnection() {
        return new Promise(async (resolve, reject) => {
            this.dbPool = mariadb.createPool({
                host: process.env.DB_HOST,
                user: process.env.DB_USER,
                password: process.env.DB_PASS,
                connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT) || 5,
            });
            this.dbConnection = await this.dbPool.getConnection();
            resolve();
        });

    }

    /**
     * save
     */
    public async save(): Promise<void> {
        if (this.newlyCreated) {
            return this.insertOne();

        }

    }
    private async insertOne(): Promise<void> {
        const columns: Array<string> = this.tableColumns.filter(i => i !== undefined);
        const values = columns.map(i => this[i]);
        const questionMarks = values.map(e => "?").join(",");
        let queryString = `INSERT INTO ${this.tableName} (${columns.join(", ")}) VALUES (${questionMarks})`;
        console.log(queryString);

    }


    /**
     * get
     * @param {object} filter - a object with keys and values after what you want to filet, for example {id:32,name:"hugo"} then server will return all rows that fufill this
     */
    static getRowByFilter(filter: object) {
        // Will find a row dependent on the filter
    }




    /**
     * belongsToMany
     */
    protected belongsToMany() {

    }

    /**
     * belongTo
     */
    protected belongTo() {

    }

    /**
     * hasMany
     * @param {any} relatedModel - An class that inherits from model class. 
     * @param {string} primaryKey - The primary key of this class
     * @param {string} forreignKey - The forreign key of the realted model
     * @returns {Model} - Returns one model that belongs to this class
     */
    protected hasMany(relatedModel: any, primaryKey: string, forreignKey: string): Model {
        console.log(this[primaryKey]);
        return new relatedModel();
    }

    /**
     * hasOne
     * @param {any} relatedModel - An class that inherits from model class. 
     * @param {string} primaryKey - The primary key of this class
     * @param {string} forreignKey - The forreign key of the realted model
     * @returns {Model} - Returns one model that belongs to this class
     */
    protected hasOne(relatedModel: any, primaryKey: string, forreignKey: string): Model {

        return new relatedModel();
    }

    /* I want syntax like 
    
    class Users extends Model{
        
        get messages(){
            this.hasMany(modelclass/"modelname",primaryKey, forreignKey)
        }
        

    }

    */

}


export function column(target: any, propertyKey: string) {
    //target.tableColumns.push(propertyKey);
    if (!target.tableColumns) target.tableColumns = [];
    target.tableColumns.push(propertyKey)
}