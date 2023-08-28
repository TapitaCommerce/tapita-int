import { json, redirect } from "@remix-run/node";
import { useActionData, useLoaderData, useNavigate, useSubmit } from "@remix-run/react";
import { SearchMinor, MetafieldsMinor, DiscountsFilledMinor, MagicMinor, StoreDetailsMinor } from '@shopify/polaris-icons';
import { ActionList, Button, Card, Form, FormLayout, IndexTable, Layout, LegacyCard, Page, Popover, Text, TextField, VerticalStack } from "@shopify/polaris";
import indexStyles from "./_index/style.css";
import { useEffect, useState } from "react";
import StoreServer from "~/server/store.server";
import AuthServer, { logout, requireUserId } from "~/server/auth.server";
import AdminServer from "~/server/admin.server";
import { gql, useMutation, useQuery } from "@apollo/client";

export const links = () => [{ rel: "stylesheet", href: indexStyles }];

const CREATE_ADMIN = gql`
    mutation CreateAdmin($input: CreateAdminInput) {
        createAdmin(input: $input) {
            id
            username
            email
        }
    }
`;

export async function loader({ request, params }) {
    return null;
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
    const [admin, setAdmin] = useState(null);
    const navigate = useNavigate();
    
    const [formState, setFormState] = useState({
        username: '',
        email: '',
        password: '',
        confirmedPassword: ''
    });

    const [createAdmin, { loading, error, data }] = useMutation(CREATE_ADMIN);

    const handleSave = async () => {
        const response = await createAdmin({ variables: {
            input: formState
        } });

        console.log(response);
        if(response?.data?.createAdmin) {
            navigate('/admin/management');
        }
    }

    return (
        <Page
            backAction={{content: 'Settings', url: '/admin/management'}} 
            title={admin ? "Update admin information" : "Create new admin"}
            primaryAction={
                <Button
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
                            {/* {
                                typeof error === "string" ? (
                                    <p style={{textAlign: 'center', color: 'red'}}>{error}</p>
                                ) : null
                            } */}
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
                            </VerticalStack>
                        </Card>
                    </VerticalStack>
                </Layout.Section>
            </Layout>
        </Page>
    )
}