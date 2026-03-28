import {create} from "zustand";
import {useShallow} from "zustand/react/shallow";
import {ReactNode} from "react";

export type snackbarTypes = {
  show: boolean;
  title?: ReactNode;
  level?: snackbarLevels;
}

export enum snackbarLevels {
  normal = 'normal',
  warning = 'warning',
  danger = 'danger'
}

type actionsTypes = {
  actions: {
    showSnackbar: ({title, level}: Pick<snackbarTypes, 'title' | 'level'>) => void,
    closeSnackbar: () => void,
  }
}

const _create = create<snackbarTypes & actionsTypes>((set) => ({
  show: false,
  actions: {
    showSnackbar: ({title, level = snackbarLevels.normal}) => set((state) => ({...state, show: true, title, level})),
    closeSnackbar: () => set((state) => ({...state, show: false})),
  },
}));

export const useStoreSnackbar = () => _create(useShallow((state) => state.actions));
export const useStoreSnackbarValue = () => _create(useShallow((state) => state));
