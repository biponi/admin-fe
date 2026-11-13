import { ReactElement, useEffect } from "react";
import { usePageTitle } from "../contexts/PageContext";

interface Props {
  title: string;
  subTitle?: string;
  children: ReactElement;
}

const MainView: React.FC<Props> = ({ title, children }) => {
  const { setPageTitle } = usePageTitle();

  useEffect(() => {
    setPageTitle(title);
  }, [title, setPageTitle]);

  return (
    <div className='flex flex-1 flex-col gap-4'>
      {/* Title is now handled by SiteHeader with breadcrumbs */}
      <main className='gap-2 w-full md:px-2'>
        {children}
      </main>
    </div>
  );
};

export default MainView;
