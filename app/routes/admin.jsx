import { Outlet, useNavigate } from "@remix-run/react";
import CustomPolarisAppProvider from "~/components/CustomPolarisAppProvider";
import indexStyles from "./_index/style.css";
import DefaultLayout from "~/components/layout/DefaultLayout";

export const links = () => [{ rel: "stylesheet", href: indexStyles }];

export default function Admin() {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('accessToken');
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