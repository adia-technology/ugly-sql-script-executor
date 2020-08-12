# ugly-sql-script-runner
Automated deployment of SQL code

# Build and Run
$env:INPUT_sqlRoot="path to the root of your SQL folders";
$env:INPUT_sqlSchema="folder with your schema changes in your sql root";
$env:INPUT_sqlScripts="comma separated list of folder like functions, triggers, etc ";
$env:INPUT_sqlConnString="connection string in format Server=localhost,port;Database=database;User Id=username;Password=password;Encrypt=true or mssql://username:password@localhost/database?encrypt=true";
npm install;
tsc;
node index.js;



