import "module-alias/register";
require("dotenv").config();
import mariadb from "mariadb";
import fs from "fs";
import { ColumnProperties } from "./src/lib/Model";
import { exit } from "process";
import readline from "readline";

const querys: Array<string> = []; // Store all querys that should be executed at the end

updateDb();

let dbCon: mariadb.PoolConnection;

function startDatabaseConnection() {
    return new Promise(async (resolve) => {
        const dbPool = mariadb.createPool({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASS,
            connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT) || 5,
            database: process.env.DB,
            port: parseInt(process.env.DB_PORT) || 3306,
        });
        dbCon = await dbPool.getConnection();
        resolve();
    });
}

async function getModelTables(): Promise<Array<Table>> {
    const modelFiles = fs.readdirSync("./src/models");
    const tables = await Promise.all(
        modelFiles.map(async (value) => {
            if (value.slice(-3) == ".ts") {
                const filenameNoExt = value.slice(0, -3);
                const module = await import("./src/models/" + filenameNoExt);
                const classDef = module.default;
                const proto = Object.getPrototypeOf(new classDef());

                const columns: Array<Column> = proto.tableColumns.map(
                    (value) => {
                        return new Column(
                            value,
                            proto.primaryKeys.includes(value),
                            proto.additionalProperties
                                ? proto.additionalProperties[value]
                                : undefined
                        );
                    }
                );
                return new Table(classDef.tableName, columns);
            }
        })
    );
    return tables;
}

async function getDBTables() {
    // SHOW tables
    // SHOW COLUMNS FROM tableName;
    await startDatabaseConnection();
    const tableResult = await dbCon.query("SHOW tables");
    const tables: Array<Table> = tableResult.map(async (value) => {
        for (const key in value) {
            const tableName = value[key];
            const columnsData = await dbCon.query(
                "SHOW COLUMNS FROM " + tableName
            );
            const columns: Array<Column> = await Promise.all(
                columnsData.map((value) => {
                    return new Column(
                        value.Field,
                        value.Key == "PRI",
                        undefined
                    );
                })
            );
            return new Table(tableName, columns);
        }
    });
    return await Promise.all(tables);
}

async function updateDb() {
    const modelDef: Array<Table> = await getModelTables();
    const dbDef: Array<Table> = await getDBTables();

    //Filter out db

    const filterDBPromises = dbDef.map(async (tableValue: Table) => {
        const indexOfModelDef = findIndexTable(modelDef, tableValue);
        if (indexOfModelDef !== -1) {
            const promises = tableValue.columns.map(
                async (columnValue: Column) => {
                    const columnInModelTableIndex = findIndexColumn(
                        modelDef[indexOfModelDef].columns,
                        columnValue
                    );
                    if (columnInModelTableIndex !== -1) {
                        if (
                            modelDef[indexOfModelDef].columns[
                                columnInModelTableIndex
                            ].primaryKey !== columnValue.primaryKey
                        ) {
                            // Updating primary key after what model def is saying
                            await setPrimaryKey(
                                tableValue,
                                columnValue,
                                modelDef[indexOfModelDef].columns[
                                    columnInModelTableIndex
                                ].primaryKey
                            );
                        }
                    } else {
                        dropColumn(tableValue, columnValue);
                    }
                }
            );

            await Promise.all(promises);
        } else {
            dropTable(tableValue);
        }
    });
    await Promise.all(filterDBPromises);
    // Add missing tables and columns
    modelDef.map((tableVal: Table) => {
        const dbDefTableIndex = findIndexTable(dbDef, tableVal);

        if (dbDefTableIndex == -1) {
            addTable(tableVal);
        } else {
            tableVal.columns.map((columnValue) => {
                const dbDefColumnIndex = findIndexColumn(
                    dbDef[dbDefTableIndex].columns,
                    columnValue
                );
                if (dbDefColumnIndex == -1) {
                    addColumn(tableVal, columnValue);
                }
            });
        }
    });
    await executeQuerys();
}

async function executeQuerys() {
    if (!querys.length) {
        console.log("Models are already synced with DB");
        exit(0);
    }
    console.log("Querys: ");
    console.log(querys);

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    rl.question(
        "Do you wish to execute these querys? y/n \n",
        async (answer) => {
            if (answer === "y") {
                const promises: Array<Promise<any>> = querys.map((value) =>
                    dbCon.query(value)
                );
                const results = await Promise.all(promises);
                console.log("RESULT", results);
            } else {
                console.log("Ok, not executing anything");
            }
            exit(0);
        }
    );
}

function findIndexTable(array: Array<Table>, table: Table): number {
    return array.findIndex((value) => value.tablename === table.tablename);
}

function findIndexColumn(array: Array<Column>, column: Column): number {
    return array.findIndex((value) => value.name === column.name);
}

async function addTable(table: Table) {
    let query = `CREATE TABLE ${table.tablename}(`;
    query += table.columns
        .map((value: Column) => {
            return getColumnSQLDescription(value);
        })
        .join(",");

    const primaryKeys = table.columns
        .filter((value) => value.primaryKey)
        .map((value) => value.name);

    if (primaryKeys.length) {
        query += `, PRIMARY KEY (${primaryKeys.join(",")})`;
    }

    query += ")";
    querys.push(query);
}
async function addColumn(table: Table, column: Column) {
    const query = `ALTER TABLE ${table.tablename} ADD ${getColumnSQLDescription(
        column
    )}`;
    querys.push(query);
}
async function dropTable(table: Table) {
    querys.push(`DROP TABLE ${table.tablename}`);
}
async function dropColumn(table: Table, column: Column) {
    querys.push(`ALTER TABLE ${table.tablename} DROP COLUMN ${column.name}`);
}
async function setPrimaryKey(table: Table, column: Column, value: boolean) {
    const primaryKeys: Array<string> = await getPrimaryKeys(table);

    if (value) primaryKeys.push(column.name);
    else primaryKeys.splice(primaryKeys.indexOf(column.name));

    querys.push(
        `ALTER TABLE ${
            table.tablename
        } DROP PRIMARY KEY, ADD PRIMARY KEY(${primaryKeys.join(",")})`
    );
}
async function getPrimaryKeys(table: Table): Promise<Array<string>> {
    const query = `SHOW KEYS FROM ${table.tablename} WHERE Key_name = 'PRIMARY'`;
    const result = await dbCon.query(query);
    return result.map((value) => value.Column_name);
}

function getColumnSQLDescription(column: Column): string {
    let query: string = column.name;
    if (column.additionalProperties) {
        query += " " + column.additionalProperties.type;
        if (column.additionalProperties.notNull) query += " NOT NULL";
        if (column.additionalProperties.autoIncrement)
            query += " AUTO_INCREMENT";
    }
    return query;
}
class Table {
    tablename: string;
    columns: Array<Column>;
    constructor(tablename: string, columns: Array<Column>) {
        this.tablename = tablename;
        this.columns = columns;
    }
}
class Column {
    name: string;
    primaryKey: boolean;
    additionalProperties: ColumnProperties;
    constructor(
        name: string,
        primaryKey: boolean,
        additionalProperties: ColumnProperties
    ) {
        this.name = name;
        this.primaryKey = primaryKey;
        this.additionalProperties = additionalProperties;
    }
}
