import { useParams } from "react-router-dom";
import { useForm, useField } from "@shopify/react-form";
import { Redirect } from "@shopify/app-bridge/actions";
import { useAppBridge, Provider, ResourcePicker } from "@shopify/app-bridge-react";
import { useState } from "react";
import React from 'react';

import {
    ActiveDatesCard,
    CombinationCard,
    DiscountClass,
    DiscountMethod,
    MethodCard,
    DiscountStatus,
    RequirementType,
    SummaryCard,
    onBreadcrumbAction,
} from "@shopify/discount-app-components";
import {
    Banner,
    Layout,
    Page,
    PageActions,
} from "@shopify/polaris";

import { DiscountConfigProLevelCard } from "../../../components/";
import { DiscountConfigCollectionsCard } from "../../../components/";
import { DiscountConfigTitleCard } from "../../../components/";

import { discountConfiguration as metafields } from '../../../../helpers/metafield-definitions'
import { useAuthenticatedFetch } from "../../../hooks";

const todaysDate = new Date();

export default function DiscountNew() {
    // Read the function ID from the URL
    const { functionId } = useParams();

    const app = useAppBridge();
    const redirect = Redirect.create(app);
    const currencyCode = "USD";
    const [resources, setResources] = useState([]);
    const authenticatedFetch = useAuthenticatedFetch();
    const [resourcePickerOpen, setResourcePickerOpen] = useState(false);
    const handleSelection = (resources) => {
        setResourcePickerOpen(false);
        setResources(resources);
      };

    const {
        fields: {
            discountTitle,
            discountCode,
            discountMethod,
            combinesWith,
            requirementType,
            requirementSubtotal,
            requirementQuantity,
            usageTotalLimit,
            usageOncePerCustomer,
            startDate,
            endDate,
            configuration,
        },
        submit,
        submitting,
        dirty,
        reset,
        submitErrors,
        makeClean,
    } = useForm({
        fields: {
            discountTitle: useField(""),
            discountMethod: useField(DiscountMethod.Automatic),
            discountCode: useField(""),
            combinesWith: useField({
                orderDiscounts: false,
                productDiscounts: false,
                shippingDiscounts: false,
            }),
            requirementType: useField(RequirementType.None),
            requirementSubtotal: useField("0"),
            requirementQuantity: useField("0"),
            usageTotalLimit: useField(null),
            usageOncePerCustomer: useField(false),
            startDate: useField(todaysDate),
            endDate: useField(null),
            configuration: { // Add quantity and percentage configuration to form data
                customerTag: useField(null),
                percentage: useField('0'),
                collections: useField([]),
            },
        },
        onSubmit: async (form) => {
            const discount = {
                functionId,
                combinesWith: form.combinesWith,
                startsAt: form.startDate,
                endsAt: form.endDate,
                metafields: [
                    {
                        namespace: metafields.namespace,
                        key: metafields.key,
                        type: "json",
                        value: JSON.stringify({ // Populate metafield from form data
                            customerTag: form.configuration.customerTag,
                            percentage: parseFloat(form.configuration.percentage),
                            collections: form.configuration.collections,
                        }),
                    },
                ],
            };

            let response;
            if (form.discountMethod === DiscountMethod.Automatic) {
                response = await authenticatedFetch("/api/discounts/automatic", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        discount: {
                          ...discount,
                          title: form.discountTitle,
                        },
                      }),
                });
            } else {
                response = await authenticatedFetch("/api/discounts/code", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        discount: {
                          ...discount,
                          title: form.discountCode,
                          code: form.discountCode,
                        },
                      }),
                });
            }

            const data = (await response.json()).data;
            const remoteErrors = data.discountCreate.userErrors;
            if (remoteErrors.length > 0) {
                return { status: "fail", errors: remoteErrors };
            }

            redirect.dispatch(Redirect.Action.ADMIN_SECTION, {
                name: Redirect.ResourceType.Discount,
            });
            return { status: "success" };
        },
    });

    const errorBanner =
        submitErrors.length > 0 ? (
            <Layout.Section>
                <Banner status="critical">
                    <p>There were some issues with your form submission:</p>
                    <ul>
                        {submitErrors.map(({ message, field }, index) => {
                            return (
                                <li key={`${message}${index}`}>
                                    {field.join(".")} {message}
                                </li>
                            );
                        })}
                    </ul>
                </Banner>
            </Layout.Section>
        ) : null;

    return (
        <Page
            title="Create Pro Discount"
            breadcrumbs={[
                {
                    content: "Discounts",
                    onAction: () => onBreadcrumbAction(redirect, true),
                },
            ]}
            primaryAction={{
                content: "Save",
                onAction: submit,
                disabled: !dirty,
                loading: submitting,
            }}
        >
            <Layout>
                {errorBanner}
                <Layout.Section>
                    <form onSubmit={submit}>
                        <DiscountConfigTitleCard title={discountTitle} />
                        <DiscountConfigProLevelCard configuration={configuration} />
                        <DiscountConfigCollectionsCard configuration={configuration} />
                        <CombinationCard
                            combinableDiscountTypes={combinesWith}
                            discountClass={DiscountClass.Product}
                            discountDescriptor={
                                discountMethod.value === DiscountMethod.Automatic
                                    ? discountTitle.value
                                    : discountCode.value
                            }
                        />
                        <ActiveDatesCard
                            startDate={startDate}
                            endDate={endDate}
                            timezoneAbbreviation="EST"
                        />
                    </form>
                </Layout.Section>
                <Layout.Section secondary>
                    <SummaryCard
                        header={{
                            discountMethod: discountMethod.value,
                            discountDescriptor: "Automatic",
                            appDiscountType: "Pro Discount",
                            isEditing: false,
                        }}
                        performance={{
                            status: DiscountStatus.Scheduled,
                            usageCount: 0,
                        }}
                        minimumRequirements={{
                            requirementType: requirementType.value,
                            subtotal: requirementSubtotal.value,
                            quantity: requirementQuantity.value,
                            currencyCode: currencyCode,
                        }}
                        usageLimits={{
                            oncePerCustomer: usageOncePerCustomer.value,
                            totalUsageLimit: usageTotalLimit.value,
                        }}
                        activeDates={{
                            startDate: startDate.value,
                            endDate: endDate.value,
                        }}
                    />
                </Layout.Section>
                <Layout.Section>
                    <PageActions
                        primaryAction={{
                            content: "Save discount",
                            onAction: submit,
                            disabled: !dirty,
                            loading: submitting,
                        }}
                        secondaryActions={[
                            {
                                content: "Discard",
                                onAction: () => onBreadcrumbAction(redirect, true),
                            },
                        ]}
                    />
                </Layout.Section>
            </Layout>
        </Page>
    );
}