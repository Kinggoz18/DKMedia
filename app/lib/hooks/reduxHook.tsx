import { TypedUseSelectorHook, useDispatch, useSelector, useStore } from "react-redux"
import { AppStore, IRootState, RootStateDispatch } from "../redux/rootStore"

export const useAppDispatch = () => useDispatch<RootStateDispatch>();
export const useAppSelector: TypedUseSelectorHook<IRootState> = useSelector;
export const useAppStore = () => useStore<AppStore>();