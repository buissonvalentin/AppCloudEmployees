const MongoClient = require("mongodb").MongoClient;
const fs = require("fs");

// send employees file : scp employees.json administrateur@devincimdb1013.westeurope.cloudapp.azure.com:/home/administrateur/departement_json/

let connection;

let departmentCollectionLocal, employeeCollectionLocal;

const CONNECTION_URL_LOCAL = "mongodb://localhost:27017/AppCloud";
const DATABASE_NAME = "Employees";

const setUpMongoAsync = () => {
  return new Promise((res, rej) => {
    MongoClient.connect(
      CONNECTION_URL_LOCAL,
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      },
      (error, client) => {
        if (error) {
          console.log(error);
          rej(error);
        }
        database = client.db(DATABASE_NAME);
        departmentCollectionLocal = database.collection("department");
        employeeCollectionLocal = database.collection("employee");

        res();
        console.log("Mongo Connected");
      }
    );
  });
};

const findAsync = async collection => {
  return new Promise((res, rej) => {
    collection.find({}).toArray(function(error, result) {
      if (error) {
        rej(error);
      }

      res(result);
    });
  });
};

const fun = async () => {
  await setUpMongoAsync();
  await asyncCon();
  const folderName = "employees_json";
  await asyncMakeFolder(folderName);
  await asyncSendEmployeesData(folderName);
  console.log("done");
};

fun();

const asyncSendEmployeesData = async folder => {
  data = await findAsync(employeeCollectionLocal);
  const len = data.length;
  console.log(data.length);
  let from = 0;
  for (let i = 0; i < len; i++) {
    await asyncSendFile({ data: data.splice(0, 50), file: `${folder}/${i}` });
    from += 50;
    console.log(from);
    if (from > len) {
      break;
    }
  }
};

const urlVal1 = "devincimdb1013.westeurope.cloudapp.azure.com";
const urlVal2 = "devincimdb2013.westeurope.cloudapp.azure.com";
const urlFay1 = "devincimdb1050.westeurope.cloudapp.azure.com";
const urlFay2 = "devincimdb2050.westeurope.cloudapp.azure.com";

const paramsConn = {
  hostname: urlFay2,
  username: "administrateur",
  password: "V8eOFR%_",
  port: 22,
};

const asyncCon = async () => {
  return new Promise((res, rej) => {
    var Client = require("ssh2").Client;
    var conn = new Client();
    conn
      .on("ready", function() {
        connection = conn;
        res();
      })
      .connect(paramsConn);
  });
};

const execAsync = async cmd => {
  return new Promise((res, rej) => {
    connection.exec(cmd, function(err, stream) {
      if (err) throw err;
      stream
        .on("close", function(code, signal) {
          res();
        })
        .on("data", function(data) {})
        .stderr.on("data", function(data) {
          console.log("STDERR: " + data);
        });
    });
  });
};

const asyncSendFile = async ({ data, file }) => {
  await execAsync(`echo '${JSON.stringify(data)}' > ${file}.json`);
};

const asyncMakeFolder = async folderName => {
  await execAsync(`mkdir -p ${folderName}`);
};

// give script permission
// chmod +x
///mongoimport --db employees --collection departement_json/employees.json  --file departements --jsonArray
const scriptLoadEmployeesJson = `
#!/bin/bash
for entry in employees_json/*
do
        mongoimport --db employees --collection employees  --file $entry --jsonArray
done
`;
