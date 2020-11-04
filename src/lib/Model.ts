import { rejects } from "assert";
import { Mode } from "fs";
import mariadb from "mariadb";
export abstract class Model {
    public static dbConnection: mariadb.PoolConnection;
    public static dbPool: mariadb.Pool;

    protected tableName: string;
    private tableColumns: Array<string>;
    private primaryKeys: Array<string>;

    protected newlyCreated: boolean = true;

    private originalData: object = {};
    constructor() {
        this.tableColumns = Object.getPrototypeOf(this).tableColumns;
        this.primaryKeys = Object.getPrototypeOf(this).primaryKeys;
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
    //#region Saving/Inserting
    /**
     * @description - will save current object, if the model is newly created the a new row will be inserted and if row exist in table it will be updated, NOTE:
     * - NOTE: If you wish to save multiple models use saveMany function
     */
    public async save(): Promise<mariadb.UpsertResult> {
        return new Promise<mariadb.UpsertResult>(async (resolve, reject) => {
            if (this.newlyCreated) {
                return this.insertOne();
            }
            if (!this.primaryKeys) {
                reject();
            }
            const changedColumns = [];
            const changedValues = [];

            const whereValues = [];

            const whereStatement = this.primaryKeys.map((i) => {
                whereValues.push(this[i]);
                return `${i}=?`;
            });

            for (let key in this.originalData) {
                if (this[key] !== this.originalData[key]) {
                    changedColumns.push(key + "=?");
                    changedValues.push(this[key]);
                }
            }
            const query = `UPDATE ${this.tableName} SET ${changedColumns.join(
                ", "
            )} WHERE ${whereStatement.join(" AND ")}`;
            const result: mariadb.UpsertResult = await Model.dbConnection.query(
                query,
                [changedValues, whereValues]
            );
            resolve(result);
        });
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
    //#endregion
    //#region "Fetching rows";
    /* 
    ----------------------------------------------------------------------------------
                            Fetching rows
    ----------------------------------------------------------------------------------
    */

    /**
     * get
     * @param {Model} filter - An object of the model you want to return with the properties you want to filter after, for example if you want a user with the id=1 and name="hugo" then pass a User object with these properties set pass - new User(1,"hugo")
     * @returns {Array<T>} - Returns an array of objects that is filles with values from sql query,
     * @description NOTE: if you only expect one result use getSingleRowByFilter because it will be faster
     */
    public static getManyRowsByFilter<T extends Model>(
        filter: T
    ): Promise<Array<T>> {
        return new Promise<Array<T>>(async (resolve, reject) => {
            const whereValues = [];
            const filterColumns = [];
            filter.tableColumns.map((e) => {
                if (filter[e]) {
                    whereValues.push(filter[e]);
                    filterColumns.push(`${e}=?`);
                }
            });

            const query = `SELECT * FROM  ${
                filter.tableName
            } WHERE ${filterColumns.join(",")}`;

            const queryResult = await Model.dbConnection.query(
                query,
                whereValues
            );
            const filterClass = Object.getPrototypeOf(filter).constructor;
            const returnArray: Array<T> = [];
            queryResult.map((value) => {
                const tempModel: T = new filterClass();
                for (let key in value) {
                    tempModel[key] = value[key];
                }
                tempModel.newlyCreated = false;
                tempModel.originalData = value;
                returnArray.push(tempModel);
            });
            //console.log(returnArray);
            resolve(returnArray);
        });
    }
    /**
     * @param {Model} filter - An object of the model you want to return with the properties you want to filter after, for example if you want a user with the id=1 and name="hugo" then pass a User object with these properties set pass - new User(1,"hugo")
     * @returns {Array<T>} - Returns a signle object of type T
     */
    public static getSingleRowByFilter<T extends Model>(filter: T): Promise<T> {
        return new Promise<T>(async (resolve, reject) => {
            const whereValues = [];
            const filterColumns = [];
            filter.tableColumns.map((e) => {
                if (filter[e]) {
                    whereValues.push(filter[e]);
                    filterColumns.push(`${e}=?`);
                }
            });

            const query = `SELECT * FROM  ${
                filter.tableName
            } WHERE ${filterColumns.join(",")} LIMIT 1`;

            const queryResult = await Model.dbConnection.query(
                query,
                whereValues
            );

            const filterClass = Object.getPrototypeOf(filter).constructor;
            if (!queryResult.length) {
                return new filterClass();
            }

            const tempModel: T = new filterClass();
            for (let key in queryResult[0]) {
                tempModel[key] = queryResult[0][key];
            }
            tempModel.newlyCreated = false;
            tempModel.originalData = queryResult[0];

            //console.log(returnArray);
            resolve(tempModel);
        });
    }
    //#endregion "fetching rows"

    //#region Deletion
    public delete() {
        return new Promise(async (resolve, reject) => {
            const whereValues = [];
            const whereStatement = this.primaryKeys.map((key) => {
                whereValues.push(this[key]);
                return `${key}=?`;
            });

            const query = `DELETE FROM ${
                this.tableName
            } WHERE ${whereStatement.join(" AND ")}`;
            const result = await Model.dbConnection.query(query, whereValues);
            console.log(result);
            resolve(result.affectedRows);
        });
    }

    //#endregion

    /* 
    ----------------------------------------------------------------------------------
                            RELATIONSHIPS
    ----------------------------------------------------------------------------------
    */

    /**
     * @param {T} relatedModel - An class that inherits from model class.
     * @param {string} primaryKey - The primary key of this class
     * @param {string} foreignKey - The forreign key of the realted model
     * @returns {Array<T>} - Returns an array of related model that has the foreign key that matches this primary key
     *
     */
    protected oneToMany<T extends Model>(
        relatedModel: T,
        primaryKey: string,
        foreignKey: string
    ): Array<T> {
        console.log(this[primaryKey]);
        const objectConstructor = Object.getPrototypeOf(relatedModel)
            .constructor;

        return new objectConstructor();
        // For example a user has many cars where a user has no reference to car but car has user_id
    }

    /**
     * hasOne
     * @param {any} relatedModel - An class that inherits from model class.
     * @param {string} primaryKey - The primary key of this class
     * @param {string} foreignKey - The forreign key of the realted model
     * @returns {Model} - Returns one model that belongs to this class
     */
    protected oneToOne<T extends Model>(
        relatedModel: T,
        primaryKey: string,
        foreignKey: string
    ): T {
        const objectConstructor = Object.getPrototypeOf(relatedModel)
            .constructor;

        return new objectConstructor();
    }

    /**
     * @param {any} relatedModel - An class that inherits from model class.
     * @param {string} primaryKey - The primary key of this class
     * @param {string} foreignKey - The forreign key of the realted model
     * @returns {Model} - Returns one model that belongs to this class
     */
    protected manyToOne(
        relatedModel: any,
        primaryKey: string,
        foreignKey: string
    ): Model {
        return new relatedModel();
    }

    /**
     * ---- FAR FROM DONE ------------
     * @param {any} relatedModel - An class that inherits from model class.
     * @param {string} primaryKey - The primary key of this class
     * @param {string} forreignKey - The forreign key of the realted model
     * @returns {Model} - Returns one model that belongs to this class
     */
    protected manyToMany(relatedModel: any): Model {
        return new relatedModel();
    }
}

export function column(target: any, propertyKey: string) {
    if (!target.tableColumns) target.tableColumns = [];
    target.tableColumns.push(propertyKey);
}

export function primaryKey(target: any, propertyKey: string) {
    if (!target.primaryKeys) target.primaryKeys = [];
    target.primaryKeys.push(propertyKey);
}
