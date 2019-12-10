const express = require("express");
const moment = require("moment");
var MongoClient = require("mongodb").MongoClient;
const bodyParser = require("body-parser");
const fs = require("fs");
const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
let departmentCollection, employeeCollection;

//             https://app-cloud-employee.herokuapp.com/

const DATABASE_NAME = "test";
MongoClient.connect(
  "mongodb://val:wordpass@devincimdb2013.westeurope.cloudapp.azure.com:30000/test",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  },
  (error, client) => {
    if (error) {
      console.log(error);
    } else {
      database = client.db(DATABASE_NAME);
      departmentCollection = database.collection("departments");
      employeeCollection = database.collection("employees");

      console.log("Mongo Connected");
    }
  }
);

const PORT = process.env.PORT || 8080;

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/html/index.html");
});

app.get("/user_vue.html", (req, res) => {
  res.sendFile(__dirname + "/html/user_vue.html");
});

app.get("/administrator_vue.html", (req, res) => {
  res.sendFile(__dirname + "/html/administrator_vue.html");
});

app.get("/analyst_vue.html", (req, res) => {
  res.sendFile(__dirname + "/html/analyst_vue.html");
});

app.get("/request/1", async (req, res) => {
  res.send({ res: await request1() });
});

app.get("/request/2", async (req, res) => {
  const param = req.query.param;
  res.send({ res: await request2(param) });
});

app.get("/request/3", async (req, res) => {
  res.send({ res: await request3() });
});

app.get("/request/4", (req, res) => {
  res.send({ res: JSON.parse(fs.readFileSync("req4_result.json")) });
});

app.get("/request/5", async (req, res) => {
  res.send({ res: await request5() });
});

app.get("/request/6", (req, res) => {
  res.send({ res: JSON.parse(fs.readFileSync("req6_result.json")) });
});

app.get("/request/7", async (req, res) => {
  res.send({ res: await request7() });
});

app.get("/request/8", async (req, res) => {
  const param = req.query.param;
  res.send({ res: await request8(param) });
});

app.listen(PORT, () => {
  console.log(`Server running at: http://localhost:${PORT}/`);
});

const request1 = async () => {
  return await countAsync(employeeCollection);
};

const request2 = async id => {
  console.log(id);
  return await findAsync({
    request: { emp_no: Number(id) },
    collection: employeeCollection,
  });
};

const request3 = async () => {
  return await distinctAsync({
    field: "dept_name",
    collection: departmentCollection,
  });
};

const request4 = async () => {
  data = [];
  depts = await findAsync({ collection: departmentCollection });
  emps = await findAsync({
    collection: employeeCollection,
  });

  if (depts) {
    depts.map(async dept => {
      dept.dept_managers.map(async manager => {
        emp = emps.find(e => e.emp_no == manager.emp_no);

        data.push({
          emp_no: emp.emp_no,
          first_Name: emp.first_Name,
          last_name: emp.last_name,
          departement: dept.dept_name,
        });
      });
    });
    return data;
  }
};

const request5 = async () => {
  const request = [
    { $unwind: "$dept_emps" },
    {
      $group: {
        _id: "$dept_name",
        count: { $sum: 1 },
      },
    },
  ];

  return await aggregateAsync({ request, collection: departmentCollection });
};

const request6 = async () => {
  const date = moment("1989-08-10");
  const data = {};
  const emps = await findAsync({ collection: employeeCollection });
  const depts = await findAsync({ collection: departmentCollection });

  if (emps) {
    for (const emp of emps) {
      const salaries = [];
      for (slry of emp.salaries) {
        if (
          moment(date).isBetween(moment(slry.from_date), moment(slry.to_date))
        ) {
          salaries.push(slry.salary);
        }
      }
      if (salaries.length > 0) {
        data[emp.emp_no] = salaries;
      }
    }

    if (depts) {
      const result = [];
      for (const dept of depts) {
        let sum = 0;
        let cpt = 0;
        for (const emp of dept.dept_emps) {
          const v = data[emp.emp_no];
          if (v) {
            cpt += v.length;
            sum += v.reduce((p, c) => p + c);
          }
        }
        result.push({ Departement: dept.dept_name, avg: sum / cpt });
      }
      return result;
    }
  }
};

const request7 = async () => {
  const request = [
    { $unwind: "$salaries" },
    {
      $group: {
        _id: 0,
        avg: { $avg: "$salaries.salary" },
      },
    },
  ];

  return await aggregateAsync({ request, collection: employeeCollection });
};

const request8 = async param => {
  const request = [
    {
      $unwind: "$salaries",
    },
    { $match: { "titles.title": param } },
    {
      $group: {
        _id: 0,
        min: { $min: "$salaries.salary" },
        max: { $max: "$salaries.salary" },
      },
    },
  ];
  return await aggregateAsync({ request, collection: employeeCollection });
};

const aggregateAsync = async ({ collection, request }) => {
  if (!collection) {
    console.log("Collection undefined");
    return;
  }
  return new Promise((res, rej) => {
    collection.aggregate(request).toArray((error, result) => {
      if (error) {
        rej(error);
      }
      res(result);
    });
  });
};

const findAsync = async ({ collection, request = {} }) => {
  if (!collection) {
    console.log("Collection undefined");
    return;
  }
  return new Promise((res, rej) => {
    collection.find(request).toArray((error, result) => {
      if (error) {
        rej(error);
      }
      res(result);
    });
  });
};

const distinctAsync = async ({ collection, field }) => {
  if (!collection) {
    console.log("Collection undefined");
    return;
  }
  return new Promise((res, rej) => {
    collection.distinct(field, (error, result) => {
      if (error) {
        rej(error);
      }
      res(result);
    });
  });
};

const countAsync = async collection => {
  if (!collection) {
    console.log("Collection undefined");
    return;
  }
  return new Promise((res, rej) => {
    collection.countDocuments({}, (error, result) => {
      if (error) {
        rej(error);
      }
      res(result);
    });
  });
};
