import { Dog } from "lucide-react";
interface Props {
  title?: string;
  description?: string;
}

const DefaultLoading: React.FC<Props> = ({
  title = "Loading...",
  description = "Please wait...",
}) => {
  return (
    <div
      className='flex flex-1  items-center justify-center rounded-lg border border-dashed shadow-sm w-full '
      x-chunk='dashboard-02-chunk-1'>
      <div className='flex flex-col items-center gap-1 text-center'>
        <Dog className='mx-auto w-20 h-20 animate-bounce ' />
        <h3 className='text-2xl font-bold tracking-tight'>{title}</h3>
        <p className='text-sm text-muted-foreground'>{description}</p>
      </div>
    </div>
  );
};

export default DefaultLoading;
