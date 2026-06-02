import {create} from "zustand";
import {useShallow} from "zustand/react/shallow";

export type layoutTypes = {
  fold: boolean;
  devMode: boolean;
}

type actionsTypes = {
  actions: {
    setFold: () => void
    toggleDevMode: () => void
  }
}

const _create = create<layoutTypes & actionsTypes>((set) => ({
  fold: false,
  devMode: false,
  actions: {
    setFold: () => set((state) => ({...state, fold: !state.fold})),
    toggleDevMode: () => set((state) => ({...state, devMode: !state.devMode}))
  },
}));

export const useStoreLayout = () => _create(useShallow((state) => state.actions));
export const useStoreLayoutValue = () => _create(useShallow((state) => state));
