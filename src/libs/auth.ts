import {useMutation} from "@tanstack/react-query";
import axios from "axios";
import {userTypes} from "@/types/user";

export const useLogout = () => {
  return useMutation({
      mutationFn: async () => {
        const response = await axios.post(`/admin/api/v1/auth/logout`);
        return response.data;
      }
    }
  );
}

export const useLogin = () => {
  return useMutation({
      mutationFn: async (data: Pick<userTypes, 'id' | 'password'>) => {
        const response = await axios.post(`/admin/api/v1/auth/login`, data);
        return response.data;
      },
    }
  );
}

export const useLoginCheck = () => {
  return useMutation({
      mutationFn: async () => {
        const response = await axios.post('/admin/api/v1/auth/check');
        return response.data;
      },
    }
  );
}
