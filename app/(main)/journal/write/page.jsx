"use client";

import { useState, useEffect } from "react";
import { journalSchema } from '@/app/lib/schema';
import dynamic from 'next/dynamic';
import React from 'react'
import { Controller, useForm } from 'react-hook-form';
import "react-quill-new/dist/quill.snow.css";
import { zodResolver } from "@hookform/resolvers/zod"
import { BarLoader } from 'react-spinners';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getMoodById, MOODS } from '@/app/lib/moods';
import { Button } from "@/components/ui/button"
import useFetch from "@/hooks/use-fetch";
import { createJournalEntry } from "@/actions/journal";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false});

const JournalEntryPage = () => {
    
    const {
        loading: actionLoading,
        fn: actionFn,
        data: actionResult,
    } = useFetch(createJournalEntry);

    const router = useRouter();

    const { register, handleSubmit, control, getValues, formState:{errors} } = useForm({
        resolver: zodResolver(journalSchema),
        defaultValues: {
            title: "",
            content: "",
            mood: "",
            collectionId: ""
        }
    })

    const isLoading = actionLoading;

    useEffect(() => {
        if(!actionLoading && actionResult){
            console.log('actionResult', actionResult);
            router.push(`/collection/${actionResult.collectionId ? actionResult.collectionId : "unorganized"}`);
            toast.success(`Entry created successfully`);
        };
    }, [actionResult, actionLoading]);

    const onSubmit = handleSubmit (async (data) => {
        const mood = getMoodById(data.mood);

        const newData = {
            ...data,
            moodScore: mood.score,
            moodQuery: mood.pixabayQuery
        }
        console.log('newData', newData);
        actionFn(newData)
    });

    return (
        <div className="py-8">
            <form onSubmit={ onSubmit } className="space-y-2 mx-auto">
                <h1 className="text-5xl md:text-6xl gradient-title">
                    What&apos;s on your mind?
                </h1>

                {isLoading && <BarLoader color="orange" width={"100%"} />}

                {/* Title Input */}
                <div className="space-y-2">
                    <label className="text-sm font-medium">
                        Title
                    </label>
                    <Input
                        disable={isLoading  }
                        {...register("title")}
                        placeholder="Give your entry a title..."
                        className={`my-5 md:text-md ${errors.title ? "border-red-500" : ""}`}
                    />
                </div>

                {/* How are you feeling */}
                <div className="space-y-2">
                    <label className="text-sm font-medium">
                        How are you feeling?
                    </label>
                    <Controller
                        name="mood"
                        control={control}
                        render={({ field }) => (
                            <Select onValueChange={field.onChange} value={field.value}>
                                <SelectTrigger className={errors.mood ? "border-red-500" : ""}>
                                    <SelectValue placeholder="Select a mood..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {Object.values(MOODS).map((mood) => (
                                        <SelectItem key={mood.id} value={mood.id}>
                                            <span className="flex items-center gap-2">
                                                {mood.emoji} {mood.label}
                                            </span>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    />

                    {errors.mood && (
                        <p className="text-red-500 text-sm">{errors.mood.message}</p>
                    )}
                </div>
                
                {/* Big Input Box */}
                <div className="space-y-2">
                    <label className="text-sm font-medium">
                        {getMoodById(getValues("mood"))?.prompt ?? "Write your thoughts..."}
                    </label>

                    <Controller
                        name="content"
                        control={control}
                        render={({ field }) => (
                            <ReactQuill
                                readOnly={isLoading}
                                theme="snow"
                                value={field.value}
                                onChange={field.onChange}
                                modules={{
                                    toolbar: [
                                        [{ header: [1, 2, 3, false] }],
                                        ["bold", "italic", "underline", "strike"],
                                        [{ list: "ordered" }, { list: "bullet" }],
                                        ["blockquote", "code-block"],
                                        ["link"],
                                        ["clean"],
                                    ],
                                }}
                            />
                        )}
                    />

                    {errors.content && (
                        <p className="text-red-500 text-sm">{errors.content.message}</p>
                    )}
                </div>
                
                {/* Add to Collection (Optional) */}
                <div className="space-y-2">
                    <label className="text-sm font-medium">
                        Add to Collection (Optional)
                    </label>

                    <Controller
                        name="collectionId"
                        control={control}
                        render={({ field }) => (
                            <Select
                                onValueChange={(value) => {
                                    if (value === "new") setIsCollectionDialogOpen(true);
                                    else field.onChange(value);
                                }}
                                value={field.value}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Choose a collection..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {/* {collections?.map((collection) => (
                                        <SelectItem key={collection.id} value={collection.id}>
                                        {collection.name}
                                        </SelectItem>
                                    ))} */}
                                    <SelectItem value="new">
                                        <span className="text-orange-600">
                                            + Create New Collection
                                        </span>
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        )}
                    />
                </div>
                    
                {/* Final CTA */}
                <div className="space-x-4 flex">
                    <Button
                        type="submit"
                        variant="journal"
                    >
                        Publish
                    </Button>
                </div>

            </form>
        </div>
    )
}

export default JournalEntryPage;