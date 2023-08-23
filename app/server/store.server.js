import StoreModel from "~/models/store.model";

class StoreServer {
    static async getAllStores({ limit, page, filter }) {
        const skip = (page - 1) * limit;
        
        const stores = await StoreModel.find(filter)
            .skip(skip)
            .limit(limit)
            .lean();

        return stores;
    }

    static async getStore({ store_id }) {
        const store = await StoreModel.findOne({
            id: store_id,
        });
        return store;
    }
}

export default StoreServer;