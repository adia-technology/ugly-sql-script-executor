'use strict';
import tl = require('azure-pipelines-task-lib/task');
import ussr from './ussr';

async function run() {
    try {
        const sqlRoot: string | undefined = tl.getInput('sqlRoot', true);
        const sqlSchema: string | undefined = tl.getInput('sqlSchema', true);
        const sqlScripts: string | undefined = tl.getInput('sqlScripts', true);
        const sqlConnString: string | undefined = tl.getInput('sqlConnString', true);
        if (sqlRoot == 'bad' || sqlSchema == 'bad' || sqlScripts == 'bad' || sqlConnString == 'bad') {
            tl.setResult(tl.TaskResult.Failed, 'Bad input was given');
            return;
        }
        ussr(sqlRoot!, sqlSchema!, sqlScripts!, sqlConnString!);
    }
    catch (err) {
        tl.setResult(tl.TaskResult.Failed, err.message);
    }
}

run();
