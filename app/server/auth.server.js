import bcrypt from "bcryptjs";
import AdminService from "./admin.server";
import { getInfoData } from "~/utils";
import { createCookieSessionStorage, redirect } from "@remix-run/node";
import { COOKIE_NAME } from "~/constants/string.constant";

const SECRET_KEY = process.env.SECRET_KEY;

if(!SECRET_KEY) {
    throw new Error("SESSION_SECRET is not set");
}

export const storage = createCookieSessionStorage({
    cookie: {
        name: COOKIE_NAME,
        secure: process.env.NODE_ENV === 'production',
        secrets: [SECRET_KEY],
        sameSite: 'lax',
        path: '/',
        maxAge: 24 * 60 * 60,
        httpOnly: true,
    },
});

export const createUserSession = async (userId, redirectTo) => {
    const session = await storage.getSession();
    session.set('userId', userId);
    return redirect(redirectTo, {
        headers: {
            "Set-Cookie": await storage.commitSession(session),
        }
    })
}

export const requireUserId = async (request, redirectTo) => {
    const session = await getUserSession(request);
    const userId = session.get("userId");
    if(!userId) {
        const searchParams = new URLSearchParams([["redirectTo", redirectTo]]);
        throw redirect(`/?${searchParams}`);
    }
    return userId;
}

const getUserSession = (request) => {
    return storage.getSession(request.headers.get("Cookie"));
} 

class AuthServer {
    static async signup(payload) {
        const { username, password, email } = payload;
        const hashedPassword = await bcrypt.hash(password, 10);

        const existedAdmin = await AdminService.getAdmin({ filter: {
            username: username
        } });

        if(existedAdmin) {
            return {
                error: 'Username is existed'
            }
        }

        const newAdmin = await AdminService.createAdmin({ username, password: hashedPassword, email });
        return getInfoData({ fields: [ 'username', 'email' ], object: newAdmin });
    }

    static async login({ username, password }) {
        const existedAdmin = await AdminService.getAdmin({ filter: {
            username: username,
        } });

        if(!existedAdmin) {
            return {
                error: 'Username is not existed'
            };
        }

        const isCorrectPassword = await bcrypt.compare(password, existedAdmin.password);
        if(!isCorrectPassword) {
            return {
                error: 'Password is incorrect'
            };
        }

        return createUserSession(existedAdmin._id, '/admin');
    }
}

export default AuthServer;