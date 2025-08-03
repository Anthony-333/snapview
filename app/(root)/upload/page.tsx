"use client";

import { useState, useEffect } from 'react';
import UploadForm from '@/components/UploadForm';

export default function UploadPage() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div className="wrapper-md upload-page">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-100 mx-auto mb-4"></div>
            <p className="text-gray-100">Loading upload form...</p>
          </div>
        </div>
      </div>
    );
  }

  return <UploadForm />;
}
