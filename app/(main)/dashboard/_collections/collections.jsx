"use client";

import { useEffect, useState } from 'react';
import CollectionPreview from './collection-preview';
import CollectionForm from '@/components/collection-form';
import useFetch from '@/hooks/use-fetch';
import { createCollection } from '@/actions/collection';

const Collections = ({ collections = [], entriesByCollection }) => {
    const [isCollectionDialogOpen, setIsCollectionDialogOpen ] = useState(false);

    const {
        loading: createCollectionLoading,
        fn: createCollectionFn,
        data: createdCollection,
    } = useFetch(createCollection);

    useEffect(() => {
        if (createdCollection) {
          setIsCollectionDialogOpen(false);
          fetchCollections(); // Refresh collections list
          toast.success(`Collection ${createdCollection.name} created!`);
        }
    
    }, [createdCollection, createCollectionLoading]);

    const handleCreateCollection = async (data) => {
        createCollectionFn(data);
    };

    if(collections.length == 0) return <></>

    return <section id="collections" className="space-y-6">
        <h2 className='text-3xl font-bold gradient-title'>Collections</h2>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* create new collection */}
            <CollectionPreview
                isCreateNew={true}
                onCreateNew={() => setIsCollectionDialogOpen(true)}
            />

            {/* unorganized collection */}
            { entriesByCollection?.unorganized?.length > 0 && (
                <CollectionPreview
                    name="Unorganized"
                    entries={entriesByCollection.unorganized}
                    isUnorganized={true}
                />
            )}

            {/* user collections grouped */}
            {collections?.map((collection) => (
                <CollectionPreview
                    key={collection.id}
                    id={collection.id}
                    name={collection.name}
                    entries={entriesByCollection[collection.id] || []}
                />
            ))}

            <CollectionForm
                loading={createCollectionLoading}
                onSuccess={handleCreateCollection}
                open={isCollectionDialogOpen}
                setOpen={setIsCollectionDialogOpen}
            />

        </div>
    </section>
}

export default Collections;