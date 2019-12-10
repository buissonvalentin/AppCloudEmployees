var MongoClient = require("mongodb").MongoClient;
MongoClient.connect(
  "mongodb://val:wordpass@devincimdb2013.westeurope.cloudapp.azure.com:30000/test",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  },
  (err, client) => {
    if (err) throw err;

    console.log("connected");
  }
);

// db.createUser({
//   user: "val",
//   pwd: "wordpass",
//   roles: [{ role: "readWrite", db: "test" }],
// });
