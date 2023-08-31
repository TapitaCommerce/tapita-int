import express from "express";
import cors from "cors";
import { graphqlHTTP } from "express-graphql"
import { schema } from "./schema.server";
import { getUserFromToken, resolver } from "./resolver.server";
import { applyMiddleware } from "graphql-middleware";
import { permissions } from "./permissions.server";

export default function GraphQLServer() {
    const app = express();
    app.use(cors());
    app.use(express.json());

    const schemaWithMiddlewares = applyMiddleware(schema, permissions);

    app.use('/graphql', graphqlHTTP((req) => ({
        schema: schemaWithMiddlewares,
        context: async () => {
            const authorizationHeader = req.headers.authorization || '';
            // const token = authorizationHeader.split(' ')[1];
            const user = await getUserFromToken(authorizationHeader);
            return { user };
        },
        rootValue: resolver,
        graphiql: true,
    })))
    app.listen(4000, () => {
        console.log('Server is running on PORT 4000');
    });
}