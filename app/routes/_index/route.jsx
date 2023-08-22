import { json, redirect } from "@remix-run/node";
import { Form, useActionData, useLoaderData, useSubmit } from "@remix-run/react";

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

export const links = () => [{ rel: "stylesheet", href: indexStyles }];

export async function loader({ request }) {
  const url = new URL(request.url);
  if (url.searchParams.get("shop")) {
    throw redirect(`/app?${url.searchParams.toString()}`);
  }
  
  return null;
}

export async function action({ request }) {
  const correctUsername = "admin";
  const correctPassword = "admin";
  if(request.method === "POST") {
    const data = {
      ...Object.fromEntries(await request.formData()),
    };

    if(data.username !== correctUsername) {
      return json({ error: 'Incorrect username' });
    } 
    if(data.password !== correctPassword) {
      return json({ error: 'Incorrect password' });
    }
    
    return redirect('/admin');
  }

  return null;
}

export default function App() {
  const error = useActionData()?.error || {};
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const submit = useSubmit();

  const handleLogin = () => {
    submit({
      username: username,
      password: password,
    }, {
      method: "POST"
    });
  }

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