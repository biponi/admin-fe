import { useDispatch, useSelector } from "react-redux";
import { errorToast, successToast, warnToast } from "../../../utils/toast";
import { getUserById, loginUser, refreshApiToken } from "../../../api";
import {
  isValidBangladeshiMobileNumber,
  isValidEmail,
} from "../../../utils/helperFunction";
import { useState } from "react";
import {
  logout,
  updateUserState,
  updateUserToken,
} from "../../../store/reducers/userReducer";

const useLoginAuth = () => {
  const dispatch: any = useDispatch();
  const userStore = useSelector((state: any) => state?.user);
  const [loading, setLoading] = useState(false);

  const login = async (username: string, password: string) => {
    if (!!username && !!password) {
      if (
        !isValidEmail(username) &&
        !isValidBangladeshiMobileNumber(username)
      ) {
        errorToast("Please enter valid email or mobile number", "top-center");
      } else {
        setLoading(true);
        const user = await loginUser({ username, password });
        if (user.success) {
          successToast("login successful 🎉", "top-center");
          localStorage.setItem("token", user?.data?.token);
          localStorage.setItem("refreshToken", user?.data?.refreshToken);
          dispatch(updateUserState(user?.data));
        } else {
          errorToast(user?.error || "", "top-center");
        }
        setLoading(false);
      }
    } else {
      warnToast("Please provide all the data", "top-center");
    }
  };

  const fetchUserById = async (userId: number) => {
    const response = await getUserById(userId);
    if (response?.success) {
      dispatch(updateUserState({ ...response?.data }));
    }
  };

  const refreshToken = async () => {
    const tokenData = await refreshApiToken();
    if (tokenData?.success) {
      dispatch(
        updateUserToken({
          token: tokenData?.data?.accessToken,
          refreshToken: tokenData?.data?.refreshToken,
        })
      );
      return {
        success: true,
        token: tokenData?.data?.accessToken,
        refreshToken: tokenData?.data?.refreshToken,
      };
    } else {
      dispatch(
        updateUserToken({
          token: null,
          refreshToken: null,
        })
      );
      localStorage.setItem("token", "");
      return {
        success: false,
        token: "",
        refreshToken: "",
      };
    }
  };

  const signOut = () => {
    dispatch(logout());
  };

  return {
    login,
    signOut,
    loading,
    refreshToken,
    fetchUserById,
    token: userStore?.token,
    user: !!userStore
      ? {
          id: userStore?.id,
          name: userStore?.name,
          email: userStore?.email,
          mobile_number: userStore?.mobile_number,
          avatar: userStore?.avatar,
          nid: userStore?.nid,
          role_id: userStore?.role_id,
          created_at: userStore?.created_at,
        }
      : null,
  };
};

export default useLoginAuth;
