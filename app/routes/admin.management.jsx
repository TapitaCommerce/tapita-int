import { useLoaderData, useNavigate, useSubmit } from "@remix-run/react";
import { ActionList, Button, IndexTable, LegacyCard, LegacyStack, Modal, Page, Popover, Text, TextContainer } from "@shopify/polaris";
import { StoreDetailsMinor, DeleteMinor } from "@shopify/polaris-icons";
import { logout, requireUserId } from "~/server/auth.server";
import indexStyles from "./_index/style.css";
import AdminServer from "~/server/admin.server";
import { json, redirect } from "@remix-run/node";
import { useCallback, useEffect, useState } from "react";
import { gql, useQuery } from "@apollo/client";

export const links = () => [{ rel: "stylesheet", href: indexStyles }];

export async function loader({ request }) {
    // await requireUserId(request, '/');
    
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

    if(request.method === "DELETE") {
        const data = {
            ...Object.fromEntries(await request.formData()),
        }
        const deletedAdmin = await AdminServer.deleteAdmin({ id: data.id });
        if(deletedAdmin && deletedAdmin.error) {
            return {
                error: deletedAdmin.error
            }
        }
        
        return redirect('/admin/management');
    }

    return null;
}

const GET_ALL_ADMINS = gql`
  query GetAllAdmins {
    getAllAdmins {
      id
      username
      password
      email
    }
  }
`;

export default function AdminManagement() {
    const submit = useSubmit();
    const [selectedAdminId, setSelectedAdminId] = useState(null);
    const [modalActive, setModalActive] = useState(false);
    const navigate = useNavigate();

    const toggleModal = useCallback(() => setModalActive((modalActive) => !modalActive), []);
    const { loading, error, data } = useQuery(GET_ALL_ADMINS);

    useEffect(() => {
        if(error?.message === 'Not authenticated' || error?.message === 'invalid token') {
            console.log(error.message);
            navigate('/');
        }
    }, [error])
    
    const handlePopoverOpen = (adminId) => {
        setSelectedAdminId(adminId);
    }

    const handlePopoverClose = () => {
        setSelectedAdminId(null);
    }

    const handleDeleteAdmin = async () => {
        submit({ id: selectedAdminId }, { method: "DELETE" });
    }

    const resourceName = {
        singular: 'admin',
        plural: 'admins',
    };

    let rowMarkup;

    if(data) {
        console.log(data?.getAllAdmins);
        rowMarkup = data?.getAllAdmins.map(
            ( admin, index ) => (
              <IndexTable.Row
                id={admin._id}
                key={admin._id}
                position={index}
              >
                <IndexTable.Cell>
                    <Text variant="bodyMd" fontWeight="bold" as="span">
                        {admin.username}
                    </Text>
                </IndexTable.Cell>
                <IndexTable.Cell>{admin.email}</IndexTable.Cell>
                <IndexTable.Cell>
                    <Popover
                        active={selectedAdminId === admin._id}
                        activator={
                            <Button onClick={() => handlePopoverOpen(admin._id)}>
                                Actions
                            </Button>
                        }
                        autofocusTarget="first-node"
                        onClose={handlePopoverClose}
                    >
                        <ActionList
                            sections={[
                                {
                                    items: [
                                        {
                                            content: 'Detail',
                                            icon: StoreDetailsMinor,
                                            onAction: () => navigate(`/admin/${admin._id}`)
                                        },
                                        {
                                            content: 'Delete', 
                                            icon: DeleteMinor,
                                            onAction: () => toggleModal()
                                        },
                                    ],
                                },
                            ]}
                        />
                    </Popover>
                </IndexTable.Cell>
              </IndexTable.Row>
            ),
        );
    } else {
        rowMarkup = (
            <IndexTable.Row
                id={"Loading"}
                position={1}
            >
                Loading
            </IndexTable.Row>
        )
    }


    return (
        <Page 
            title="Admin Management"
            primaryAction={
                <Button
                    primary
                    onClick={() => navigate('/admin/new')}
                >
                    Create new admin
                </Button>
            }
        >
            <Modal
                open={modalActive}
                onClose={toggleModal}
                title="Confirm to delete admin"
                primaryAction={{
                    content: 'Delete',
                    destructive: true,
                    onAction: () => {
                        handleDeleteAdmin();
                        toggleModal();
                    },
                }}
                secondaryActions={[
                    {
                        content: 'Close',
                        onAction: toggleModal,
                    }
                ]}
            >
                <Modal.Section>
                <LegacyStack vertical>
                    <LegacyStack.Item>
                    <TextContainer>
                        <p>
                        If you confirm to delete the admin, the admin account is deleted completely on the server
                        </p>
                    </TextContainer>
                    </LegacyStack.Item>
                </LegacyStack>
                </Modal.Section>
            </Modal>
            <LegacyCard>
                <IndexTable
                    resourceName={resourceName}
                    itemCount={data?.getAllAdmins.length || 0}
                    headings={[
                        {title: 'Username'},
                        {title: 'Email'},
                        {title: 'Actions'},
                    ]}
                    selectable={false}
                >
                    {rowMarkup}
                </IndexTable>
            </LegacyCard>
        </Page>
    )
}