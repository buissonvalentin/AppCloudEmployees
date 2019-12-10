const MongoClient = require("mongodb").MongoClient;
const moment = require("moment");

const CONNECTION_URL_LOCAL = "mongodb://localhost:27017/AppCloud";
const DATABASE_NAME = "Employees";
let departmentCollectionLocal, employeeCollectionLocal;
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

const findAsync = async ({ query = {}, collection }) => {
  return new Promise((res, rej) => {
    collection.find(query).toArray(function(error, result) {
      if (error) {
        rej(error);
      }

      res(result);
    });
  });
};

const requeteSimple4 = async () => {
  data = [];
  await setUpMongoAsync();
  depts = await findAsync({ collection: departmentCollectionLocal });

  await Promise.all(
    depts.map(async dept => {
      await Promise.all(
        dept.dept_managers.map(async manager => {
          emp = (
            await findAsync({
              query: { emp_no: manager.emp_no },
              collection: employeeCollectionLocal,
            })
          )[0];
          data.push({
            emp_no: emp.emp_no,
            Prénom: emp.first_Name,
            Nom: emp.last_name,
            Département: dept.dept_name,
          });
        })
      );
    })
  );
  console.log(data);
};

const requeteComplexe2 = async () => {
  const date = moment("1989-08-10");
  const data = {};
  await setUpMongoAsync();
  const emps = await findAsync({ collection: employeeCollectionLocal });
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
  const depts = await findAsync({ collection: departmentCollectionLocal });
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
  console.log(result);
};

requeteSimple4();
requeteComplexe2();
