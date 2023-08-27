import { json, redirect } from "@remix-run/node";
import { Form, useActionData, useLoaderData, useNavigate, useSubmit } from "@remix-run/react";

import { login } from "../../shopify.server";

import indexStyles from "./style.css";
import {
  AppProvider as PolarisAppProvider,
  Button, 
  Page, 
  FormLayout,
  TextField,
  Card
} from "@shopify/polaris";
import CustomPolarisAppProvider from "~/components/CustomPolarisAppProvider";
import { useState } from "react";
import AuthServer, { getUser } from "~/server/auth.server";
import { useQuery, gql, useMutation } from '@apollo/client';

export const links = () => [{ rel: "stylesheet", href: indexStyles }];

const GET_ALL_STORES = gql`
  query GetAllStores {
    getAllStores {
      id
      name
      email
    }
  }
`;

const LOGIN_MUTATION = gql`
  mutation Login($input: LoginInput) {
    login(input: $input)
  }
`;

export async function loader({ request }) {
  const url = new URL(request.url);
  if (url.searchParams.get("shop")) {
    throw redirect(`/app?${url.searchParams.toString()}`);
  }

  const user = await getUser(request);
  if(user) {
    return redirect('/admin');
  }
  
  return null;
}

export async function action({ request }) {
  if(request.method === "POST") {
    const data = {
      ...Object.fromEntries(await request.formData()),
    };
    return await AuthServer.login({ username: data.username, password: data.password });
  }

  return null;
}

export default function App() {
  // const error = useActionData()?.error || {};
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const submit = useSubmit();
  const navigate = useNavigate();

  const [login, { data, loading, error }] = useMutation(LOGIN_MUTATION);

  if (loading) return 'Submitting...';

  if (error) return `Submission error! ${error.message}`;

  // const handleLogin = () => {
  //   submit({
  //     username: username,
  //     password: password,
  //   }, {
  //     method: "POST"
  //   });
  // }

  const handleLogin = async () => {
    const response = await login({ variables: {
      input: {
        username, 
        password,
      }
    } })

    if (loading) {
      console.log('Logging in ... ');
    } else if (error) {
      console.log(error.message)
    } else {
      console.log(typeof response?.data?.login); 
  
      // if(response?.data?.login) {
        localStorage.removeItem('accessToken');
        localStorage.setItem('accessToken', response?.data?.login);
        navigate('/admin');
      // }
    }
  }

  // const { loading, error, data } = useQuery(GET_ALL_STORES);
  // console.log(loading);
  // console.log(error);
  // console.log(data);

  return (
    <CustomPolarisAppProvider>
      <div className="center-form">
        <Page>
          <Card>
            {
              typeof error === "string" ? (
                <p style={{textAlign: 'center', color: 'red'}}>{error}</p>
              ) : null
            }
            <FormLayout>
              <TextField label="Username" value={username} onChange={(e) => setUsername(e)} autoComplete="off" />
              <TextField
                type="password"
                value={password}
                label="Password"
                onChange={(e) => setPassword(e)}
                autoComplete="off"
              />
              <Button onClick={handleLogin}>
                Login
              </Button>
            </FormLayout>
          </Card>
        </Page>
      </div>
    </CustomPolarisAppProvider>
  )
}