# Place Mark

Place Mark is a small service for managing point of interests, or for short POIs.

> A point of interest (POI) is a specific point location that someone may find useful or interesting. 
> An example is a point on the Earth representing the location of the Eiffel Tower, 
> or a point on Mars representing the location of its highest mountain, Olympus Mons. 
> Most consumers use the term when referring to hotels, campsites, fuel stations or any other categories used in modern automotive navigation systems.
>
> For more information, see [Wikipedia: Point of interest](https://en.wikipedia.org/wiki/Point_of_interest)

---

## Getting Started

Install all dependencies (everything is tested for node 16.x and 18.x):
``` 
npm install
```

Since this projects uses npm workspaces, each package/project has its own ```package.json``` file.
Running project specific npm commands need the ```--workspace package/[PACKAGE]``` parameter to work.
All important commands to lint, test, start, etc. are configured in the root ```package.json``` file.

Lint the API source code
```
npm run lint:api
```

Test the API source code (a mongo database is required to be provided first. The connection string must be provided in the ```.env.testing``` file!)
```
npm run test:api
```

If ```docker``` is installed, the following command can be used to setup a local mongodb database with replica set and mongo-express.
```
docker-compose up -d
```

To run a development server, you can use (mongodb is required and configured through the ```.env``` file)
```
npm run dev:api
```

---

## About this project

This web application was developed as a project work for the elective course "Advanced Full Stack Web Development", 
which is part of the third semester of the computer science program at the [OTH Regensburg](https://www.oth-regensburg.de/) (Ostbayerische technische Hochschule Regensburg/ Regensburg University of Applied Sciences).

The course used [Node.js](https://nodejs.org/) to show how to build and deploy a modern web application.
During the course, the [hapi framework](https://hapi.dev/) for the backend and [Svelte](https://svelte.dev/) for the frontend were introduced. 
As well as various packages and tools.

### Modifications

We also have a certain amount of freedom in the implementation of the project.
Due to the already very successfully completed apprenticeship (with focus on C#/ASP.NET Core, [Angular](https://angular.io/) and Microsoft SQL Server)
and my former experimenting ego, which has already gained some basic know-how with [express](https://expressjs.com/) and [mongoose](https://www.npmjs.com/package/mongoose)
during tinkering with Amazon Alexa Skills, I decided to use this project as a chance and experiment a little 😁.

Following "modifications" were made (and were approved by the professor):
- Typescript not only in the frontend, but also in the backend.
  - Even though I use Typescript regularly, I have never created, configured and deployed a project with it (and in combination with eslint and other tools) myself from scratch.
  - Well, I really like type-safety. ^^
- One mono-repo instead of two separate git repositories for frontend and backend.
  - Since I use Typescript for frontend and backend, I should be able to share at least the DTOs (Data Transfer Objects) between frontend and backend. 
  - Of course, these are only TypeScript interfaces and will so not be in the final build artifacts.
  - But, even if this is not useful, I wanted to experiment with [npm workspaces](https://docs.npmjs.com/cli/v9/using-npm/workspaces?v=true). (Mistakes are allowed ^^)
- Replacing mongoose with [Prisma](https://www.prisma.io/)
  - As already said, I experimented with mongoose some years ago.
  - During my second semester, I already had the idea to use [Sequelize](https://sequelize.org/) (a ORM too) in my project in the Medieninformatik course, but that would were a complete overkill.
  - Because Sequelize seems not to support Mongo as a database, I found Prisma and simply thought, that this could be funny to look at ^^

### Things that I just try out

Most developers are lazy and want to automize boring stuff. That plus my over engineering ego (as I said, I want to experiment a little 😁) are the reasons for some crazy things that I implement.

- Form model state and validation
  - I tried to automate and simplify the Joi Schema creation as well as managing forms when invalid inputs are given, so the user does not have to type everything again.
  - For this, a ```FormDefintion``` can be created, where the ```action```, the ```method``` and the ```input```s are configured.
  - The Joi Schema can be created from the ```FormDefintion```
  - Validation attributes for ```input``` Html Tag can be generated from the ```FormDefintion```
  - The form can be prefilled with values send before (validation were invalid)

---