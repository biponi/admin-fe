// Drop-in replacement using react-hot-toast
import * as React from "react";
import toast from "react-hot-toast";

import type { ToastActionElement, ToastProps } from "./toast";
import { OctagonAlert } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "./alert";

type ToasterToast = ToastProps & {
  id: string;
  variant?: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: ToastActionElement;
};

interface State {
  toasts: ToasterToast[];
}

const listeners: Array<(state: State) => void> = [];
let memoryState: State = { toasts: [] };

function notifyListeners() {
  listeners.forEach((listener) => {
    listener(memoryState);
  });
}

type Toast = Omit<ToasterToast, "id">;

function AlertToast({ title, description }: { title: any; description: any }) {
  return (
    <Alert className='flex gap-2 justify-start items-center bg-orange-50 '>
      <div className='bg-orange-200 shadow p-2  inline-block rounded-md'>
        <OctagonAlert className='h-5 text-orange-600' />
      </div>
      <div>
        <AlertTitle>{title}</AlertTitle>
        <AlertDescription className='font-bold text-orange-500'>
          {description}
        </AlertDescription>
      </div>
    </Alert>
  );
}

function customToast({ title, description, action, variant, ...props }: Toast) {
  let id: string;

  // Create custom toast content
  const toastContent = (
    <div className='flex flex-col gap-1'>
      {title && <div className='font-semibold'>{title}</div>}
      {description && <div className='text-sm opacity-90'>{description}</div>}
      {action && <div className='mt-2'>{action}</div>}
    </div>
  );

  // Map variant to react-hot-toast types
  if (variant === "destructive") {
    id = toast.error(toastContent, { ...props });
    //@ts-ignore
  } else if (variant === "alert") {
    id = toast.custom((t) => {
      return (
        <div
          className={`${
            t.visible ? "animate-custom-enter" : "animate-custom-leave"
          } max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}>
          <AlertToast title={title} description={description} />
        </div>
      );
    });
  } else {
    id = toast.success(toastContent, { ...props });
  }

  // Store in memory state for compatibility
  const toastData: ToasterToast = {
    id,
    title,
    description,
    action,
    variant,
    open: true,
    ...props,
  };

  memoryState = {
    toasts: [toastData, ...memoryState.toasts],
  };
  notifyListeners();

  const dismiss = () => {
    toast.dismiss(id);
    memoryState = {
      toasts: memoryState.toasts.filter((t) => t.id !== id),
    };
    notifyListeners();
  };

  const update = (newProps: Partial<ToasterToast>) => {
    // Dismiss and recreate with new props
    dismiss();
    customToast({ title, description, action, variant, ...props, ...newProps });
  };

  return {
    id,
    dismiss,
    update,
  };
}

function useToast() {
  const [state, setState] = React.useState<State>(memoryState);

  React.useEffect(() => {
    listeners.push(setState);
    return () => {
      const index = listeners.indexOf(setState);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
  }, [state]);

  return {
    ...state,
    toast: customToast,
    dismiss: (toastId?: string) => {
      if (toastId) {
        toast.dismiss(toastId);
        memoryState = {
          toasts: memoryState.toasts.filter((t) => t.id !== toastId),
        };
      } else {
        toast.dismiss();
        memoryState = { toasts: [] };
      }
      notifyListeners();
    },
  };
}

export { useToast, customToast as toast };
