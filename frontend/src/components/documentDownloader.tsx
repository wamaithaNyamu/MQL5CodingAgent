"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Download, FileText, Loader2 } from "lucide-react"
import { Toaster, toast } from 'sonner'
import { useGetSignedURL } from '@/hooks/use-conversations' // Your updated hook

interface DocumentDownloaderProps {
  documentName?: string // This is the identifier for the bot
}

export default function DocumentDownloader({
  documentName = "Kipchoge.mq5", // This is the identifier for the bot
}: DocumentDownloaderProps) {
  // `isDownloading` indicates the overall process (getting link + initiating client download)
  const [isDownloading, setIsDownloading] = useState(false)
  const [downloadInitiated, setDownloadInitiated] = useState(false); // To prevent re-initiating browser download

  // Use the useQuery hook, which now starts disabled
  type SignedUrlResponse = { data: { signedUrl: string } };
  const {
    data: queryResult, // This will be { data: { signedUrl: '...' } }
    isFetching: isGeneratingUrl, // True while the queryFn is running (fetching the URL)
    isError: isErrorGeneratingUrl, // True if the queryFn failed
    error: generateUrlError,
    isSuccess: isUrlGeneratedSuccessfully, // True if the queryFn succeeded
    refetch, // The function to manually trigger the queryFn
  } = useGetSignedURL(documentName);

  // Effect to handle the browser download once the signed URL is successfully obtained
  useEffect(() => {
    // Check if URL was generated successfully AND we haven't already initiated the browser download
    if (isUrlGeneratedSuccessfully && queryResult?.data?.signedUrl && !downloadInitiated) {
      try {
        const urlToDownload = queryResult.data.signedUrl;
        
        // Trigger the download using the obtained signed URL
        const link = document.createElement("a");
        link.href = urlToDownload;
        link.download = documentName; // Suggest a filename for the download
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        setDownloadInitiated(true); // Mark that browser download initiation was successful
        toast.success("Download started", {
          description: `Your document "${documentName}" download should begin shortly.`,
        });

      } catch (error) {
        console.error("Failed to initiate browser download:", error);
        toast.error("Failed to start download", {
          description: error instanceof Error ? error.message : String(error),
        });
      } finally {
        setIsDownloading(false); // Reset overall downloading state
        // Note: useQuery's state usually doesn't need explicit reset like useMutation
      }
    }
  }, [isUrlGeneratedSuccessfully, queryResult, documentName, downloadInitiated]);

  // Effect to handle errors from the hook (fetching the URL)
  useEffect(() => {
    if (isErrorGeneratingUrl && generateUrlError) {
      console.error("Failed to get download link:", generateUrlError);
      toast.error("Failed to get download link", {
        description: generateUrlError.message || "An unknown error occurred.",
      });
      setIsDownloading(false); // Reset overall state if the API call failed
      setDownloadInitiated(false); // Reset this too
    }
  }, [isErrorGeneratingUrl, generateUrlError]);

  const handleDownloadClick = async () => {
    setIsDownloading(true); // Indicate that the overall process has started
    setDownloadInitiated(false); // Reset for a new download attempt
    
    // Call refetch to manually trigger the useQuery's queryFn
    // useQuery's refetch returns a promise, which you can await if you need sequential logic
    await refetch(); 
  };

  // Determine button disabled state: true if currently fetching URL or overall downloading process
  const buttonIsDisabled = isDownloading || isGeneratingUrl;

  return (
    <Card className="w-full  max-w-3xl">
      <CardHeader>
        <Toaster /> 
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Document Download
        </CardTitle>
        <CardDescription>Click the button below to fetch and download your trading bot.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="text-sm text-muted-foreground">
            <p>
              <strong>Document:</strong> {documentName}
            </p>
          </div>

          <Button onClick={handleDownloadClick} disabled={buttonIsDisabled} className="w-full">
            {buttonIsDisabled ? ( 
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isGeneratingUrl ? "Fetching trading bot..." : "Starting download..."}
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Download Trading Bot
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}