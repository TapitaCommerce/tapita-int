import { rule, shield } from "graphql-shield";

const isAdminAuthenticated = rule()(async (parent, args, ctx) => {
    const context = await ctx();
    const user = context.user;
    return user != null;
});

const isMerchantAuthenticated = rule()(async (parent, args, ctx) => {
    return true;
})

export const permissions = shield({
    Query: {
        getAllStores: isAdminAuthenticated,
        getStore: isAdminAuthenticated,
        getAllAdmins: isAdminAuthenticated,
        getAdmin: isAdminAuthenticated,
    },
    Mutation: {
        createAdmin: isAdminAuthenticated,
        updateAdmin: isAdminAuthenticated,
        deleteAdmin: isAdminAuthenticated,
    }
})