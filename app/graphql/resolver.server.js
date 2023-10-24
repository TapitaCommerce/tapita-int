const AdminModel = require("../models/admin.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const StoreModel = require("../models/store.model");
const mongoose = require("mongoose");

const verifyToken = async (bearerToken) => {
    if(!bearerToken) {
        throw new Error('You have to provide bearer token on the request headers');
    } else {
        const token = bearerToken.split(' ')[1];
        const decoded = await jwt.verify(token, process.env.SECRET_KEY);
        console.log('DECODED: ', decoded);
        if(!decoded) {
            throw new Error('Invalid access token');
        }
        return true;
    }
}

const resolver = {
    hello: () => {
        return "Hello World";
    },
    getAllStores: async (args, request) => {
        const bearerToken = request.headers.authorization;
        const isAuthenticated = await verifyToken(bearerToken);
        if(isAuthenticated) {
            const stores = await StoreModel.find({});
            return stores;
        } else {
            throw new Error('Authentication Error');
        }
    },
    getAllAdmins: async (args, request) => {
        const bearerToken = request.headers.authorization;
        const isAuthenticated = await verifyToken(bearerToken);
        if(isAuthenticated) {
            const admins = await AdminModel.find({});
            return admins;
        } else {
            throw new Error('Authentication Error');
        }
    },
    getStore: async ({ input }, request) => {
        const bearerToken = request.headers.authorization;
        const isAuthenticated = await verifyToken(bearerToken);
        if(isAuthenticated) {
            const store = await StoreModel.findOne({ id: input.id });
            return store;
        } else {
            throw new Error('Authentication Error');
        }
    },
    getAdmin: async ({ input }, request) => {
        const bearerToken = request.headers.authorization;
        const isAuthenticated = await verifyToken(bearerToken);
        if(isAuthenticated) {
            const admin = await AdminModel.findOne({ _id: input.id });
            return admin;
        } else {
            throw new Error('Authentication Error');
        }
    },
    login: async ({ input }, request) => {
        const { username, password } = input;
    
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
    installedApp: async(args, request) => {
        const { session } = await authenticate.admin(request);
        let shop;
        const config = {
            headers: {
                "X-Shopify-Access-Token": session.accessToken,
                "Accept-Encoding": "application/json",
            },
        };
        shop = await axios.get(
            `https://${session.shop}/admin/api/2023-07/shop.json`,
            config
        );
        shop = shop.data.shop;
        const shopData = await StoreModel.findOneAndUpdate(
        {
            id: shop.id
        }, 
        {
            id: shop.id,
            name: shop.name,
            email: shop.email,
            shop: shop.name,
            domain: shop.domain,
            scope: session.scope,
            country: shop.country_name,
            customer_email: shop.customer_email,
            myshopify_domain: shop.myshopify_domain,
            plan_name: shop.plan_name,
            plan_display_name: shop.plan_display_name,
            shop_owner: shop.shop_owner,
            iana_timezone: shop.iana_timezone,
            currency: shop.currency,
            address1: shop.address1 || "NULL",
            address2: shop.address2 || "NULL",
            phone: shop.phone || "NULL",
            created_at: shop.created_at,
            accessToken: session.accessToken,
        }, 
        {
            upsert: true,
        });
        
        return json({ shop: shopData });
    },
    updateAdmin: async ({ input }, request) => {
        const bearerToken = request.headers.authorization;
        const isAuthenticated = await verifyToken(bearerToken);
        if(isAuthenticated) {
            const updatedAdmin = await AdminModel.findByIdAndUpdate(new mongoose.Types.ObjectId(input.id), {
              username: input.username,
              email: input.email
            });
            return updatedAdmin;
        } else {
            throw new Error('Authentication Error');
        }
    },
    createAdmin: async ({ input }, request) => {
        const bearerToken = request.headers.authorization;
        const isAuthenticated = await verifyToken(bearerToken);
        if(isAuthenticated) {
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
        } else {
            throw new Error('Authentication Error');
        }
    },
    deleteAdmin: async ({ input }, request) => {
        const bearerToken = request.headers.authorization;
        const isAuthenticated = await verifyToken(bearerToken);
        if(isAuthenticated) {
            const deletedAdmin = await AdminModel.findByIdAndDelete(new mongoose.Types.ObjectId(input.id));
            return deletedAdmin;
        } else {
            throw new Error('Authentication Error');
        }
    }
}

module.exports = { resolver };