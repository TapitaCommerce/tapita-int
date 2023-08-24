import { json, redirect } from "@remix-run/node";
import { Outlet, useLoaderData, useNavigate, useSubmit } from "@remix-run/react";
import { SearchMinor, MetafieldsMinor, DiscountsFilledMinor, MagicMinor, StoreDetailsMinor } from '@shopify/polaris-icons';
import { ActionList, Button, IndexTable, LegacyCard, Page, Popover, Text, useIndexResourceState } from "@shopify/polaris";
import CustomPolarisAppProvider from "~/components/CustomPolarisAppProvider";
import indexStyles from "./_index/style.css";
import { useCallback, useState } from "react";
import StoreServer from "~/server/store.server";
import { logout, requireUserId } from "~/server/auth.server";
import DefaultLayout from "~/components/layout/DefaultLayout";
import { handleLogout } from "~/utils/auth.util";

export const links = () => [{ rel: "stylesheet", href: indexStyles }];

export async function loader({ request }) {
    await requireUserId(request, '/');

    return null;
}

export async function action({ request }) {
    if(request.method === "POST") {
        const data = {
            ...Object.fromEntries(await request.formData()),
        };
        if(data._action === 'logout') {
            return logout(request);
        }
    }
    return null;
}

export default function Admin() {
    const submit = useSubmit();

    return (
        <CustomPolarisAppProvider>
            <DefaultLayout handleLogout={() => handleLogout(submit)}>
                <Outlet />
            </DefaultLayout>
        </CustomPolarisAppProvider>
    )
}