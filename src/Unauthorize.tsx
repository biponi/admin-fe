// src/components/AccessDeniedPage.tsx

import React from "react";
import { Button } from "./components/ui/button";

const AccessDeniedPage: React.FC = () => {
  return (
    <div className='flex h-screen justify-center items-center bg-gray-100'>
      <div className='text-center'>
        <h1 className='text-3xl font-semibold text-red-600 mb-4'>
          Access Denied
        </h1>
        <p className='text-gray-600 mb-6'>
          You do not have permission to access this page.
        </p>
        <Button
          variant={"default"}
          className='bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded'
          onClick={() => (window.location.href = "/")}>
          Go to Home
        </Button>
      </div>
    </div>
  );
};

export default AccessDeniedPage;
