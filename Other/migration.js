const mysql = require("mysql");
const MongoClient = require("mongodb").MongoClient;
const fs = require("fs");

let departmentCollectionLocal, employeeCollectionLocal;

const CONNECTION_URL_LOCAL = "mongodb://localhost:27017/AppCloud";
const DATABASE_NAME = "Employees";

const setUpMongoAsync = () => {
  return new Promise((res, rej) => {
    MongoClient.connect(
      CONNECTION_URL_LOCAL,
      {
        useNewUrlParser: true,
        useUnifiedTopology: true
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

const insertAsync = async ({ collection, data }) => {
  new Promise((res, rej) => {
    collection.insertMany(data, (error, result) => {
      if (error) {
        rej(error);
      }
      console.log(
        `${data.length} data inserted in ${Object.keys({ collection })[0]}`
      );
      res();
    });
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
  console.log("setup");
  console.log(await findAsync(departmentCollectionLocal));
};

fun();
