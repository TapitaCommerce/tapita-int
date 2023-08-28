import "@shopify/shopify-app-remix/adapters/node";
import {
  AppDistribution,
  DeliveryMethod,
  shopifyApp,
  LATEST_API_VERSION,
} from "@shopify/shopify-app-remix";
import { PrismaSessionStorage } from "@shopify/shopify-app-session-storage-prisma";
import { restResources } from "@shopify/shopify-api/rest/admin/2023-07";
import mongoose from "mongoose";
import prisma from "./db.server";
import AdminModel from "./models/admin.model";
import StoreModel from "./models/store.model";
import express from "express"
import { graphqlHTTP } from "express-graphql"
import { buildSchema } from "graphql"
import cors from "cors";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { redirect } from "@remix-run/node";

const shopify = shopifyApp({
  apiKey: process.env.SHOPIFY_API_KEY,
  apiSecretKey: process.env.SHOPIFY_API_SECRET || "",
  apiVersion: LATEST_API_VERSION,
  scopes: process.env.SCOPES?.split(","),
  appUrl: process.env.SHOPIFY_APP_URL || "",
  authPathPrefix: "/auth",
  sessionStorage: new PrismaSessionStorage(prisma),
  distribution: AppDistribution.AppStore,
  restResources,
  webhooks: {
    APP_UNINSTALLED: {
      deliveryMethod: DeliveryMethod.Http,
      callbackUrl: "/webhooks",
    },
  },
  hooks: {
    afterAuth: async ({ session }) => {
      shopify.registerWebhooks({ session });
    },
  },
  ...(process.env.SHOP_CUSTOM_DOMAIN
    ? { customShopDomains: [process.env.SHOP_CUSTOM_DOMAIN] }
    : {}),
});

// Construct a schema, using GraphQL schema language
var schema = buildSchema(`
  input LoginInput {
    username: String
    password: String
  }

  input GetStoreInput {
    id: String
  }

  input GetAdminInput {
    id: String
  }

  input CreateAdminInput {
    username: String
    password: String
    confirmedPassword: String
    email: String
  }
  input UpdateAdminInput {
    id: String
    username: String
    email: String
  }

  input DeleteAdminInput {
    id: String
  }

  type Store {
    id: String,
    name: String,
    email: String,
    shop: String,
    domain: String,
    scope: String,
    country: String,
    customer_email: String,
    myshopify_domain: String,
    plan_name: String,
    plan_display_name: String,
    shop_owner: String,
    iana_timezone: String,
    currency: String,
    address1: String,
    address2: String,
    phone: String,
    created_at: String,
    accessToken: String
  }

  type Admin {
    id: String,
    username: String,
    password: String,
    email: String
  }

  type Query {
    hello: String
    getAllStores: [Store]
    getStore(input: GetStoreInput): Store
    getAllAdmins: [Admin]
    getAdmin(input: GetAdminInput): Admin
  }
  
  type Mutation {
    login(input: LoginInput): String
    createAdmin(input: CreateAdminInput): Admin
    updateAdmin(input: UpdateAdminInput): Admin
    deleteAdmin(input: DeleteAdminInput): Admin
  }
`)

// The root provides a resolver function for each API endpoint
var root = {
  hello: () => {
    return "Hello world!"
  },
  getStore: async (args, request) => {
    const bearerToken = request.headers.authorization;
    if(!bearerToken) {
      console.log(123);
      throw new Error('Not authenticated')
    } else {
      const token = bearerToken.split(' ')[1];
      const decoded = await jwt.verify(token, process.env.SECRET_KEY);
      console.log('DECODED: ', decoded);
      if(!decoded) {
        throw new Error('Not authenticated')
      }
    }
    console.log(args);
    const store = await StoreModel.findOne({ id: args.input.id });
    return store;
  },
  getAllStores: async (args, request) => {
    // console.log('args', args);
    const bearerToken = request.headers.authorization;
    if(!bearerToken) {
      console.log(123);
      throw new Error('Not authenticated')
    } else {
      const token = bearerToken.split(' ')[1];
      const decoded = await jwt.verify(token, process.env.SECRET_KEY);
      console.log('DECODED: ', decoded);
      if(!decoded) {
        throw new Error('Not authenticated')
      }
    }
    const stores = await StoreModel.find({});
    return stores;
  },
  getAdmin: async (args, request) => {
    const bearerToken = request.headers.authorization;
    if(!bearerToken) {
      console.log(123);
      throw new Error('Not authenticated')
    } else {
      const token = bearerToken.split(' ')[1];
      const decoded = await jwt.verify(token, process.env.SECRET_KEY);
      console.log('DECODED: ', decoded);
      if(!decoded) {
        throw new Error('Not authenticated')
      }
    }
    console.log(args);
    const admin = await AdminModel.findOne({ _id: args.input.id });
    console.log(admin)
    return admin;
  },
  getAllAdmins: async (args, request) => {
    const bearerToken = request.headers.authorization;
    if(!bearerToken) {
      console.log(123);
      throw new Error('Not authenticated')
    } else {
      const token = bearerToken.split(' ')[1];
      const decoded = await jwt.verify(token, process.env.SECRET_KEY);
      console.log('DECODED: ', decoded);
      if(!decoded) {
        throw new Error('Not authenticated')
      }
    }
    const admins = await AdminModel.find({});
    return admins;
  },
  login: async ({ input }, request) => {
    const { username, password } = input;
    // console.log(username);
    // console.log(password);

    const existedAdmin = await AdminModel.findOne({ username: username });
    if(!existedAdmin) {
      throw new Error('Username is not existed');
    }

    const isValidPassword = await bcrypt.compare(password, existedAdmin.password);

    if(!isValidPassword) {
      throw new Error('Wrong password');
    }

    const payload = {
      userId: existedAdmin._id,
    }

    const accessToken = await jwt.sign(payload, process.env.SECRET_KEY, {
      expiresIn: '24h',
    })

    return accessToken;
  },
  createAdmin: async ({ input }, request) => {
    const bearerToken = request.headers.authorization;
    if(!bearerToken) {
      console.log(123);
      throw new Error('Not authenticated')
    } else {
      const token = bearerToken.split(' ')[1];
      const decoded = await jwt.verify(token, process.env.SECRET_KEY);
      console.log('DECODED: ', decoded);
      if(!decoded) {
        throw new Error('Not authenticated')
      }
    }

    const { username, password, confirmedPassword, email } = input;
    if(password !== confirmedPassword) {
      throw new Error('Password and confirmed password must be matched');
    }

    const existed = await AdminModel.findOne({ username: username });
    if(existed) {
        throw new Error('Username has already been registed');
    }
    const hashedPassword = await bcrypt.hash(password, 10);

    const newAdmin = await AdminModel.create({ username, password: hashedPassword, email });
    return newAdmin;
  },
  updateAdmin: async ({ input }, request) => {
    const bearerToken = request.headers.authorization;
    if(!bearerToken) {
      console.log(123);
      throw new Error('Not authenticated')
    } else {
      const token = bearerToken.split(' ')[1];
      const decoded = await jwt.verify(token, process.env.SECRET_KEY);
      console.log('DECODED: ', decoded);
      if(!decoded) {
        throw new Error('Not authenticated')
      }
    }
    console.log(123);
    const updatedAdmin = await AdminModel.findByIdAndUpdate(new mongoose.Types.ObjectId(input.id), {
      username: input.username,
      email: input.email
    });
    return updatedAdmin;
  },
  deleteAdmin: async ({ input }, request) => {
    const bearerToken = request.headers.authorization;
    if(!bearerToken) {
      console.log(123);
      throw new Error('Not authenticated')
    } else {
      const token = bearerToken.split(' ')[1];
      const decoded = await jwt.verify(token, process.env.SECRET_KEY);
      console.log('DECODED: ', decoded);
      if(!decoded) {
        throw new Error('Not authenticated')
      }
    }
    console.log(input)
    const deletedAdmin = await AdminModel.findByIdAndDelete(new mongoose.Types.ObjectId(input.id));
    return deletedAdmin;
  }
}

const app = express();
app.use(express.json());
app.use(cors());

const loggingMiddleware = (req, res, next) => {
  console.log('HEADER: ', req.headers);
  next();
}
app.use(loggingMiddleware);
app.use('/graphql', graphqlHTTP({
  schema: schema,
  rootValue: root,
  graphiql: true,
}))

const dbConnectionString = 'mongodb://localhost:27017/tapita_training';
mongoose.set('debug', true);
mongoose.set('debug', { color: true });
mongoose.connect(dbConnectionString).then(result => {
  console.log('Connect to mongodb successfully');
  app.listen(4000, () => {
    console.log('Server is running at port 4000');
  })
}).catch(err => {
  console.log('Error occured when connect to mongodb: ', err.message);
});

// setTimeout(async () => {
//   const username = "admin";
//   const password = await bcrypt.hash("admin", 10);
//   const email = "sonnguyenhong291@gmail.com";
//   await adminModel.create({ username, password, email });
// }, 500)

export default shopify;
export const apiVersion = LATEST_API_VERSION;
export const addDocumentResponseHeaders = shopify.addDocumentResponseHeaders;
export const authenticate = shopify.authenticate;
export const login = shopify.login;
export const registerWebhooks = shopify.registerWebhooks;
export const sessionStorage = shopify.sessionStorage;
