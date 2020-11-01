# Welcome to MyFramework 

**Warning: This proejct is very alpha and should not be used yet**
**Documentation is going to be improved very soon**

This my take on a Object Oriented MVC NodeJS framework. The framework is built in TypeScript and built for TypeScript. The framework is built with a very controlled structure that is very scalable see more about this in documentation. My goal for the framework is to minimize the amount of dependencies and keep it as close to 0 as I can.

---
- [Welcome to MyFramework](#welcome-to-myframework)
- [Current support](#current-support)
- [Get started](#get-started)
- [Documentation](#documentation)
  - [Starting off](#starting-off)
  - [Index.ts](#indexts)
    - [Boiler plate code](#boiler-plate-code)
      - [Methods](#methods)
    - [Controllers](#controllers)
      - [Boilerplate code](#boilerplate-code)
  - [## Model](#h2-idmodel-532modelh2)
  - [### Creating your first model](#h3-idcreating-your-first-model-532creating-your-first-modelh3)
  - [### CRUD](#h3-idcrud-532crudh3)
      - [CREATE](#create)
      - [READ](#read)
      - [UPDATE](#update)
  - [### Relationships](#h3-idrelationships-532relationshipsh3)
    - [View](#view)
# Current support
Coming soon...
# Get started
First off make sure you got TypeScript installed or install it with
```bash
npm i -g typescript
```
Then install clone the repo and install all dependencies, enter the directory you want the project to be located in and run
```bash
git clone https://github.com/Hugo-Persson/MyFramework.git
cd MyFramework
npm i 
```
You can now compile the src folder into build with 
```bash
npm run build
```
But I recommend using nodemon cobined with ts-node for instant update on code changes, install nodemon and ts-node with
```bash
npm i -g nodemon ts-node
```
Then use following command to start the project with nodemon and automaticly restart server on change.
```bash
npm run dev
```
Now you should be up and running



# Documentation

---
Currently project very far from done and only controller support have been implemented but documentation will include more later.

## Starting off
All your code will be placed inside the src folder, the Index.ts file is the file you start the project with and contain all global configuration.

## Index.ts

---
The point of the index.ts is to handle initialization and handle global routes and global configureation.

### Boiler plate code
```typescript
import "module-alias/register";
import Core from "@lib/Core";
import Initialize from "@lib/Initialize";

class Start extends Initialize {
    core: Core;
    constructor() {
        super();
        this.core = new Core(this);
    }
}
new Start();

```
Where the class that inherits from Initialize can be called anything

#### Methods

---
You can overide the following methods from Initialize class they are called on different events depending on different events.
```typescript
preStart(){
    // Called before the server is started
}
postStart() {
    // Called after the server has been started
}

noPageFound() {
    // 404 handler
    this.res.send("404");
}
indexAction() {
    // Called whenever the user don't specify a controler, meaning they used the / path
    
}
```


### Controllers

---
Every controller should be placed inside the controller directory and should inherit from Controller base class. 

**Going to add more info later**

#### Boilerplate code
```typescript
import Controller from "@lib/Controller";

export default class Users extends Controller {

}
```
Example controller
```typescript
import Controller from "@lib/Controller";

export default class Users extends Controller {
    index(){
        // Index route for the controller 
        // Route for this example is Users/

    }

    create(){
        // Called whenever the user enters the path Users/create
    }

    Create(){
        // actions are case sensetive so this method is called whenever the user enters the path Users/Create not Users/creat
        // This is not recommended cause because it goes against typescript style guide


    }

    edit(){
        // example of how to use res
        this.res.send("Hello world");
    }
}
```
## Model
---
### Creating your first model
---
The boilerplate code for a model looks like this
```typescript
import { Model, column, primaryKey } from "@lib/Model";
export default class Users extends Model {
    @column // Sets the id property to a column
    @primaryKey // Sets this column to a primary key
    public id: number;
    @column
    public name: string;

    tableName = "users"; // IMPORTANT: tablename must be set

    constructor(id?: number, name?: string) {
        super();
        this.id = id;
        this.name = name;
    }

    
}

```
When defining a model it's important to define the table columns with the decorator @column which is imported from the model file. You also need to set the primary key decorator which for atleast one column but you can set it for multiple columns. The primary key decorator is imported from the model file and looks like this @primaryKey. The primary key is used when saving and updating the database. 


### CRUD
---
For all these examples I am gonna use the model shown in the example above
#### CREATE
If you wish to create a new model simply create a new object of the the class that extends the Model baseclass and assign properties and then run save. Example below
```typescript
const user = new Users(); // User is an class that extends the base class Model
user.name = "A name" // Setting a property
await user.save(); // .save() returns a promise

// You can assign the property in whatever way you want as long as they are assigned before running .save()
// Properties not assigned will not be included in the INSERT statement and will default to what is declared in the SQL database

// You can assign the properties in an constructor like this 
const user = new User(undefined, "A name");
await user.save();
```
#### READ
When you wanna fetch a row from the database after a filter you do the following.
```typescript
// Fetching many rows
const filter: Users = new Users();
filter.name = "Hugo";
const rows: Array<Users> = Users.getManyRowsByFilter<Users>(filter); 

// You should generelly only fetch many if you believe that the result from the databse will otherwise use getSingleRowByFilter becasue it is faster.
const filter: Users = new Users();
filter.id = 1; // The id is the primary key so only one row will have that id
const user: Users = Users.getSingleRowByFilter<Users>(filter); 
``` 
#### UPDATE
To update a row combine read capabilities and save capabilities. 

Example: 
```typescript
const filter: Users = new Users();
filter.id = 1;
const user: Users = Users.getSingleRowByFilter<Users>(filter); 
user.name = "John Doe";
await user.save();

```



### Relationships
---

### View

Not yet implemented