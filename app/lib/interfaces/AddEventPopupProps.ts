import React from "react";
import EventService from "../redux/Events/EventService"

export interface AddEventPopupProps {
  closePopup: () => void;
  setIsUploading: React.Dispatch<React.SetStateAction<boolean>>;
  handleThrowError: (errorMsg: string) => void;
  fetchEvents: () => Promise<void>;
  eventService: EventService;
}