import {
    AppProvider as PolarisAppProvider,
} from "@shopify/polaris";

export default function CustomPolarisAppProvider({ children }) {
    return (
        <PolarisAppProvider i18n={require('@shopify/polaris/locales/en.json')}>
            {children}
        </PolarisAppProvider>
    )
}