import AdminModel from "~/models/admin.model";

class AdminServer {
    static async createAdmin({ username, password, email }) {
        const newAdmin = await AdminModel.create({ username, password, email });
        return newAdmin;
    }

    static async getAdmin({ filter }) {
        const admin = await AdminModel.findOne(filter);
        return admin;
    }
}

export default AdminServer;