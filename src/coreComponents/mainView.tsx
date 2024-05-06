import { ReactElement } from "react";

interface Props {
  title: string;
  children: ReactElement;
}

const MainView: React.FC<Props> = ({ title, children }) => {
  return (
    <div className='flex flex-col w-full'>
      <header className='sticky top-0 z-10 hidden sm:flex h-[53px] items-center gap-1 border-b bg-background px-4'>
        <h1 className='text-xl font-semibold'>{title}</h1>
      </header>
      <main className='grid flex-1 gap-4 overflow-auto p-4 w-full md:grid-cols-2 lg:grid-cols-3'>
        {children}
      </main>
    </div>
  );
};

export default MainView;
