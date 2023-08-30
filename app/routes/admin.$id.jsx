import { json, redirect } from "@remix-run/node";
import { useActionData, useLoaderData, useNavigate, useSubmit } from "@remix-run/react";
import { SearchMinor, MetafieldsMinor, DiscountsFilledMinor, MagicMinor, StoreDetailsMinor } from '@shopify/polaris-icons';
import { ActionList, Button, Card, Form, FormLayout, IndexTable, Layout, LegacyCard, Page, Popover, Spinner, Text, TextField, VerticalStack } from "@shopify/polaris";
import indexStyles from "./_index/style.css";
import { useEffect, useState } from "react";
import AdminServer from "~/server/admin.server";
import { gql, useMutation, useQuery } from "@apollo/client";
import { GET_ADMIN } from "~/graphql/query";
import { UPDATE_ADMIN } from "~/graphql/mutation";

export const links = () => [{ rel: "stylesheet", href: indexStyles }];

export async function loader({ request, params }) {
    return json({ id: params.id });
}

export default function Admin() {
    const submit = useSubmit();
    const [admin, setAdmin] = useState(null);
    const navigate = useNavigate();
    const { id } = useLoaderData();
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    // const error = useActionData()?.error || {};

    const { loading: getAdminLoading, error: getAdminError, data: getAdminData } = useQuery(GET_ADMIN, {
        variables: {
            input: {
                id: id
            }
        }
    }); 

    const [updateAdmin, { loading: updatedAdminLoading, error: updatedAdminError, data: updatedAdminData }] = useMutation(UPDATE_ADMIN);

    const [formState, setFormState] = useState(getAdminData?.getAdmin ? getAdminData?.getAdmin : {
        username: '',
        email: '',
    }); // The state is copied from useLoaderData into React state
    const [cleanFormState, setCleanFormState] = useState(getAdminData?.getAdmin ? getAdminData?.getAdmin : {
        username: '',
        email: '',
    });   // Initial state of form

    const isDirty = JSON.stringify(formState) !== JSON.stringify(cleanFormState);   // check if the form has changed

    const handleSave = async () => {
        try {
            setIsLoading(true);
            const response = await updateAdmin({ variables: {
                input: {
                    id: id,
                    username: formState?.username,
                    email: formState?.email
                }
            } });
            setIsLoading(false);
            navigate('/admin/management');
        } catch (err) {
            setError(err);
            setIsLoading(false);
        }
    }

    useEffect(() => {
        setFormState(getAdminData?.getAdmin);
        setCleanFormState(getAdminData?.getAdmin);
    }, [getAdminData]); 

    let AdminInformation;

    if(getAdminData?.getAdmin) {
        AdminInformation = (
            <>
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
            </>
        )
    } else {
        AdminInformation = <p style={{ textAlign: 'center' }}><Spinner /></p>
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
                    loading={isLoading}
                >
                  Save
                </Button>
            }
        >   
            {
                error ? (<p>{error.message}</p>) : null
            }
            <Layout>
                <Layout.Section>
                    <VerticalStack gap="5">
                        <Card>
                            {
                                getAdminError ? <p>{getAdminError.message}</p> : null
                            }
                            <VerticalStack gap="5">
                                {AdminInformation}
                            </VerticalStack>
                        </Card>
                    </VerticalStack>
                </Layout.Section>
            </Layout>
        </Page>
    )
}