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
      <main className='gap-2 overflow-auto w-full md:w-[98%] md:mx-4'>
        {children}
      </main>
    </div>
  );
};

export default MainView;
