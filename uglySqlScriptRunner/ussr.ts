'use strict';
const path = require('path');
const fs = require('fs');
const sql = require('mssql');

export default async function ussr(sqlRoot: string, sqlSchema: string, sqlScripts: string, connString: string) {
    let conn = await sqlConnect(connString);
    try {
        var sqlSchemaArray = [sqlSchema];
        var sqlScriptsArray = sqlScripts.split(',').map(folder => folder.trim());

        await sqlProvision(conn);
        var lastScript = await sqlGetLastScriptName(conn);

        const schemaFileFilter = (filename: string) => filename.toLowerCase().endsWith('.sql') && filename > lastScript;
        const scriptFileFilter = (filename: string) => filename.toLowerCase().endsWith('.sql');

        await applySqlScripts(sqlRoot, sqlSchemaArray, schemaFileFilter, conn, true);
        await applySqlScripts(sqlRoot, sqlScriptsArray, scriptFileFilter, conn);
    }
    finally {
        conn.close();
    }
}
async function sqlConnect(connString: string) {
    try {
        return await sql.connect(connString);
    } catch (err) {
        throw err;
    }
}
async function sqlGetLastScriptName(conn: any) {
    try {
        let result = await conn.query('SELECT TOP 1 filename FROM USSR_provision ORDER BY filename DESC');
        if (result.recordset.length == 0)
            return '0';
        return result.recordset[0].filename;
    } catch (err) {
        throw err;
    }
}
async function sqlProvision(conn: any) {
    let provision = `
IF NOT EXISTS(select TOP 1 * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_CATALOG = db_name() AND TABLE_NAME = 'USSR_provision')
BEGIN
--
CREATE TABLE USSR_provision(
	id INT IDENTITY PRIMARY KEY,
	filename NVARCHAR(256),
	created DATETIME DEFAULT (getdate())
);
--
END`;

    try {
        await conn.batch(provision);
    } catch (err) {
        throw err;
    }
}
async function applySqlScripts(sqlRoot: string, sqlFolders: Array<string>, filenameFilter: Function, conn: any, isSchema: boolean = false) {
    for (const folder of sqlFolders) {
        var path2scripts = path.join(sqlRoot, folder);
        var items = fs.readdirSync(path2scripts);
        items = items.filter(filenameFilter);
        items.sort();
        for (const item of items) {
            await applySqlScript(path2scripts, item, conn);
            if (isSchema) {
                await registerSchemaChange(item, conn);
            }
        }
    }
}
async function applySqlScript(filepath: string, file: string, conn: any) {
    try {
        let scriptPath = path.join(filepath, file);
        let script = fs.readFileSync(scriptPath, 'utf8');
        await conn.batch(script);
        console.log(scriptPath);
    } catch (err) {
        throw err;
    }
}
async function registerSchemaChange(filename: string, conn: any) {
    let insert = "INSERT INTO USSR_provision(filename) VALUES('" + filename + "');";
    try {
        await conn.batch(insert);
    } catch (err) {
        throw err;
    }
}
