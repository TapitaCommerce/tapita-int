import { Link } from "@remix-run/react";
import React from "react";
import {
    AppProvider as PolarisAppProvider,
} from "@shopify/polaris";

export default function CustomPolarisAppProvider({ children }) {
    return (
        <PolarisAppProvider i18n={require('@shopify/polaris/locales/en.json')} linkComponent={RemixPolarisLink}>
            {children}
        </PolarisAppProvider>
    )
}

/** @type {any} */
const RemixPolarisLink = React.forwardRef((/** @type {any} */ props, ref) => (
    <Link {...props} to={props.url ?? props.to} ref={ref}>
      {props.children}
    </Link>
));