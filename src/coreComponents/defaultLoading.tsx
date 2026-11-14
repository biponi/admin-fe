import { PageLoader } from "../components/loaders";

interface Props {
  title?: string;
  description?: string;
}

const DefaultLoading: React.FC<Props> = ({
  title = "Loading...",
  description = "Please wait...",
}) => {
  return (
    <div className='w-full'>
      <PageLoader domain='generic' text={title} className='rounded-lg border border-dashed shadow-sm' />
      {description && (
        <p className='sr-only'>{description}</p>
      )}
    </div>
  );
};

export default DefaultLoading;
