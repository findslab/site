import {create} from "zustand";
import {useShallow} from "zustand/react/shallow";
import {userTypes} from "@/types/user";

type actionsTypes = {
  actions: {
    setUser: ({seq, id, email, name, role}: Pick<userTypes, 'seq' | 'id' | 'email' | 'name' | 'role'>) => void,
    deleteUser: () => void,
  }
}

const _create = create<userTypes & actionsTypes>((set) => ({
  seq: 0,
  id: '',
  email: '',
  name: '',
  role: '',
  actions: {
    setUser: ({seq, id, email, name, role}) => set((state) => ({...state, seq, id, email, name, role})),
    deleteUser: () => set((state) => ({...state, seq: 0, id: '', email: '', name: '', role: ''})),
  },
}));

export const useStoreUser = () => _create(useShallow((state) => state.actions));
export const useStoreUserValue = () => _create(useShallow((state) => state));
