"use server";

import { headers } from "next/headers";
import { apiFetch, getEnv, withErrorHandling } from "../utils";
import { auth } from "../auth";
import { BUNNY } from "@/constants";

import { videos } from "@/drizzle/schema";
import { revalidatePath } from "next/cache";
import { db } from "@/drizzle/db";
import aj from "../arcjet";
import { fixedWindow, request } from "@arcjet/next";

const VIDEO_STREAM_BASE_URL = BUNNY.STREAM_BASE_URL;
const THUMBNAIL_STORAGE_BASE_URL = BUNNY.STORAGE_BASE_URL;
const THUMBNAIL_CDN_URL = BUNNY.CDN_URL;
const BUNNY_LIBRARY_ID = getEnv("BUNNY_LIBRARY_ID");
const ACCESS_KEYS = {
  streamAccessKey: getEnv("BUNNY_STREAM_ACCESS_KEY"),
  storageAccessKey: getEnv("BUNNY_STORAGE_ACCESS_KEY"),
};

//helper functions
const getSessionUserId = async (): Promise<string> => {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) throw new Error("Unauthenticated");

  return session.user.id;
};

const revalidatePaths = async (paths: string[]) => {
  paths.forEach((path) => {
    revalidatePath(path);
  });
};

const validateWithArcjet = async (fingerprint: string) => {
  const rateLimit = aj.withRule(
    fixedWindow({
      mode: "LIVE",
      window: "1m",
      max: 2,
      characteristics: ["fingerprint"],
    })
  );

  const req = await request();

  const decision = await rateLimit.protect(req, { fingerprint });
  if (decision.isDenied()) {
    throw new Error("Rate limit exceeded. Please try again later.");
  }
};

//Server actions
export const getVideoUploadUrl = withErrorHandling(async () => {
  await getSessionUserId();

  const videoResponse = await apiFetch<BunnyVideoResponse>(
    `${VIDEO_STREAM_BASE_URL}/${BUNNY_LIBRARY_ID}/videos`,
    {
      method: "POST",
      bunnyType: "stream",
      body: { title: "Temporary Title", collectionId: "" },
    }
  );

  const uploadUrl = `${VIDEO_STREAM_BASE_URL}/${BUNNY_LIBRARY_ID}/videos/${videoResponse.guid}`;

  return {
    videoId: videoResponse.guid,
    uploadUrl,
    accessKey: ACCESS_KEYS.streamAccessKey,
  };
});

export const getThumbnailUploadUrl = withErrorHandling(
  async (videoId: string) => {
    const fileName = `${Date.now()}-${videoId}-thumbnail`;
    const uploadUrl = `${THUMBNAIL_STORAGE_BASE_URL}/thumbnails/${fileName}`;
    const cdnUrl = `${THUMBNAIL_CDN_URL}/thumbnails/${fileName}`;

    return {
      uploadUrl,
      cdnUrl,
      accessKey: ACCESS_KEYS.storageAccessKey,
    };
  }
);

export const saveVideoDetails = withErrorHandling(
  async (videoDetails: VideoDetails) => {
    const userId = await getSessionUserId();

    await validateWithArcjet(userId);

    await apiFetch(
      `${VIDEO_STREAM_BASE_URL}/${BUNNY_LIBRARY_ID}/videos/${videoDetails.videoId}`,
      {
        method: "POST",
        bunnyType: "stream",
        body: {
          title: videoDetails.title,
          description: videoDetails.description,
        },
      }
    );

    await db.insert(videos).values({
      userId,
      videoId: videoDetails.videoId,
      title: videoDetails.title,
      description: videoDetails.description,
      thumbnailUrl: videoDetails.thumbnailUrl,
      visibility: videoDetails.visibility === "public" ? "public" : "private",
      duration: videoDetails.duration ?? null,
      createdAt: new Date(),
      updatedAt: new Date(),
      // Add other fields here only if they exist in your schema
    });

    revalidatePaths(["/"]);

    return {
      videoId: videoDetails.videoId,
    };
  }
);
