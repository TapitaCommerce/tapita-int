import express from "express";
import cors from "cors";
import { graphqlHTTP } from "express-graphql"
import { schema } from "./schema.server";
import { getUserFromToken, resolver } from "./resolver.server";
import { applyMiddleware } from "graphql-middleware";
import { permissions } from "./permissions.server";
import { ADMIN_ACCESS_TOKEN, MERCHANT_ACCESS_TOKEN } from "~/constants/header.constant";

export default function GraphQLServer() {
    const app = express();
    app.use(cors());
    app.use(express.json());

    const schemaWithMiddlewares = applyMiddleware(schema, permissions);

    app.use('/graphql', graphqlHTTP((req) => ({
        schema: schemaWithMiddlewares,
        context: async () => {
            const adminAuthorizationHeader = req.headers[ADMIN_ACCESS_TOKEN] || '';
            const merchantAuthorizationHeader = req.headers[MERCHANT_ACCESS_TOKEN] || null;
            // const token = authorizationHeader.split(' ')[1];
            const user = await getUserFromToken(adminAuthorizationHeader);
            
            return { user, merchantAccessToken: merchantAuthorizationHeader };
        },
        rootValue: resolver,
        graphiql: true,
    })))
    app.listen(4000, () => {
        console.log('Server is running on PORT 4000');
    });
}