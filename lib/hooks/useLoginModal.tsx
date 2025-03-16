import { create } from "zustand"

declare type LoginModalTypesStore = {
    isOpen: boolean
    onOpen: () => void
    onClose: () => void
 }

const useLoginModal = create<LoginModalTypesStore>((set: (arg0: { isOpen: boolean }) => void) => ({
   isOpen: false,
   onOpen: () => set({ isOpen: true }),
   onClose: () => set({ isOpen: false }),
}))

export default useLoginModal