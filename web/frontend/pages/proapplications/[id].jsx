import { useParams } from "react-router-dom";
import { useAppQuery } from "../../hooks";

import { LegacyCard, Page, Layout, SkeletonBodyText } from "@shopify/polaris";
import { Loading, TitleBar, useAppBridge} from "@shopify/app-bridge-react";
import { Redirect } from "@shopify/app-bridge/actions";
import { DiscountsForm } from "../../components";
import { ProApplicationForm } from "../../components";
import { Documents } from "../../components";

export default function ProApplicationEdit() {
  const breadcrumbs = [{ content: "Pro Applications", url: "/" }];

  const { id } = useParams();
  const app = useAppBridge();

  const redirect = Redirect.create(app);

  const {
    data: settings,
    isLoading: settingsLoading,
    isRefetching: settingsRefetching,
  } = useAppQuery({
    url: `/api/settings`
  });

  const {
    data: customer,
    isLoading: customerLoading,
    isRefetching: customerRefetching,
    refetch
  } = useAppQuery({
    url: `/api/customers/${id}`
  });

  if (customerLoading || customerRefetching || settingsLoading || settingsRefetching) {
    return (
      <Page>
        <TitleBar
          title="Manage Application"
          breadcrumbs={breadcrumbs}
          primaryAction={null}
        />
        <Loading />
        <Layout>
          <Layout.Section>
            <LegacyCard sectioned title="Customer">
              <SkeletonBodyText />
            </LegacyCard>
            <LegacyCard sectioned title="Application">
              <SkeletonBodyText lines={3} />
            </LegacyCard>
            <LegacyCard sectioned title="Document">
              <SkeletonBodyText lines={3} />
            </LegacyCard>
          </Layout.Section>
          <Layout.Section secondary>
            <LegacyCard sectioned title="Approval" />
          </Layout.Section>
        </Layout>
      </Page>
    );
  }

  const redirectToCustomer = () => {
    redirect.dispatch(Redirect.Action.ADMIN_SECTION, {
      name: Redirect.ResourceType.Customer,
      resource: {
        id: id,
      },
      newContext: true
    });
  }

  return (
    <Page>
      <TitleBar
        title="Manage Application"
        breadcrumbs={breadcrumbs}
        primaryAction={null}
      />
      <Layout>
        <Layout.Section>
          <LegacyCard sectioned title={customer?.displayName} actions={[{content: 'View Customer', onAction:redirectToCustomer}]}>
            <span>{customer?.email}</span>
          </LegacyCard>
          <ProApplicationForm customer={customer} settings={settings}/>
          <Documents customer={customer}/>
        </Layout.Section>
        <Layout.Section secondary>
          <DiscountsForm customer={customer} settings={settings} onCustomerUpdate={refetch}/>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
