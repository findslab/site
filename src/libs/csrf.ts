import { useMutation } from '@tanstack/react-query'
import axios from "axios";

export const useCsrf = () => {
  return useMutation({
      mutationFn: async () => {
        const response = await axios.get(`csrf`);
        return response.data;
      },
    }
  );
}
