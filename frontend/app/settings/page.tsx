import React from 'react';
import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from "@/lib/utils";

export default function SettingsPage() {
  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
      <div className="flex items-center">
        <h1 className="font-semibold text-lg md:text-2xl text-left">Keypair Settings</h1>
      </div>
      <div className="flex flex-col gap-4">
        <div className={cn("p-20 border rounded-md w-full", buttonVariants({ variant: 'card', size: 'lg' }))}>
          <div className="flex flex-col items-start w-full">
            <h2 className="font-semibold text-md md:text-xl">Generate Keypair</h2>
            <div className="flex flex-col gap-2 mt-4 w-full">
              <div className="w-full">
                <Button>Generate</Button>
              </div>
              <div className="w-full p-4 border rounded-md bg-gray-50">
                <p>Public Key:</p>
                <p>Private Key:</p>
              </div>
            </div>
          </div>
        </div>
        <div className={cn("p-20 border rounded-md w-full", buttonVariants({ variant: 'card', size: 'lg' }))}>
          <div className="flex flex-col items-start w-full">
            <h2 className="font-semibold text-md md:text-xl">Import Wallet</h2>
            <div className="flex flex-col gap-2 mt-4 w-full">
              <div className="w-full">
                <Button>Import</Button>
              </div>
              <div className="w-full p-4 border rounded-md bg-gray-50">
                <p>Imported Wallet Data:</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
