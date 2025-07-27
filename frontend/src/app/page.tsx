"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Loader from "@/components/ui/loader"; // Adjust the import path as per your file structure
import { useChatStore } from "@/stores/chatStore";

export default function Home() {
  const router = useRouter();
  const clearMessages = useChatStore((state)=> state.clearMessages)
  useEffect(() => {
    clearMessages();
    console.log(`Cleared state!`)
  }, [clearMessages]);
  useEffect(() => {
    const redirectTimer = setTimeout(() => {
      router.push("/conversations");
    }, 200);

    return () => clearTimeout(redirectTimer);
  }, [router]);

  return (

        <Loader/>
     
  );
}
