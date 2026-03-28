import axios from 'axios';
import {useMutation} from "@tanstack/react-query";

export const useUploadFile = () => {
  return useMutation({
      mutationFn: async (data: FormData) => {
        const response = await axios.postForm('/admin/api/v1/file', data);
        return response.data.data;
      },
    }
  );
}
