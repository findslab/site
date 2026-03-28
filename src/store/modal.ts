import {create} from "zustand";
import {useShallow} from "zustand/react/shallow";
import {ReactNode} from "react";

export type modalTypes = {
  title?: string;
  children?: ReactNode
  maxWidth?: string;
}

type modalStackTypes = {
  modals: modalTypes[];
}

type actionsTypes = {
  actions: {
    showModal: ({title, maxWidth, children}: Pick<modalTypes, 'children' | 'title' | 'maxWidth'>) => void,
    closeModal: () => void,
    closeAllModals: () => void,
  }
}

const _create = create<modalStackTypes & actionsTypes>((set) => ({
  modals: [],
  actions: {
    showModal: ({title, maxWidth, children}) => set((state) => ({
      ...state,
      modals: [...state.modals, { title, maxWidth, children }]
    })),
    closeModal: () => set((state) => ({
      ...state,
      modals: state.modals.slice(0, -1)
    })),
    closeAllModals: () => set((state) => ({
      ...state,
      modals: []
    })),
  },
}));

export const useStoreModal = () => _create(useShallow((state) => state.actions));
export const useStoreModalValue = () => _create(useShallow((state) => state));
