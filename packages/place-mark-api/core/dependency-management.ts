import {PrismaClient} from "@prisma/client";
import {Request, ResponseToolkit, Server} from "@hapi/hapi";

/**
 * Declares methods and properties for managing dependencies.
 */
export interface IContainer {

    /**
     * Gets the PrismaClient for interacting with the Database
     */
    get db(): PrismaClient;

}

/**
 * Implements methods and properties for managing dependencies.
 */
export class Container implements IContainer {

    /**
     * Initializes a new instance of the Container-Class
     * @param _prisma The Prisma Client
     */
    constructor(private _prisma: PrismaClient) { }

    /**
     * Gets the Prisma Client
     */
    public get db(): PrismaClient {
        return this._prisma;
    }

}

declare module '@hapi/hapi' {

    /**
     * Extends the @hapi Request-Object to configure a container
     */
    interface Request {

        /**
         * Gets the container
         */
        container: IContainer

    }

}

/**
 * Configures the Hapi Server to initiate a container on every request
 *
 * @param server The Server to configure
 * @param prisma The Prisma Client
 */
export function registerDependencyManagement(server: Server, prisma: PrismaClient): void {
    server.ext('onRequest', async (request: Request, h: ResponseToolkit) => {
        request.container = new Container(prisma);
        return h.continue;
    });
}