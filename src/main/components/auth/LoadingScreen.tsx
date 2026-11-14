import { TextShimmerWave } from "@/components/loading-ui/text-shimmer-wave";

export const LoadingScreen = ({
  text = "Loading Dashboard",
}: {
  text?: string;
}) => {
  return (
    <div className='w-full h-screen flex flex-col justify-center items-center bg-background'>
      <TextShimmerWave
        className='text-2xl md:text-3xl font-semibold tracking-tight'
        duration={1}
      >
        {text}
      </TextShimmerWave>
    </div>
  );
};
