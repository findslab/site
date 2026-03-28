import {create} from "zustand";
import {useShallow} from "zustand/react/shallow";
import {ReactNode} from "react";

export type alertTypes = {
  show: boolean;
  title?: ReactNode;
  level?: alertLevels;
  hasClose?: boolean;
  onSubmit?(): void;
}

export const alertLevels = {
  normal: 'normal',
  warning: 'warning',
  danger: 'danger'
} as const;
export type alertLevels = typeof alertLevels[keyof typeof alertLevels];

type actionsTypes = {
  actions: {
    showAlert: ({title, level, hasClose, onSubmit}: Pick<alertTypes, 'title' | 'level' | 'hasClose' | 'onSubmit'>) => void,
    closeAlert: () => void,
  }
}

const _create = create<alertTypes & actionsTypes>((set) => ({
  show: false,
  hasClose: true,
  actions: {
    showAlert: ({title, level = alertLevels.normal, hasClose = true, onSubmit}) => set((state) => ({...state, show: true, hasClose, title, level, onSubmit})),
    closeAlert: () => set((state) => ({...state, show: false})),
  },
}));

export const useStoreAlert = () => _create(useShallow((state) => state.actions));
export const useStoreAlertValue = () => _create(useShallow((state) => state));
