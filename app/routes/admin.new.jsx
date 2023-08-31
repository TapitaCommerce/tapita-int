import { useNavigate, useSubmit } from "@remix-run/react";
import { Button, Card, Layout, Page, TextField, VerticalStack } from "@shopify/polaris";
import indexStyles from "./_index/style.css";
import { useState } from "react";
import { useMutation } from "@apollo/client";
import { CREATE_ADMIN } from "~/graphql/mutation";

export const links = () => [{ rel: "stylesheet", href: indexStyles }];

export default function Admin() {
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    
    const [formState, setFormState] = useState({
        username: '',
        email: '',
        password: '',
        confirmedPassword: ''
    });

    const [createAdmin, { loading: createAdminLoading, error: createAdminError, data: createAdminData }] = useMutation(CREATE_ADMIN);

    const handleSave = async () => {
        try {
            await createAdmin({ variables: {
                input: formState
            } });
            navigate('/admin/management');
        } catch (err) {
            setError(err);
        }
    }

    return (
        <Page
            backAction={{content: 'Settings', url: '/admin/management'}} 
            title={"Create new admin"}
            primaryAction={
                <Button
                    primary
                    onClick={handleSave}
                    loading={createAdminLoading}
                >
                  Save
                </Button>
            }
        >
            {
                error ? (<p style={{ textAlign: 'center', color: 'red' }}>{error.message}</p>) : null
            }
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