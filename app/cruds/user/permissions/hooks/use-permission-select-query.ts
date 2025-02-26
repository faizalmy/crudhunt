import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';

// Custom hook to use roles for selection
export const usePermissionSelectQuery = () => {
  // Fetch roles for selection
  const fetchPermissionList = async () => {
    const response = await fetch('/api/cruds/user/permissions/select');

    if (!response.ok) {
      toast.error(
        'Something went wrong while loading the records. Please try again.',
        {
          position: 'top-center',
        },
      );
    }

    return response.json();
  };

  return useQuery({
    queryKey: ['user-permission-select'],
    queryFn: fetchPermissionList,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });
};
