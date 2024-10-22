import PageView from "./pageView";
import SignIn from "./auth";
import { Toaster } from "react-hot-toast";

interface Props {
  isAuth: boolean;
}
const Page: React.FC<Props> = ({ isAuth }) => {
  return (
    <>
      {!isAuth && <SignIn />}
      {isAuth && <PageView />}
      <Toaster />
    </>
  );
};

export default Page;
