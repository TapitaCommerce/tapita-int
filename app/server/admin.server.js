import AdminModel from "~/models/admin.model";

class AdminServer {
    static async createAdmin({ username, password, email }) {
        const newAdmin = await AdminModel.create({ username, password, email });
        return newAdmin;
    }

    static async updateAdmin({ id, payload }) {
        try {
            const updatedAdmin = await AdminModel.findByIdAndUpdate(id, payload);
            return updatedAdmin;
        } catch (e) {
            return {
                error: 'Error when update admin in admin server',
            };
        }
    }

    static async deleteAdmin({ id }) {
        try {
            const deletedAdmin = await AdminModel.findByIdAndDelete(id);
            return deletedAdmin;
        } catch(e) {
            return {
                error: 'Error when delete admin in admin server',
            }
        }
    }

    static async getAdmin({ filter }) {
        const admin = await AdminModel.findOne(filter);
        return admin;
    }

    static async getAdmins({ limit, page, filter }) {
        const skip = (page - 1) * limit;
        
        const admins = await AdminModel.find(filter)
            .skip(skip)
            .limit(limit)
            .lean();

        return admins;
    }
}

export default AdminServer;