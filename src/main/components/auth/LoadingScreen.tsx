import loadingGif from "../../../assets/loading-promx.gif";

export const LoadingScreen = () => {
  return (
    <div className='w-full h-screen flex flex-col justify-center items-center bg-white'>
      <img src={loadingGif} alt='Loading' className='h-16 w-16 object-contain' />
    </div>
  );
};
