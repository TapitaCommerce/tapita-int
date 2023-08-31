import lodash from "lodash";

export const getInfoData = ({ fields = [], object = {} }) => {
    return lodash.pick(object, fields);
};

export const truncate = (str) => {
    const n = 25;
    return str.length > n ? str.substr(0, n - 1) + "…" : str;
}