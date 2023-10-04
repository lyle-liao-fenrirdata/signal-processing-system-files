/**
 * Instantiates a single instance PrismaClient and save it on the global object.
 * @link https://www.prisma.io/docs/support/help-articles/nextjs-prisma-client-dev-practices
 */

// https://stackoverflow.com/questions/73570090/prisma-mongodb-replica-set
/**
 * Pull the image with docker pull prismagraphql/mongo-single-replica:5.0.3
 * Run the image with
 * docker run --name mongo \
 *      -p 27017:27017 \
 *      -e MONGO_INITDB_ROOT_USERNAME="root" \
 *      -e MONGO_INITDB_ROOT_PASSWORD="root" \
 *      -d prismagraphql/mongo-single-replica:5.0.3
 */
import { env } from '@/env.mjs';
import { PrismaClient } from '@prisma/client';

const prismaGlobal = global as typeof global & {
    prisma?: PrismaClient;
};

export const prisma: PrismaClient =
    prismaGlobal.prisma ??
    new PrismaClient({
        log:
            env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    });

if (env.NODE_ENV !== 'production') {
    prismaGlobal.prisma = prisma;
}