import { BrowserRouter } from "react-router-dom";
import Routes from "./Routes";
import { NavigationMenu } from "@shopify/app-bridge-react";

import {
  AppBridgeProvider,
  QueryProvider,
  PolarisProvider,
  DiscountProvider
} from "./components";


export default function App() {
  // Any .tsx or .jsx files in /pages will become a route
  // See documentation for <Routes /> for more info
  const pages = import.meta.globEager("./pages/**/!(*.test.[jt]sx)*.([jt]sx)");

  return (

    <PolarisProvider>
      <BrowserRouter>
        <AppBridgeProvider>
          <DiscountProvider>
            <QueryProvider>
              <NavigationMenu
                navigationLinks={[
                  {
                    label: "Applications",
                    destination: "/",
                  },
                  {
                    label: "Settings",
                    destination: "/settings",
                  }
                ]}
              />
              <Routes pages={pages} />
            </QueryProvider>
          </DiscountProvider>
        </AppBridgeProvider>
      </BrowserRouter>
    </PolarisProvider>
  );
}
