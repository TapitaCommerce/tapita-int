import lodash from "lodash";

export const getInfoData = ({ fields = [], object = {} }) => {
    return lodash.pick(object, fields);
};
