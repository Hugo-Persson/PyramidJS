import { rejects } from "assert";
import { Mode } from "fs";
import mariadb from "mariadb";
import { monitorEventLoopDelay } from "perf_hooks";
import IJunctionTable from "./IJunctionTable";
export abstract class Model {
    private static dbConnection: mariadb.PoolConnection;
    private static dbPool: mariadb.Pool;

    protected static tableName: string;
    private tableColumns: Array<string>;
    private primaryKeys: Array<string>;

    protected newlyCreated: boolean = true;

    private originalData: object = {};
    constructor() {
        this.tableColumns = Object.getPrototypeOf(this).tableColumns;
        this.primaryKeys = Object.getPrototypeOf(this).primaryKeys;
    }
    public static startDatabaseConnection(): Promise<void> {
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
            resolve();
        });
    }

    private get getTableName(): string {
        return Object.getPrototypeOf(this).constructor.tableName;
    }

    //#region Saving/Inserting
    /**
     * @description - will save current object, if the model is newly created the a new row will be inserted and if row exist in table it will be updated, NOTE:
     * - NOTE: If you wish to save multiple models use saveMany function
     */
    public async save(): Promise<mariadb.UpsertResult> {
        if (this.newlyCreated) {
            return this.insertOne();
        }
        if (!this.primaryKeys) {
            throw "ERROR: no primary key";
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

        const query = `UPDATE ${this.getTableName} SET ${changedColumns.join(
            ", "
        )} WHERE ${whereStatement.join(" AND ")}`;

        const result: mariadb.UpsertResult = await Model.dbConnection.query(
            query,
            [changedValues, whereValues]
        );
        return result;
    }

    private async insertOne(): Promise<mariadb.UpsertResult> {
        const columns: Array<string> = this.tableColumns.filter(
            (i) => i && this[i]
        );
        const values = columns.map((i) => this[i]);
        const questionMarks = values.map(() => "?").join(",");
        let queryString = `INSERT INTO ${this.getTableName} (${columns.join(
            ", "
        )}) VALUES (${questionMarks})`;

        const result = await Model.dbConnection.query(queryString, values);
        if (result.insertId && this.tableColumns.includes("id"))
            this["id"] = result.insertId;

        console.log("QUE", result);
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
    public static async getManyRowsByFilter<T extends Model>(
        filter: T
    ): Promise<Array<T>> {
        return this.fetchRows(filter);
    }
    /**
     * @param {Model} filter - An object of the model you want to return with the properties you want to filter after, for example if you want a user with the id=1 and name="hugo" then pass a User object with these properties set pass - new User(1,"hugo")
     * @returns {Array<T>} - Returns a signle object of type T
     */
    public static async getSingleRowByFilter<T extends Model>(
        filter: T
    ): Promise<T> {
        const rows = await this.fetchRows(filter, true);
        if (rows.length) {
            return rows[0];
        } else {
            return undefined;
        }
    }

    private static async fetchRows<T extends Model>(
        filter: T,
        limit: boolean = false
    ): Promise<Array<T>> {
        const whereValues = [];
        const filterColumns = [];
        if (!filter) {
            throw "No filter provided for getManyRowsByFilter function";
            return;
        }
        filter.tableColumns.map((e) => {
            if (filter[e]) {
                whereValues.push(filter[e]);
                filterColumns.push(`${e}=?`);
            }
        });
        const query = `SELECT * FROM  ${filter.getTableName} ${
            filterColumns.length ? "WHERE" : ""
        } ${filterColumns.join(",")} ${limit ? `LIMIT 1 ` : ""} `;

        const queryResult = await Model.dbConnection.query(query, whereValues);
        const returnArray: Array<T> = [];
        const filterClass = Object.getPrototypeOf(filter).constructor;
        queryResult.map((value) => {
            const tempModel: T = new filterClass();
            for (let key in value) {
                tempModel[key] = value[key];
            }
            tempModel.newlyCreated = false;
            tempModel.originalData = value;
            returnArray.push(tempModel);
        });
        return returnArray;
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
                this.getTableName
            } WHERE ${whereStatement.join(" AND ")}`;
            const result = await Model.dbConnection.query(query, whereValues);
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
     * @param {string} foreignKey - The foreign key of the related model
     * @returns {Array<T>} - Returns an array of related model that has the foreign key that matches this primary key
     *
     */
    protected async oneToMany<T extends Model>(
        relatedModel: new () => T,
        primaryKey: string,
        foreignKey: string
    ): Promise<Array<T>> {
        const queryString: string = `SELECT * FROM ${relatedModel["tableName"]} WHERE ${foreignKey}=?`;

        const queryResult: Array<Object> = await Model.dbConnection.query(
            queryString,
            String(this[primaryKey]) // I need to convert to string because if id = 0 it is ignored
        );
        console.log("QUERY", queryString, String(this[primaryKey]));
        return queryResult.map((value) => {
            const obj: T = new relatedModel();
            for (const key in value) {
                obj[key] = value[key];
            }
            return obj;
        });

        // For example a user has many cars where a user has no reference to car but car has user_id
    }

    /**
     * hasOne
     * @param {any} relatedModel - An class that inherits from model class.
     * @param {string} primaryKey - The primary key of this class
     * @param {string} foreignKey - The forreign key of the realted model
     * @returns {Model} - Returns one model that belongs to this class
     */
    protected async oneToOne<T extends Model>(
        relatedModel: new () => T,
        primaryKey: string,
        foreignKey: string
    ): Promise<T> {
        const query = `SELECT * FROM ${relatedModel["tableName"]} WHERE ${foreignKey} = ? LIMIT 1`;
        const result: Array<object> = await Model.dbConnection.query(
            query,
            String(this[primaryKey])
        );
        if (!result.length) {
            return undefined;
        } else {
            const returnObject = new relatedModel();
            for (const key in result[0]) {
                returnObject[key] = result[0][key];
            }
            return returnObject;
        }
    }

    /**
     * ---- FAR FROM DONE ------------
     * @param {any} relatedModel - An class that inherits from model class.
     * @param {string} primaryKey - The primary key of this class
     * @param {string} forreignKey - The forreign key of the realted model
     * @returns {Model} - Returns one model that belongs to this class
     */
    protected async manyToMany<T extends Model>(
        relatedModel: new () => T,
        junctionModel: new () => IJunctionTable,
        primaryKey: string,
        foreignKey: string
    ): Promise<Array<T>> {
        const junctionResults: Array<IJunctionTable> = await this.oneToMany(
            junctionModel,
            primaryKey,
            foreignKey
        );
        const relatedModelPromises: Array<Promise<
            T
        >> = junctionResults.map(async (value) =>
            value.firstClassDef === relatedModel
                ? ((await value.getFirst()) as T)
                : ((await value.getSecond()) as T)
        );

        return Promise.all(relatedModelPromises);
    }

    /* 
    ----------------------
    EXTRA
    ----------------
    */
    public toJSON() {
        const object = { ...this };
        object.primaryKeys = undefined;
        object.tableColumns = undefined;
        object.newlyCreated = undefined;
        object.originalData = undefined;
        return object;
    }
}
/* 
------------------------
    DECORATORS
------------------------

*/

export function column(target: any, propertyKey: string) {
    if (!target.tableColumns) target.tableColumns = [];
    target.tableColumns.push(propertyKey);
}

export function primaryKey(target: any, propertyKey: string) {
    if (!target.primaryKeys) target.primaryKeys = [];
    target.primaryKeys.push(propertyKey);
}
export function additionalProperties(properties: ColumnProperties) {
    return function (target: any, propertyKey: string) {
        if (!target.additionalProperties) target.additionalProperties = {};
        target.additionalProperties[propertyKey] = properties;
    };
}

export interface ColumnProperties {
    type: string;
    notNull?: boolean;
    autoIncrement?: boolean;
}
