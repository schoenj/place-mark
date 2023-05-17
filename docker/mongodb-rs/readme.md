# Prisma with mongo db running locally

There are two main problems when setting up Prisma with MongoDB on Docker.
1) Prisma requires replica sets for transactions
2) Connection string requires a authentication source specified

For more information, see [Prisma Docker on GitHub](https://github.com/prisma/prisma/tree/main/docker)