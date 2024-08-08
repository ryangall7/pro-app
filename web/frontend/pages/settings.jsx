import {useState} from 'react';
import {Page, LegacyCard, Badge, SkeletonBodyText} from '@shopify/polaris';
import { useAuthenticatedFetch, useAppQuery } from "../hooks";
import { SettingsForm } from "../components";

export default function SettingsPage() {

    const [fetchLoading, setFetchLoading] = useState(false);
    const fetch  = useAuthenticatedFetch();
    const { data: metafields, isLoading, isRefetching, refetch} = useAppQuery({
      url: "/api/metafields",
    });
    const { data: settings, isLoading: settingsLoading, refetch:refetchSettings} = useAppQuery({
      url: "/api/settings",
    });

    const updateDefinitions = async () => {
        setFetchLoading(true);
        const response = await fetch("/api/metafields", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
        });
        refetch();
        setFetchLoading(false);
    }

    const handleRefetch = () => {
        refetch();
        refetchSettings();
    }

    const loading = isLoading || isRefetching || fetchLoading;
    const metafieldsList =  metafields ? metafields.metafields.map(({node}) => {

        let version, upToDate;
        if (node.description?.includes("]")) {
            version = node.description?.split("]")[0].replace("[", "");
        }

        if (version && metafields.currentVersion) {
            upToDate = version === metafields.currentVersion;
        }

        return <LegacyCard key={node.id} sectioned
            title={<>{node.name} {metafields && version ? <Badge status={upToDate ? "success" : "critical"}>v{version}</Badge> : null }</>}
            >
              <p>{node.description?.split("]").pop()}</p>
              <p>{node.namespace}:{node.key} <Badge>{node.type.name}</Badge></p>
            </LegacyCard>
        }) : null;

    return (
        <Page
          title={<>App Settings</>}
        >
          { !settingsLoading ? <SettingsForm settings={settings} refetch={handleRefetch} /> :
            <LegacyCard sectioned title="Settings">
              <SkeletonBodyText lines={3} />
            </LegacyCard>
          }
          <LegacyCard
            title={<>Metafield Definitions {metafields ? <Badge status="info">Current version {metafields.currentVersion}</Badge> : null }</>}
            primaryFooterAction={{content: 'Update Definitions', onAction: updateDefinitions, loading:loading}}
            sectioned>
            {loading ?
                <p>Loading...</p>
            :
              metafieldsList
            }
          </LegacyCard>
        </Page>
      );
}