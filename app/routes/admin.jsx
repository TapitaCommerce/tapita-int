import { Outlet, useNavigate } from "@remix-run/react";
import CustomPolarisAppProvider from "~/components/CustomPolarisAppProvider";
import indexStyles from "./_index/style.css";
import DefaultLayout from "~/components/layout/DefaultLayout";
import { LS_ADMIN_AT, LS_MERCHANT_AT } from "~/constants/string.constant";

export const links = () => [{ rel: "stylesheet", href: indexStyles }];

export default function Admin() {
    const navigate = useNavigate();

    const handleLogout = () => {
        window?.localStorageTp.removeItem(LS_ADMIN_AT);
        window?.localStorageTp.removeItem(LS_MERCHANT_AT);
        navigate('/');
    }

    return (
        <CustomPolarisAppProvider>
            <DefaultLayout handleLogout={handleLogout}>
                <Outlet />
            </DefaultLayout>
        </CustomPolarisAppProvider>
    )
}