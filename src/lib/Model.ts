import { Mode } from "fs";
import mariadb from "mariadb";
export abstract class Model {
    public static dbConnection: mariadb.PoolConnection;
    public static dbPool: mariadb.Pool;

    protected tableName: string;
    private tableColumns: Array<string>;

    protected newlyCreated: boolean = true;

    constructor() {
        this.tableColumns = Object.getPrototypeOf(this).tableColumns;
    }
    public static startDatabaseConnection() {
        return new Promise(async (resolve) => {
            this.dbPool = mariadb.createPool({
                host: process.env.DB_HOST,
                user: process.env.DB_USER,
                password: process.env.DB_PASS,
                connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT) || 5,
                database: process.env.DB,
                port: parseInt(process.env.DB_PORT) || 3306,
            });
            this.dbConnection = await this.dbPool.getConnection();
            console.log("database connection done");
            resolve();
        });
    }

    /**
     * save
     */
    public async save(): Promise<mariadb.UpsertResult> {
        if (this.newlyCreated) {
            return this.insertOne();
        }
        const query = `UPDATE ${this.tableName} `;
    }

    private async insertOne(): Promise<mariadb.UpsertResult> {
        const columns: Array<string> = this.tableColumns.filter(
            (i) => i && this[i]
        );
        const values = columns.map((i) => this[i]);
        const questionMarks = values.map(() => "?").join(",");
        let queryString = `INSERT INTO ${this.tableName} (${columns.join(
            ", "
        )}) VALUES (${questionMarks})`;
        const result: mariadb.UpsertResult = await Model.dbConnection.query(
            queryString,
            values
        );
        return result;
    }

    /**
     * get
     * @param {Model} filter - a object with keys and values after what you want to filet, for example {id:32,name:"hugo"} then server will return all rows that fufill this
     */
    protected static getRowByFilter(filter: Model, ModelChild: any) {
        const whereQueryStringArray: Array<string> = filter.tableColumns.map(
            (e) => {
                if (filter[e]) return `${e}=${filter[e]}`;

            }
        );
        // Will find a row dependent on the filter
        const query = `SELECT * FROM  ${filter.tableName} WHERE ${whereQueryStringArray.join(", ")}`;
        console.log(query);
    }

    /* 
    ----------------------------------------------------------------------------------
                            RELATIONSHIPS
    ----------------------------------------------------------------------------------
    */

    /**
     * belongsToMany
     */
    protected belongsToMany() { }

    /**
     * belongTo
     */
    protected belongTo() { }

    /**
     * hasMany
     * @param {any} relatedModel - An class that inherits from model class.
     * @param {string} primaryKey - The primary key of this class
     * @param {string} forreignKey - The forreign key of the realted model
     * @returns {Model} - Returns one model that belongs to this class
     */
    protected hasMany(relatedModel: any, primaryKey: string): Model {
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
    protected hasOne(relatedModel: any): Model {
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
    target.tableColumns.push(propertyKey);
}
