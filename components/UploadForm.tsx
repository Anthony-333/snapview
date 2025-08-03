"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import FileInput from "./FileInput";
import FormField from "./FormField";
import { useFileInput } from "@/lib/hooks/useFileInput";
import {
  getVideoUploadUrl,
  getThumbnailUploadUrl,
  saveVideoDetails,
} from "@/lib/actions/video";

const MAX_VIDEO_SIZE = 100 * 1024 * 1024; // 100MB
const MAX_THUMBNAIL_SIZE = 5 * 1024 * 1024; // 5MB

const UploadForm = () => {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const [session, setSession] = useState<any>(null);
  const [isPending, setIsPending] = useState(true);
  
  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    visibility: "public" as "public" | "private",
  });
  
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState("");
  
  // File inputs
  const videoInput = useFileInput(MAX_VIDEO_SIZE);
  const thumbnailInput = useFileInput(MAX_THUMBNAIL_SIZE);

  // Set client-side flag and get session
  useEffect(() => {
    setIsClient(true);

    // Get session using fetch API instead of hooks
    const getSession = async () => {
      try {
        const response = await fetch('/api/auth/session');
        if (response.ok) {
          const sessionData = await response.json();
          setSession(sessionData);
        }
      } catch (error) {
        console.error("Error getting session:", error);
      } finally {
        setIsPending(false);
      }
    };

    getSession();
  }, []);

  // Check for recorded video in session storage
  useEffect(() => {
    if (!isClient) return;
    const recordedVideo = sessionStorage.getItem("recordedVideo");
    if (recordedVideo) {
      try {
        const videoData = JSON.parse(recordedVideo);
        // Convert the blob URL back to a File object
        fetch(videoData.url)
          .then(res => res.blob())
          .then(blob => {
            const file = new File([blob], videoData.name, { type: videoData.type });
            videoInput.handleFileChange({
              target: { files: [file] }
            } as any);
          });
        
        // Set default title
        setFormData(prev => ({
          ...prev,
          title: "Screen Recording " + new Date().toLocaleDateString()
        }));
        
        // Clear session storage
        sessionStorage.removeItem("recordedVideo");
      } catch (error) {
        console.error("Error loading recorded video:", error);
      }
    }
  }, [isClient]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isClient || isPending) return;
    if (!session?.user) {
      router.push("/sign-in");
    }
  }, [session, isPending, router, isClient]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const uploadFile = async (file: File, uploadUrl: string, accessKey: string) => {
    return new Promise<void>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      
      xhr.upload.addEventListener("progress", (e) => {
        if (e.lengthComputable) {
          const progress = Math.round((e.loaded / e.total) * 100);
          setUploadProgress(progress);
        }
      });

      xhr.addEventListener("load", () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve();
        } else {
          reject(new Error(`Upload failed with status ${xhr.status}`));
        }
      });

      xhr.addEventListener("error", () => {
        reject(new Error("Upload failed"));
      });

      xhr.open("PUT", uploadUrl);
      xhr.setRequestHeader("AccessKey", accessKey);
      xhr.send(file);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!videoInput.file) {
      setError("Please select a video file");
      return;
    }

    if (!formData.title.trim()) {
      setError("Please enter a title");
      return;
    }

    setIsUploading(true);
    setError("");
    setUploadProgress(0);

    try {
      // Get upload URLs
      const videoUploadData = await getVideoUploadUrl();
      const thumbnailUploadData = thumbnailInput.file 
        ? await getThumbnailUploadUrl(videoUploadData.videoId)
        : null;

      // Upload video
      await uploadFile(
        videoInput.file,
        videoUploadData.uploadUrl,
        videoUploadData.accessKey
      );

      // Upload thumbnail if provided
      let thumbnailUrl = "";
      if (thumbnailInput.file && thumbnailUploadData) {
        await uploadFile(
          thumbnailInput.file,
          thumbnailUploadData.uploadUrl,
          thumbnailUploadData.accessKey
        );
        thumbnailUrl = thumbnailUploadData.cdnUrl;
      }

      // Save video details
      await saveVideoDetails({
        videoId: videoUploadData.videoId,
        title: formData.title,
        description: formData.description,
        visibility: formData.visibility,
        thumbnailUrl,
        duration: videoInput.duration,
      });

      // Redirect to home page
      router.push("/");
    } catch (error) {
      console.error("Upload error:", error);
      setError(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  // Show loading state while checking authentication or on server
  if (!isClient || isPending) {
    return (
      <div className="wrapper-md upload-page">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-100 mx-auto mb-4"></div>
            <p className="text-gray-100">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  // Don't render anything if not authenticated (will redirect)
  if (!session?.user) {
    return null;
  }

  return (
    <div className="wrapper-md upload-page">
      <h1>Upload Video</h1>
      
      {error && (
        <div className="error-field">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <FileInput
          id="video"
          label="Video File"
          accept="video/*"
          file={videoInput.file}
          previewUrl={videoInput.previewUrl}
          inputRef={videoInput.inputRef}
          onChange={videoInput.handleFileChange}
          onReset={videoInput.resetFile}
          type="video"
        />

        <FileInput
          id="thumbnail"
          label="Thumbnail (Optional)"
          accept="image/*"
          file={thumbnailInput.file}
          previewUrl={thumbnailInput.previewUrl}
          inputRef={thumbnailInput.inputRef}
          onChange={thumbnailInput.handleFileChange}
          onReset={thumbnailInput.resetFile}
          type="image"
        />

        <FormField
          id="title"
          label="Title"
          value={formData.title}
          onChange={handleInputChange}
          placeholder="Enter video title"
        />

        <FormField
          id="description"
          label="Description"
          value={formData.description}
          onChange={handleInputChange}
          placeholder="Enter video description"
          as="textarea"
        />



        <FormField
          id="visibility"
          label="Visibility"
          value={formData.visibility}
          onChange={handleInputChange}
          as="select"
          options={[
            { value: "public", label: "Public" },
            { value: "private", label: "Private" },
          ]}
        />

        {isUploading && (
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-pink-100 h-2 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
            <p className="text-sm text-gray-100 mt-2">
              Uploading... {uploadProgress}%
            </p>
          </div>
        )}

        <button
          type="submit"
          disabled={isUploading || !videoInput.file}
          className="submit-button"
        >
          {isUploading ? "Uploading..." : "Upload Video"}
        </button>
      </form>
    </div>
  );
};

export default UploadForm;
