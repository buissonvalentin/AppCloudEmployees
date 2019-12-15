const vmData = [
  {
    url: "devincimdb1013.westeurope.cloudapp.azure.com",
    cmd: "mongod -f conf/mongo_configSvr.conf"
  },
  {
    url: "devincimdb2013.westeurope.cloudapp.azure.com",
    cmd: "mongos -f conf/mongos.conf"
  },
  {
    url: "devincimdb1050.westeurope.cloudapp.azure.com",
    cmd: "mongod -f conf/mongo_RS1.conf"
  },
  {
    url: "devincimdb2050.westeurope.cloudapp.azure.com",
    cmd: "mongod -f conf/mongo_RS2.conf"
  }
];

const paramsConn = {
  username: "administrateur",
  password: process.env("VM_PASSWORD"), //"V8eOFR%_",
  port: 22
};

const asyncCon = async params => {
  return new Promise((res, rej) => {
    var Client = require("ssh2").Client;
    var conn = new Client();
    conn
      .on("ready", function() {
        console.log("connected : ", params.hostname);
        res(conn);
      })
      .connect(params);
  });
};

const execAsync = async ({ connection, cmd }) => {
  return new Promise((res, rej) => {
    connection.exec(cmd, function(err, stream) {
      if (err) throw err;
      stream
        .on("close", function(code, signal) {
          console.log("done");
          res();
        })
        .on("data", function(data) {})
        .stderr.on("data", function(data) {
          //console.log("STDERR: " + data);
        });
    });
  });
};

const fun = async () => {
  for (const data of vmData) {
    const connection = await asyncCon({ ...paramsConn, hostname: data.url });
    await execAsync({ connection, cmd: data.cmd });
  }
};

fun();
