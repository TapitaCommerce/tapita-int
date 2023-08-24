import { useLoaderData, useNavigate, useSubmit } from "@remix-run/react";
import { ActionList, Button, IndexTable, LegacyCard, LegacyStack, Modal, Page, Popover, Text, TextContainer } from "@shopify/polaris";
import { StoreDetailsMinor, DeleteMinor } from "@shopify/polaris-icons";
import { logout, requireUserId } from "~/server/auth.server";
import indexStyles from "./_index/style.css";
import AdminServer from "~/server/admin.server";
import { json, redirect } from "@remix-run/node";
import { useCallback, useState } from "react";

export const links = () => [{ rel: "stylesheet", href: indexStyles }];

export async function loader({ request }) {
    await requireUserId(request, '/');
    
    const admins = await AdminServer.getAdmins({
        limit: 25,
        page: 1,
        filter: {}
    });

    return json({ admins });
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

export default function AdminManagement() {
    const submit = useSubmit();
    const { admins } = useLoaderData();
    const [selectedAdminId, setSelectedAdminId] = useState(null);
    const [modalActive, setModalActive] = useState(false);
    const navigate = useNavigate();

    const toggleModal = useCallback(() => setModalActive((modalActive) => !modalActive), []);

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

    const rowMarkup = admins.map(
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
                    itemCount={admins.length}
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