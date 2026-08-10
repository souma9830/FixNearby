import { useContext } from 'react';
import ToastContext from '../context/ToastContext';

const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    return {
      toasts: [],
      showToast: () => {},
      removeToast: () => {}
    };
  }
  return ctx;
};


export default useToast;
