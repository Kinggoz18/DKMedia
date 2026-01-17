import { ISubscriptionUpdate } from "@/lib/interfaces/ISubscription"
import { createSlice } from "@reduxjs/toolkit"

const defaultUserInfo: ISubscriptionUpdate = {
  firstName: "",
  lastName: "",
  email: "",
}

const initialState = {
  isOpen: true,
  info: defaultUserInfo
}


const newsletterSlice = createSlice({
  name: "newsletter",
  initialState,
  reducers: {
    setIsNewsletterPopupOpen(state, action) {
      state.isOpen = action.payload;
    },
    setNewsletterInfo(state, action) {
      state.info = action.payload;
    },
  }
})

export const { setIsNewsletterPopupOpen, setNewsletterInfo } = newsletterSlice.actions;
export default newsletterSlice.reducer;