import { useLoaderData, useNavigate, useSubmit } from "@remix-run/react";
import { ActionList, Button, IndexTable, LegacyCard, LegacyStack, Modal, Page, Popover, Spinner, Text, TextContainer } from "@shopify/polaris";
import { StoreDetailsMinor, DeleteMinor } from "@shopify/polaris-icons";
import { logout, requireUserId } from "~/server/auth.server";
import indexStyles from "./_index/style.css";
import AdminServer from "~/server/admin.server";
import { json, redirect } from "@remix-run/node";
import { useCallback, useState } from "react";
import { useMutation, useQuery } from "@apollo/client";
import { GET_ALL_ADMINS } from "~/graphql/query";
import { DELETE_ADMIN } from "~/graphql/mutation";

export const links = () => [{ rel: "stylesheet", href: indexStyles }];

export default function AdminManagement() {
    const submit = useSubmit();
    const [selectedAdminId, setSelectedAdminId] = useState(null);
    const [modalActive, setModalActive] = useState(false);
    const navigate = useNavigate();
    const [error, setError] = useState(null);

    const { loading: getAllAdminsLoading, error: getAllAdminsError, data: getAllAdminsData } = useQuery(GET_ALL_ADMINS);
    
    const [deleteAdmin, { loading: deleteAdminLoading, error: deleteAdminError, data: deleteAdminData }] = useMutation(DELETE_ADMIN);

    const toggleModal = useCallback(() => setModalActive((modalActive) => !modalActive), []);

    const handlePopoverOpen = (adminId) => {
        setSelectedAdminId(adminId);
    }

    const handlePopoverClose = () => {
        setSelectedAdminId(null);
    }

    const handleDeleteAdmin = async () => {
        try {
            await deleteAdmin({ variables: {
                input: {
                    id: selectedAdminId
                }
            } })

            window.location.reload();
        } catch (err) {
            setError(err);
        }
    }

    const resourceName = {
        singular: 'admin',
        plural: 'admins',
    };

    let rowMarkup;

    if(getAllAdminsData) {
        rowMarkup = getAllAdminsData?.getAllAdmins.map(
            ( admin, index ) => (
              <IndexTable.Row
                id={admin.id}
                key={admin.id}
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
                        active={selectedAdminId === admin.id}
                        activator={
                            <Button onClick={() => handlePopoverOpen(admin.id)}>
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
                                            onAction: () => navigate(`/admin/${admin.id}`)
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
    } else if (getAllAdminsLoading) {
        rowMarkup = (
            <Spinner />
        );
    } else if (getAllAdminsError) {
        rowMarkup = (
            <p>{getAllAdminsError.message}</p>
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
            {
                error ? (<p>{error.message}</p>) : null
            }
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
                    itemCount={getAllAdminsData?.getAllAdmins.length || 0}
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