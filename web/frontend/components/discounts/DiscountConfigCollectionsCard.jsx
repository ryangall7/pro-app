import React, {useState} from 'react';
import {
    LegacyCard,
    Button,
    Tag
} from '@shopify/polaris';
import { ResourcePicker } from "@shopify/app-bridge-react";


export function DiscountConfigCollectionsCard({configuration}){

    const initialCategories = configuration.collections.value.map((id) => ({id}));

    const [resourcePickerOpen, setResourcePickerOpen] = useState(false);
    const [categories, setCategories] = useState(initialCategories);

    const handleSelection = (resources) => {

        setResourcePickerOpen(false);
        setCategories(resources.selection);
        const idsFromResources = resources.selection.map((product) => product.id);
        configuration.collections.onChange(idsFromResources);
    }

    return <LegacyCard title="Collections">
        <LegacyCard.Section>
            {categories.map((cat, index) => <span key={`catTag-${index}`} style={{marginRight: "10px"}}><Tag>{cat.title || cat.id}</Tag></span>)}
            <ResourcePicker resourceType="Collection" open={resourcePickerOpen} onSelection={handleSelection} onCancel={()=>setResourcePickerOpen(false)} initialSelectionIds={categories}/>

            <Button onClick={()=>setResourcePickerOpen(!resourcePickerOpen)}>
                Add Collections
            </Button>
        </LegacyCard.Section>
    </LegacyCard>
}