import { json, redirect } from "@remix-run/node";
import { useActionData, useLoaderData, useNavigate, useSubmit } from "@remix-run/react";
import { SearchMinor, MetafieldsMinor, DiscountsFilledMinor, MagicMinor, StoreDetailsMinor } from '@shopify/polaris-icons';
import { ActionList, Button, Card, Form, FormLayout, IndexTable, Layout, LegacyCard, Page, Popover, Text, TextField, VerticalStack } from "@shopify/polaris";
import indexStyles from "./_index/style.css";
import { useState } from "react";
import StoreServer from "~/server/store.server";
import AuthServer, { logout, requireUserId } from "~/server/auth.server";
import AdminServer from "~/server/admin.server";

export const links = () => [{ rel: "stylesheet", href: indexStyles }];

export async function loader({ request, params }) {
    // await requireUserId(request, '/');
    let admin = null;
    
    if(params.id !== 'new') {
        admin = await AdminServer.getAdmin({ filter: {
            _id: params.id
        } });
    }
    console.log("NGUYEN HONG SON admin: ", admin);
    return json({ admin });
}

export async function action({ request, params }) {
    if(request.method === "POST") {
        const data = {
            ...Object.fromEntries(await request.formData()),
        };

        // HANDLE LOGOUT
        if(data._action === 'logout') {
            return logout(request);
        }
        // FINISH HANDLE LOGOUT


        // HANDLE CREATE OR UPDATE ADMIN
        const { id } = params;
        if(id === "new") {
            const newAdmin = await AuthServer.signup(data);
            if(newAdmin.error) {
                return {
                    error: newAdmin.error
                }
            }
            return redirect('/admin/management');
        } else {
            const updatedAdmin = await AdminServer.updateAdmin({ id, payload: data });
            if(updatedAdmin && updatedAdmin.error) {
                return {
                    error: updatedAdmin.error
                }
            }   
            return redirect('/admin/management');
        }
    }
    return null;
}

export default function Admin() {
    const submit = useSubmit();
    const { admin } = useLoaderData();
    const error = useActionData()?.error || {};

    const [formState, setFormState] = useState(admin ? admin : {
        username: '',
        email: '',
        password: '',
        confirmedPassword: ''
    }); // The state is copied from useLoaderData into React state
    const [cleanFormState, setCleanFormState] = useState(admin ? admin : {
        username: '',
        email: '',
        password: '',
        confirmedPassword: ''
    });   // Initial state of form

    const isDirty = JSON.stringify(formState) !== JSON.stringify(cleanFormState);   // check if the form has changed

    const handleSave = async () => {
        const data = {
            username: formState.username,
            email: formState.email,
            password: formState?.password || "",
            confirmedPassword: formState?.confirmedPassword || "",
        }

        setCleanFormState({ ...formState });
        submit(data, { method: "POST" });
    }

    return (
        <Page
            backAction={{content: 'Settings', url: '/admin/management'}} 
            title={admin ? "Update admin information" : "Create new admin"}
            primaryAction={
                <Button
                    disabled = {isDirty ? false : true}
                    primary
                    onClick={handleSave}
                >
                  Save
                </Button>
            }
        >
            <Layout>
                <Layout.Section>
                    <VerticalStack gap="5">
                        <Card>
                            {
                                typeof error === "string" ? (
                                    <p style={{textAlign: 'center', color: 'red'}}>{error}</p>
                                ) : null
                            }
                            <VerticalStack gap="5">
                                <TextField
                                    label="Username"
                                    value={formState?.username ?? ''}
                                    type="text"
                                    onChange={(username) => setFormState({ ...formState, username })}
                                    autoComplete="text"
                                />

                                <TextField
                                    label="Email"
                                    value={formState?.email ?? ''}
                                    onChange={(email) => setFormState({ ...formState, email })}
                                    type="text"
                                    autoComplete="text"
                                />

                                {
                                    !admin && (
                                        <>
                                            <TextField
                                                label="Password"
                                                value={formState?.password ?? ''}
                                                type="password"
                                                onChange={(password) => setFormState({ ...formState, password })}
                                                autoComplete="password"
                                            />
                                            <TextField
                                                label="Confirm password"
                                                value={formState?.confirmedPassword ?? ''}
                                                type="password"
                                                onChange={(confirmedPassword) => setFormState({ ...formState, confirmedPassword })}
                                                autoComplete="password"
                                            />
                                        </>
                                    )
                                }
                            </VerticalStack>
                        </Card>
                    </VerticalStack>
                </Layout.Section>
            </Layout>
        </Page>
    )
}