import {create} from "zustand";
import {useShallow} from "zustand/react/shallow";

export type popupTypes = {
  show: boolean;
  content?: string;
}

type actionsTypes = {
  actions: {
    showPopup: ({content}: Pick<popupTypes, 'content'>) => void,
    closePopup: () => void,
  }
}

const _create = create<popupTypes & actionsTypes>((set) => ({
  show: false,
  actions: {
    showPopup: ({content}) => set((state) => ({...state, show: true, content})),
    closePopup: () => set((state) => ({...state, show: false})),
  },
}));

export const useStorePopup = () => _create(useShallow((state) => state.actions));
export const useStorePopupValue = () => _create(useShallow((state) => state));
