const db = require('./db/connection');
const cTable = require('console.table');
const inquirer = require('inquirer');

let departments = getDepartments();
let roles = getRoles();
let managers = getManagers();
let employees = getEmployees();


const prompt =()=>{ 
        inquirer.prompt([
    {
        type: 'list',
        name: 'main',
        message: 'What would you like to do?',
        choices: [
            'View all departments', 'View all roles', 'View all employees',
            'Add a department', 'Add a role', 'Add an employee', 'Update an employee', 'Quit'
        ]
    }
]).then(answer => {
    switch(answer.main) {
        case 'View all departments':
            viewDepart();
            break;
        case 'View all roles':
            viewRoles();
            break;
        case 'View all employees':
            viewEmployees();
            break;
        case 'Add a department':
            addDepart();
            break;
        case 'Add a role':
            addRole();
            break;
        case 'Add an employee':       
            addEmployee();
            break;
        case 'Update an employee':
            updateEmployee();
            break;
        case 'Quit':
            console.log("Bye!")
            setTimeout(quit, 750);
            break;
        }
    });
};

function viewDepart(){
    const sql = `SELECT id AS department_id, name AS department FROM departments;`

    db.query(sql, (err, rows) => {
        if (err) {
            console.log(err.message);
            return;
        }
        console.table(rows);
        setTimeout(again, 1000); 
    });
};

function viewRoles(){
    const sql = `SELECT roles.title, roles.id AS role_id, departments.name as department, roles.salary FROM roles
        INNER JOIN departments ON roles.department_id = departments.id;`

    db.query(sql, (err, rows) => {
        if (err) {
            console.log(err.message);
            return;
        }
        console.table(rows);
        setTimeout(again, 1000); 
    });
};

function viewEmployees(){
    const sql = `SELECT e.id AS employee_id, e.first_name, e.last_name,
    roles.title AS job_title, roles.salary, m.title AS job_title, m.salary,
    departments.name AS department, d.name AS department,
    CONCAT(employees.first_name, ' ', employees.last_name) AS manager
    FROM employees
    RIGHT JOIN employees e ON employees.id = e.manager_id
    LEFT JOIN roles ON employees.role_id = roles.id
    LEFT JOIN roles m ON e.role_id = m.id
    LEFT JOIN departments ON roles.department_id = departments.id
    LEFT JOIN departments d ON m.department_id = d.id;`

    db.query(sql, (err, rows) => {
        if (err) {
            console.log(err.message);
            return;
        }
        console.table(rows);
        setTimeout(again, 1000); 
    });
};

function addDepart(){
    inquirer.prompt(
        {
            type: 'input',
            name: 'department',
            message: "Please provide the name of the department you wish to add."
        }
    ).then(answer => {
        const sql = `INSERT INTO departments (name)
        VALUES (?)`
        
        db.query(sql, answer.department, (err, row) => {
            if (err) {
                console.log(err.message);
                return;
            }
            console.log(`Department successfully added!`);
            departments.push(answer.department);
            setTimeout(again, 1000); 
        });
    });
};

function addRole(){
    getDepartments();
    inquirer.prompt([
        {
            type: 'input',
            name: 'role',
            message: "Please provide the title of the role you wish to add."
        },
        {
            type: 'number',
            name: 'salary',
            message: 'Please provide the salary of this role in decimal form (i.e. $140,000 = 140.000)'
        },
        {
            type: 'list',
            name: 'department',
            message: 'Which department would this role best fit?',
            choices: departments
        }
    ]).then(answers => {
        roles.push(answers.role);
        let id = departments.indexOf(answers.department);
        id += 1;

        const sql = `INSERT INTO roles (title, salary, department_id)
        VALUES
        (${JSON.stringify(answers.role)}, ${answers.salary}, ${id})`;


        db.query(sql, (err, row) => {
            if (err) {
                console.log(err.message);
                return;
            }
            console.log(`Role successfully added!`);
            setTimeout(again, 1000); 
        });
    });
};

function addEmployee(){
    getManagers()
    getRoles()
    inquirer.prompt([
        {
            type: 'input',
            name: 'first_name',
            message: "Please provide the first name of the employee."
        },
        {
            type: 'input',
            name: 'last_name',
            message: 'Please provide the last name of the employee.'
        },
        {
            type: 'list',
            name: 'role',
            message: 'Which role would this employee best fit?',
            choices: roles
        },
        {
            type: 'list',
            name: 'manager',
            message: "Who's this employee's manager?",
            choices: managers
        }
    ]).then(answers => {
        let role_id = (answers.role.split(' ')[0]);

        let manager_id = ''
        if (answers.manager === 'null') {
            manager_id = null
        } else {
            manager_id = answers.manager.split(' ')[0]
        }


        const sql = `INSERT INTO employees (first_name, last_name, role_id, manager_id)
        VALUES
        (${JSON.stringify(answers.first_name)}, ${JSON.stringify(answers.last_name)}, ${role_id}, ${manager_id})`


        db.query(sql, (err, row) => {
            if (err) {
                console.log(err.message);
                return;
            }
            console.log(`Employee successfully added!`)
            setTimeout(again, 1000); 
        });
    });
};

function updateEmployee(){
    getEmployees()

    inquirer.prompt(
    [
        {
            type: 'list',
            name: 'employee',
            message: 'Which employee would you like to update?',
            choices: employees
        },
        {
            type: 'list',
            name: 'update',
            message: 'What would you like to update?',
            choices: ['First Name', 'Last Name', 'Role', 'Manager']
        }
    ]).then(({update, employee}) => {
        const id = employee.split(' ')[0]
        switch (update){
            case 'First Name':
                updateFirstName(id);
                break;
            case 'Last Name':
                updateLastName(id);
                break;
            case 'Role':
                updateRole(id);
                break;
            case 'Manager':
                updateManager(id)
                break;
        };
    });
};

const updateFirstName=(id)=>{
    inquirer.prompt(
      [
        {
        type: 'input',
        name: 'first_name',
        message: 'What would you like to change their first name to?'
        }
    ])
        .then(({ first_name }) => {
        const sql = `UPDATE employees
        SET first_name = ${JSON.stringify(first_name)}
        WHERE id = ${Math.floor(id)}`;

        db.query(sql, (err, result) => {
            if (err) {
                console.log(err.message);
                return;
            }
            console.log('Successfully updated!');
            setTimeout(again, 1000); 
        });
    });
};

const updateLastName = (id)=>{
    inquirer.prompt(
      [
        {
        type: 'input',
        name: 'last_name',
        message: 'What would you like to change their last name to?'
        }
    ])
        .then(({ last_name }) => {
        const sql = `UPDATE employees
        SET last_name = ${JSON.stringify(last_name)}
        WHERE id = ${Math.floor(id)}`;

        db.query(sql, (err, result) => {
            if (err) {
                console.log(err.message);
                return;
            }
            console.log('Successfully updated!');
            setTimeout(again, 1000); 
        });
    });
};

const updateRole = (id)=>{
    getRoles()
    inquirer.prompt(
        [
          {
          type: 'list',
          name: 'role',
          message: 'What would you like to change their role to?',
          choices: roles
          }
      ])
          .then(({ role }) => {
          const sql = `UPDATE employees
          SET role_id = ${role.split(' ')[0]}
          WHERE id = ${Math.floor(id)}`;
  
          db.query(sql, (err, result) => {
              if (err) {
                  console.log(err.message);
                  return;
              }
              console.log('Successfully updated!');
              setTimeout(again, 1000); 
          });
    });
};

const updateManager = (id)=>{
    getManagers();
    
    inquirer.prompt(
        [
          {
          type: 'list',
          name: 'manager',
          message: 'Who would you like to change their manager to?',
          choices: managers
          }
      ])
        .then(({ manager }) => {
            let manager_id = ' ';
            if(manager === 'null'){
                manager_id = null
            } else {
                manager_id = manager.split(' ')[0]
            };
    
            const sql = `UPDATE employees
            SET manager_id = ${manager_id}
            WHERE id = ${Math.floor(id)}`;

            db.query(sql, (err, result) => {
                if (err) {
                    console.log(err.message);
                    return;
                }
                console.log('Successfully updated!');
                setTimeout(again, 1000); 
            });
      });
};

function getManagers(){
    db.query({sql: 'SELECT id, first_name, last_name FROM employees WHERE manager_id IS NULL;', rowsAsArray: true }, (err, results) => {
        if (err) {
            console.log(err.message);
            return;
        }
        managers = [];
        for(let i=0; i<results.length; i++) {
            managers.push(results[i].toString().replace(/,/g, ' '));
        }
        managers.push('null');
        return managers;
    });
};

function getRoles(){
    db.query({sql: 'SELECT id, title FROM roles', rowsAsArray: true }, (err, results) => {
        if (err) {
            console.log(err.message);
            return;
        }
        roles = []
        for(let i=0; i<results.length; i++) {
            roles.push(results[i].toString().replace(/,/g, ' '))
        }
        return roles;
    });
};

function getDepartments(){
    db.query({sql: 'SELECT name FROM departments', rowsAsArray: true }, (err, results) => {
        if (err) {
            console.log(err.message);
            return;
        }
        departments = []
        for(let i=0; i<results.length; i++) {
            departments.push(results[i].toString())
        }
        return departments;
    });
};

function getEmployees(){
    db.query({sql: 'SELECT id, first_name, last_name FROM employees', rowsAsArray: true }, (err, results) => {
        if (err) {
            console.log(err.message);
            return;
        }
        employees = []
        for(let i=0; i<results.length; i++) {
            employees.push(results[i].toString().replace(/,/g, ' '))
        }
    });
};

const again =()=>{
    inquirer
    .prompt({
        type: 'list',
        name: 'again',
        message: 'Would you like to continue?',
        choices: ['yes', 'no']
    })
    .then(({ again }) => {
        if (again === 'yes') {
            prompt();
        } else {
            console.log("Bye!")
            setTimeout(quit, 750)
        }
    });
};

const quit =()=> {
    process.exit(0);
}


module.exports = prompt;