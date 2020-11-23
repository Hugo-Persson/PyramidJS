import "module-alias/register";
require("dotenv").config();
import mariadb from "mariadb";
import fs from "fs";
import { ColumnProperties } from "./src/lib/Model";
import { exit } from "process";

// Logic
/* 
    Get both table def from models and def from DB
    If table is in model def but not DB def then add table and all it columns
    If table in DB def but not in model def then drop table
    If table exist in DB and Model then compare
    First go through all columns in db and findIndex in model def
    if index == -1
        remove drop column
    else 
        check if properties the same otherwise change
    
    store all querys in an array then execute them 
*/

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

    dbDef.map((tableValue: Table) => {
        const indexOfModelDef = findIndexTable(modelDef, tableValue);
        if (indexOfModelDef !== -1) {
            tableValue.columns.map((columnValue: Column) => {
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
                        setPrimaryKey(
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
            });
        } else {
            dropTable(tableValue);
        }
    });

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
    exit(0);
}

async function executeQuerys() {
    console.log(querys);
}

function syncTables(master: Table, slave: Table) {}

function findIndexTable(array: Array<Table>, table: Table): number {
    return array.findIndex((value) => value.tablename === table.tablename);
}

function findIndexColumn(array: Array<Column>, column: Column): number {
    return array.findIndex((value) => value.name === column.name);
}

// DONE
async function addTable(table: Table) {
    let query = `CREATE TABLE ${table.tablename}(`;
    query += table.columns
        .map((value: Column) => {
            let query = value.name;
            if (value.additionalProperties) {
                query += " " + value.additionalProperties.type;
                if (value.additionalProperties.notNull) query += " NOT NULL";
                if (value.additionalProperties.autoIncrement)
                    query += " AUTO_INCREMENT";
            }
            return query;
        })
        .join(",");
    query += ")";
    querys.push(query);
}
async function addColumn(table: Table, column: Column) {
    let query = `ALTER TABLE ${table.tablename} ADD ${column.name}`;
}
async function dropTable(table: Table) {}
async function dropColumn(table: Table, column: Column) {}
async function setPrimaryKey(table: Table, column: Column, value: boolean) {}

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
