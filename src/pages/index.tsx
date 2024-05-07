import PageView from "./pageView";
import SignIn from "./auth";

interface Props {
  isAuth: boolean;
}
const Page: React.FC<Props> = ({ isAuth }) => {
  return (
    <>
      {!isAuth && <SignIn />}
      {isAuth && <PageView />}
    </>
  );
};

export default Page;
