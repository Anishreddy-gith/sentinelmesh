import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
export function useAlerts(page = 1, limit = 20) {
  return useQuery({
    queryKey: ['alerts', page],
    queryFn: () => axios.get(`/api/alerts?page=${page}&limit=${limit}`).then(r => r.data),
    refetchInterval: 10000,
  });
}
