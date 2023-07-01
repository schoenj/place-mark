# Place Mark

[![Netlify Status](https://api.netlify.com/api/v1/badges/c4a0e1fa-c6db-4724-98a8-e73f75ea9562/deploy-status)](https://app.netlify.com/sites/melodious-profiterole-fc2fbf/deploys)

[Frontend(Netlify)](https://melodious-profiterole-fc2fbf.netlify.app/)

[Backend(Render)](https://place-mark-schoenj-backend.onrender.com/)

---

Place Mark is a small service for managing point of interests, or for short POIs.

> A point of interest (POI) is a specific point location that someone may find useful or interesting. 
> An example is a point on the Earth representing the location of the Eiffel Tower, 
> or a point on Mars representing the location of its highest mountain, Olympus Mons. 
> Most consumers use the term when referring to hotels, campsites, fuel stations or any other categories used in modern automotive navigation systems.
>
> For more information, see [Wikipedia: Point of interest](https://en.wikipedia.org/wiki/Point_of_interest)

---

## Getting Started

### API/Backend/Hapi

Change Directory to ```packages/place-mark-api``` and install all dependencies (everything is tested for node 16.x and 18.x) by using
```npm ci``` or ```npm i```

~~Since this projects uses npm workspaces, each package/project has its own ```package.json``` file.
Running project specific npm commands need the ```--workspace package/[PACKAGE]``` parameter to work.
All important commands to lint, test, start, etc. are configured in the root ```package.json``` file.~~

Lint the API source code:
```npm run lint```

Test the API source code
```npm run test```
Note that a mongo database is required. The connection string must be provided in the ```.env.testing``` file (default points to docker instance)!

If ```docker``` is installed, the following command can be used to setup a local mongodb database with replica set and mongo-express:
```docker-compose up -d```

To run a development server, you can use (mongodb is required and configured through the ```.env``` file)
```npm run dev```

To transpile the backend into plain javascript code, use
```npm run build```

To push the database (only indexes and unique constraints are supported by prisma), use
```npx prisma db push```

To seed a few entities, use
```npm run seed```

### Frontend (Svelte)

NOTE:
Since I struggled so much with svelte in combination with npm workspaces and ran out of time, only the deployment works.
For more information see the ```fb/svelte``` branch.

Change Directory to ```packages/place-mark-web``` and install all dependencies (everything is tested for node 16.x and 18.x) by using
```npm ci``` or ```npm i```

To run a development server, please use
```npm run dev```

To build the frontend, please use
```npm run build```

---

## Configuration

### Backend
Please create a .env-File or set these environment variables

```
DATABASE_URL=[CONNECTIONSTRING TO A MONGO DB DATABASE]
COOKIE_PASSWORD=[THE PASSWORD FOR THE ENCRYPTION OF THE COOKIES]
COOKIES_SECURE=[true|1 to enable https cookies only]
JWT_PASSWORD=[THE PASSWORD USED FOR THE SIGNATURE INSIDE OF THE JWT TOKENS]
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
- ~~One mono-repo instead of two separate git repositories for frontend and backend.~~
  - ~~Since I use Typescript for frontend and backend, I should be able to share at least the DTOs (Data Transfer Objects) between frontend and backend.~~ 
  - ~~Of course, these are only TypeScript interfaces and will so not be in the final build artifacts.~~
  - ~~But, even if this is not useful, I wanted to experiment with [npm workspaces](https://docs.npmjs.com/cli/v9/using-npm/workspaces?v=true).~~ (Mistakes are allowed ^^)
  - This did not work very well. Somehow this corrupted Svelte and "ambiguous imports" where generated. It looks like that Svelte were no longer able to correctly export validation methods from ```@svelte/internals``` or so. 
- Replacing mongoose with [Prisma](https://www.prisma.io/)
  - As already said, I experimented with mongoose some years ago.
  - During my second semester, I already had the idea to use [Sequelize](https://sequelize.org/) (a ORM too) in my project in the Medieninformatik course, but that would were a complete overkill.
  - Because Sequelize seems not to support Mongo as a database, I found Prisma and simply thought, that this could be funny to look at ^^

Following "modifications" were made (without extra approval by the professor):
- Using docker for local database setup
- Using Github-Actions instead of .toml-Files for Netlify-Deployment

### Things that I just tried out

Most developers are lazy and want to automize boring stuff. That plus my over engineering ego (as I said, I want to experiment a little 😁) are the reasons for some crazy things that I implement.

- Form model state and validation
  - I tried to automate and simplify the Joi Schema creation as well as managing forms when invalid inputs are given, so the user does not have to type everything again.
  - For this, a ```FormDefintion``` can be created, where the ```action```, the ```method``` and the ```input```s are configured.
  - The Joi Schema can be created from the ```FormDefintion```
  - Validation attributes for ```input``` Html Tag can be generated from the ```FormDefintion```
  - The form can be prefilled with values send before (validation were invalid)
  - EDIT: This is working, but not like I wanted to. 
    - Since I use mostly DTOs that are also used in the api interface, some JOI specifications are duplicated. This is definitely not optimal 🤨
    - The other way around, generating interfaces from joi schemas, is possible (packages are available). But inheritance is not working, because the ```.describe()``` method gives no information about it. So, meh!
- Using Controller-Classes
  - Instead of using ```web-routes.ts``` and so, I found an old github-repository that showed how to use Typescript-Decorators vor registering controller routes.
  - I like this approach, because i have to specify options anyway on the endpoint, so why should i split these into multiple files.
- Mode-View-Controller Pattern
  - Since i dont want to specify some variables all the time, i created my own view-models.
  - These View-Models are classes, thats the reason why ```@handlebars/allow-prototype-access``` is used.
- Some sort of dependency container
  - All Dependencies are abstracted by implementing their corresponding interface
  - No global prisma (in general db) instance
  - Reasons
    - Everything can be mocked for unit-and integration tests
    - Every Repository (and technically services, if more were needed) could be replaced without changing other dependencies.
---