"use client";
import Image from "next/image";

export default function Loader() {
  

  return (
    <>
   
      <div className="flex items-center justify-center h-screen">
        <Image
          width={150}
          height={150}
          priority
          className="animate-bounce rounded-xl border border-secondary/20 object-cover"
          src="/1.png"
          alt="AI Trading research"
        />
      </div>
    </>
  );
}
