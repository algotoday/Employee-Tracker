# Employee Tracker 
  


## Description
A CLI application for business owners to be able to view and manage the departments, roles, and employees in their companies. Walkthrough video <a href=''>here</a>.

## Table of Contents
- [Description](#description)
- [Installation](#installation)
- [Usage](#usage)
- [Contributing](#contributing)

## Installation
First clone this repository into your local folder, then ensure you have node.js and mysql installed. Link to install mysql <a href='https://coding-boot-camp.github.io/full-stack/mysql/mysql-installation-guide'>here</a>.

## Usage
In the command line first run `npm i`, then sign into your mysql by running `mysql -u <YOUR_MYSQL_USERNAME> -p`. After you enter your password and are logged into the mysql shell, run the following commands: `source db/db.sql`, `source db/schema.sql`, `source db/seeds.sql`. After you run those commands, exit out of mysql with the `quit;` command. Create a file at the root of the directory called .env and insert these 3 lines inside it: `DB_NAME='cms'`, `DB_USER='<YOUR_MYSQL_USERNAME>'`, `DB_PASSWORD='<YOUR_MYSQL_PASSWORD>'` and lastly, in the command line run `node index.js`.


## Contributing
Tony Jones


