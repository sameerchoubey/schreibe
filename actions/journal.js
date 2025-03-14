"use server";

import { MOODS } from "@/app/lib/moods";
import { auth } from "@clerk/nextjs/server";
import { getPixabayImage } from "./public";
import { db } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createJournalEntry(data) {
    try {
        const { userId } = await auth();
        if(!userId) throw new Error("Unauthorized");

        //ArcJet Rate Limiting

        const user = await db.user.findUnique({
            where: {clerkUserId: userId}
        });

        if(!user) throw new Error("User not found");

        const mood = MOODS[data.mood.toUpperCase()];
        if(!mood) throw new Error("Invalid mood");

        //get mood image from
        const moodImageUrl = await getPixabayImage(data.moodQuery);
        const entry = await db.entry.create({
            data: {
                title: data.title,
                content: data.content,
                mood: mood.id,
                moodScore: mood.score,
                moodImageUrl,
                userId: user.id,
                collectionId: data.collectionId || null,
            },
        });

        // Delete existing draft after successful publication
        await db.draft.deleteMany({
            where: { userId: user.id },
        });
  
        revalidatePath("/dashboard");
        return entry;
    } catch(err){
        throw new Error(err.message);
    }
}