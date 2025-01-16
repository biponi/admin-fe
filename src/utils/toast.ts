import { toast, ToastPosition } from 'react-hot-toast';

const toastConfig: Partial<any> = {
  position: 'top-center',
  duration: 3000, // Optional: Add default duration
};

export const successToast = (message: string,position:ToastPosition | undefined='top-center') => {
  if (message) toast.success(message, {...toastConfig, position});
};

export const infoToast = (message: string,position:ToastPosition | undefined='top-center') => {
  if (message) toast(message, {...toastConfig, position});
};

export const warnToast = (message: string,position:ToastPosition | undefined='top-center') => {
  if (message) {
    toast(message, {
      ...{...toastConfig, position},
      style: { background: '#FFA500', color: '#000' },
    });
  }
};

export const errorToast = (message: string,position:ToastPosition | undefined='top-center') => {
  if (message) toast.error(message, {...toastConfig, position});
};


// const toastConfig = {
//   autoClose: 5000,
//   hideProgressBar: false,
//   closeOnClick: true,
//   pauseOnHover: true,
//   draggable: true,
//   progress: undefined,
//   theme: "light",
//   transition: Bounce,
// };

// //@ts-ignore
// export const successToast = (
//   message: string,
//   position: ToastPosition | undefined = "top-right"
// ) => toast.success(message, { ...toastConfig, position });

// //@ts-ignore
// export const infoToast = (
//   message: string,
//   position: ToastPosition | undefined = "top-right"
// ) => toast.info(message, { ...toastConfig, position });

// //@ts-ignore
// export const warnToast = (
//   message: string,
//   position: ToastPosition | undefined = "top-right"
// ) => toast.warn(message, { ...toastConfig, position });

// //@ts-ignore
// export const errorToast = (
//   message: string,
//   position: ToastPosition | undefined = "top-right"
// ) => toast.error(message, { ...toastConfig, position });
