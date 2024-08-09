import { useState, useEffect, useCallback } from "react";

import {
  LegacyCard,
  Page,
  Layout,
  SkeletonBodyText,
  Pagination,
  Filters,
  ChoiceList
} from "@shopify/polaris";

import { TitleBar, Loading } from "@shopify/app-bridge-react";

import { ProApplicationsIndex } from "../components";
import { discountLevels, proStatuses } from "../../helpers/data";
import { useAppQuery } from "../hooks";

export default function HomePage() {

  const [queryUrl, setQueryUrl] = useState("/api/customers")
  const [queryValue, setQueryValue] = useState("");
  const [applicationStatus, setApplicationStatus] = useState([]);
  const [discountLevel, setDiscountLevel] = useState([]);
  const [before, setBefore] = useState(null);
  const [after, setAfter] = useState(null);

  const resourceName = {
    singular: "Pro Application",
    plural: "Pro Applications",
  };

  /* useAppQuery wraps react-query and the App Bridge authenticatedFetch function */
  const { data, isLoading, isRefetching, refetch } = useAppQuery({
    url: queryUrl,
  });

  const debouncedSearch = useCallback(debounce((query, applicationStatus, discountLevel, before, after) => {
    let url = "/api/customers?";
    if(before) {
      url += `before=${before}&`;
    }else if(after) {
      url += `after=${after}&`;
    }
    if(query) {
      url += `query=${query}&`;
    }
    if(applicationStatus) {
      url += `applicationStatus=${applicationStatus}&`;
    }
    if(discountLevel) {
      url += `discountLevel=${discountLevel}`;
    }
    setQueryUrl(url);
  }, 500), []);

  useEffect(() => {
    debouncedSearch(queryValue, applicationStatus, discountLevel, before, after);
  }, [queryValue, applicationStatus, discountLevel, before, after]);

  const handleAppStatusChange = useCallback((value) => {
    setApplicationStatus(value);
  }, []);

  const handleDiscountLevelChange = useCallback((value) => {
    setDiscountLevel(value);
  }, []);

  const filters = [
    {
      key: 'applicationStatus',
      label: 'Application status',
      filter: (
        <ChoiceList
          title="Application status"
          titleHidden
          choices={proStatuses}
          selected={applicationStatus || []}
          onChange={handleAppStatusChange}
          allowMultiple
        />
      ),
      shortcut: true,
    },
    {
      key: 'discountLevel',
      label: 'Discount level',
      filter: (
        <ChoiceList
          title="Discount level"
          titleHidden
          choices={discountLevels}
          selected={discountLevel || []}
          onChange={handleDiscountLevelChange}
          allowMultiple
        />
      ),
      shortcut: true,
    }
  ]

  const appliedFilters = [];
  if (!isEmpty(applicationStatus)) {
    const key = 'applicationStatus';
    appliedFilters.push({
      key,
      label: disambiguateLabel(key, applicationStatus),
      onRemove: () => {
        setApplicationStatus([]);
      },
    });
  }
  if (!isEmpty(discountLevel)) {
    const key = 'discountLevel';
    appliedFilters.push({
      key,
      label: disambiguateLabel(key, discountLevel),
      onRemove: () => {
        setDiscountLevel([]);
      },
    });
  }


  const handleFiltersQueryChange = useCallback((value) => {
    setQueryValue(value);
  }, []);

  const customers = data?.customers;
  const pageInfo = data?.pageInfo;

    /* Set the QR codes to use in the list */
    const proApplicationsMarkup =
      <>
        <LegacyCard>
          <div style={{
            padding: "1em"
          }}>
            <Filters
            queryValue={queryValue}
            queryPlaceholder="Search customers"
            onQueryChange={handleFiltersQueryChange}
            onQueryClear={() => setQueryValue("")}
            filters={filters}
            appliedFilters={appliedFilters}
            />
          </div>
          <ProApplicationsIndex customers={customers || []} resourceName={resourceName} loading={isLoading || isRefetching} />
          <div alignment="center" style={{width: "100%", display: "flex", justifyContent: "center", padding: "1em"}}>
            <Pagination
              hasPrevious={pageInfo?.hasPreviousPage}
              onPrevious={() => {
                setBefore(pageInfo?.startCursor);
                setAfter(null);
              }}
              hasNext={pageInfo?.hasNextPage}
              onNext={() => {
                setAfter(pageInfo?.endCursor);
                setBefore(null);
              }}
            />
          </div>
        </LegacyCard>
      </>

  return (
    <Page fullWidth={!!proApplicationsMarkup}>
      <TitleBar title="Pro App" />
      <Layout>
        <Layout.Section>
          {proApplicationsMarkup}
        </Layout.Section>
      </Layout>
    </Page>
  );
}


function disambiguateLabel(key, value) {
  switch (key) {
    case 'applicationStatus':
      return value?.map((val) => `Status ${val}`).join(', ');
    case 'discountLevel':
      return value?.map((val) => `Level ${val}`).join(', ');
    default:
      return value;
  }
}

function isEmpty(value) {
  if (Array.isArray(value)) {
    return value.length === 0;
  } else {
    return value === '' || value == null;
  }
}

function debounce(func, timeout = 300){
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => { func.apply(this, args); }, timeout);
  };
}