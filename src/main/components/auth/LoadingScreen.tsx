export const LoadingScreen = () => {
  return (
    <div className='w-full h-screen flex flex-col justify-center items-center bg-white'>
      <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4'></div>
      <span className='text-lg font-semibold text-gray-700'>
        Loading Dashboard...
      </span>
      <p className='text-sm text-gray-500 mt-2'>
        Please wait while we load your content
      </p>
    </div>
  );
};
