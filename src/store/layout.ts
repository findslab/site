import {create} from "zustand";
import {useShallow} from "zustand/react/shallow";

export type layoutTypes = {
  fold: boolean;
}

type actionsTypes = {
  actions: {
    setFold: () => void
  }
}

const _create = create<layoutTypes & actionsTypes>((set) => ({
  fold: false,
  actions: {
    setFold: () => set((state) => ({...state, fold: !state.fold}))
  },
}));

export const useStoreLayout = () => _create(useShallow((state) => state.actions));
export const useStoreLayoutValue = () => _create(useShallow((state) => state));
