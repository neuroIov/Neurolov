import { useToast as useChakraToast } from "@/components/ui/use-toast"

interface ToastOptions {
  title: string;
  description?: string;
  status?: 'info' | 'warning' | 'success' | 'error';
  duration?: number;
  isClosable?: boolean;
}

const toast = (options: ToastOptions) => {
  const { toast: showToast } = useChakraToast();
  
  showToast({
    title: options.title,
    description: options.description,
    variant: options.status === 'error' ? 'destructive' : 'default',
    duration: options.duration || 3000,
  });
};

export default toast;
