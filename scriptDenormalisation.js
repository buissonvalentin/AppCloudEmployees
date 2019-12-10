const mysql = require("mysql");
const MongoClient = require("mongodb").MongoClient;
const fs = require("fs");

let departmentCollection, employeeCollection;

const con = mysql.createConnection({
  host: "relational.fit.cvut.cz",
  user: "guest",
  password: "relational",
  database: "employee"
});

const CONNECTION_URL = "mongodb://localhost:27017/AppCloud";
const DATABASE_NAME = "Employees";

const setUpSqlAsync = () => {
  new Promise((res, rej) => {
    con.connect(async err => {
      if (err) {
        console.log(err);
        rej(err);
      }
      console.log("SQL Connected!");
      res();
    });
  });
};

const setUpMongoAsync = () => {
  new Promise((res, rej) => {
    MongoClient.connect(
      CONNECTION_URL,
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
        departmentCollection = database.collection("department");
        employeeCollection = database.collection("employee");
        employeeCollection.find({}).toArray((error, result) => {
          if (error) {
            console.log(error);
          }
          fs.writeFileSync("employees.json", JSON.stringify(result));
          console.log(JSON.stringify(result));
        });
        
        res();
        console.log("Mongo Connected");
      }
    );
  });
};

const getSqlData = async () => {
  const employeeesQuery =
    "SELECT emp_no, birth_date, first_Name, last_name, gender, hire_date FROM employees;";
  const employees = await queryAsync(employeeesQuery);
  let empCount = 0;
  let deptCount = 0;
  for (const emp of employees) {
    empCount++;
    const salariesQuery = `SELECT salary, from_date, to_date FROM salaries WHERE emp_no=${emp.emp_no};`;
    const titlesQuey = `SELECT title, from_date, to_date from titles WHERE emp_no=${emp.emp_no};`;
    const salaries = await queryAsync(salariesQuery);
    const titles = await queryAsync(titlesQuey);
    console.log(
      `Employee : ${empCount} / ${employees.length} : ${salaries.length} salaries | ${titles.length} titles`
    );
    emp.salaries = salaries;
    emp.titles = titles;
  }

  await insertAsync({
    collection: employeeCollection,
    data: employees
  });

  const depertmentsQuery = "SELECT dept_no, dept_name FROM departments;";
  const departments = await queryAsync(depertmentsQuery);
  for (const dept of departments) {
    deptCount++;
    const dept_managersQuery = `SELECT emp_no, from_date, to_date FROM dept_manager WHERE dept_no='${dept.dept_no}';`;
    const dept_empsQuery = `SELECT emp_no, from_date, to_date FROM dept_emp WHERE dept_no='${dept.dept_no}';`;
    const dept_managers = await queryAsync(dept_managersQuery);
    const dept_emps = await queryAsync(dept_empsQuery);
    console.log(
      `Employee : ${deptCount} / ${departments.length}  : ${dept_managers.length} dept_managers | ${dept_emps.length} dept_emps`
    );

    dept.dept_managers = dept_managers;
    dept.dept_emps = dept_emps;
  }

  await insertAsync({
    collection: departmentCollection,
    data: departments
  });
};

const queryAsync = async req => {
  new Promise((res, rej) => {
    con.query(req, (err, data) => {
      if (err) {
        console.log(err);
      } else {
        res(data);
      }
    });
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

const clearMongo = async () => {
  new Promise((res, rej) => {
    departmentCollection.deleteMany({}, err => {
      if (err) {
        rej(err);
      }
      employeeCollection.deleteMany({}, err => {
        if (err) {
          rej(err);
        }
        console.log("Mongo Cleared !");
        res();
      });
    });
  });
};

const denormalise = async () => {
  //await setUpSqlAsync();
  await setUpMongoAsync();
  // await getSqlData();
};

denormalise();

const departments = {
  dept_no: "",
  dept_name: "",
  dept_managers: [
    {
      dept_no: "",
      emp_no: "",
      from_date: "date",
      to_date: "date"
    }
  ],
  dept_emps: [
    {
      emp_no: "int",
      dept_no: "",
      from_date: "date",
      to_date: "date"
    }
  ]
};

const employees = {
  emp_no: "int",
  birth_date: "date",
  first_Name: "",
  last_name: "",
  gender: "enum",
  hire_date: "date",
  salaries: [
    {
      emp_no: "int",
      salary: "int",
      from_date: "date",
      to_date: "date"
    }
  ],
  titles: [
    {
      emp_no: "int",
      title: "",
      from_date: "date",
      to_date: "date"
    }
  ]
};
