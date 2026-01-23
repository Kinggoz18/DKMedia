

import IContactUs from "@/lib/interfaces/IContactUs";
import { ContactUsService } from "@/services/ContactUsService"
import { useRef, useState } from "react";
import ThrowAsyncError, { toggleError } from "./ThrowAsyncError";
import FeedbackPopup, { toggleFeedback } from "./FeedbackPopup";
import Newsletter from "./Newsletter";
import ProcessingIcon from "@/components/cms/ProcessingIcon";
import { isValidEmail, isValidPhoneNumber } from "@/lib/utils/validation";

export default function ContactUs() {

  const contactUsService = new ContactUsService();
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastName] = useState("");
  const [subject, setSubject] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const errorRef = useRef<HTMLDivElement | null>(null);
  const feedbackRef = useRef<HTMLDivElement | null>(null);

  const [responseError, setResponseError] = useState("");

  /**
   * Is the primary button active
   */
  const isBtnActive = () => {
    if (firstname === "" || email === "" || subject === "" || message === "") return false;
    return true;
  }

  /**
   * Validate email and show error if invalid
   */
  const validateEmail = (): boolean => {
    if (!isValidEmail(email)) {
      handleThrowError("Enter a valid email address");
      return false;
    }
    return true;
  }

  /**
   * Validate phone number and show error if invalid
   */
  const validatePhone = (): boolean => {
    if (phone && !isValidPhoneNumber(phone)) {
      handleThrowError("Enter a valid phone number");
      return false;
    }
    return true;
  }

  /**
   * On subscribe click
   * @returns 
   */
  const onSendClick = async () => {
    if (!isBtnActive()) return;
    
    // Validate email
    if (!validateEmail()) return;
    
    // Validate phone (optional field)
    if (!validatePhone()) return;

    setIsSubmitting(true);
    try {
      const data: IContactUs = {
        firstName: firstname,
        lastName: lastname,
        email: email,
        subject: subject,
        company: company,
        phone: phone,
        message: message,
      }

      const response = await contactUsService.addContactUs(data)
      if (!response?._id) {
        throw new Error("Sorry, something went wrong");
      }

      setFirstname("");
      setLastName("");
      setEmail("");
      setSubject("")
      setCompany("")
      setPhone("")
      setMessage("")
      setIsSubmitting(false);
      handleShowFeedback("Message sent!")
    } catch (error: any) {
      setEmail("")
      setIsSubmitting(false);
      handleThrowError(error?.message)
    }
  }

  /**
  * Throw error from response
  * @param {*} errorMsg
  */
  const handleThrowError = (errorMsg: string) => {
    setResponseError(errorMsg);

    setTimeout(() => {
      toggleError(errorRef);
    }, 400);
  };

  /**
  * Throw error from response
  * @param {*} errorMsg
  */
  const handleShowFeedback = (errorMsg: string) => {
    setResponseError(errorMsg);

    setTimeout(() => {
      toggleFeedback(feedbackRef);
    }, 400);
  };

  return (
    <main className="bg-[#0a0a0a] w-full min-h-screen relative grid grid-flow-row justify-center text-neutral-200 pt-[120px] lg:pt-[140px] pb-10">
      {isSubmitting && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/60 backdrop-blur-sm">
          <div className="glass-card p-8 rounded-2xl flex flex-col items-center gap-4">
            <ProcessingIcon width={"48"} height={"48"}></ProcessingIcon>
            <p className="text-neutral-300 font-medium">Sending message...</p>
          </div>
        </div>
      )}
      <Newsletter />
      <div className="grid grid-flow-row px-6 lg:px-[25px] gap-y-6 lg:gap-y-[20px] items-center w-full max-w-[800px] mx-auto">
        <div className="h2-small lg:hidden w-full text-center text-white">Contact Us</div>
        <h2 className='h2-large lg:block hidden w-full text-center text-white'>Contact Us</h2>

        <div className='flex flex-col gap-4 text-neutral-300 text-sm lg:text-base'>
          <div>Have questions or want to work with us? Send us a message.</div>
          {/**************** Name section ************************/}
          <div className='flex flex-col w-full gap-y-2'>
            <label className='text-white font-semibold'>Name (required)</label>
            <div className='flex flex-col sm:flex-row w-full gap-x-4 gap-y-3'>
              <input
                type="text"
                value={firstname}
                placeholder='First name'
                onChange={(e) => setFirstname(e.currentTarget.value)}
                disabled={isSubmitting}
                className='w-full sm:w-[50%] font-Bebas rounded-xl text-white bg-[#1a1a1a] border border-neutral-700 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500 placeholder:text-neutral-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed'
              />

              <input
                type="text"
                value={lastname}
                placeholder='Last name'
                onChange={(e) => setLastName(e.currentTarget.value)}
                disabled={isSubmitting}
                className='w-full sm:w-[50%] font-Bebas rounded-xl text-white bg-[#1a1a1a] border border-neutral-700 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500 placeholder:text-neutral-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed'
              />
            </div>
          </div>

          {/**************** Company section ************************/}
          <div className='flex flex-col w-full gap-y-2'>
            <label htmlFor="Company" className='text-white font-semibold'>Company</label>
            <input
              name='Company'
              type="text"
              value={company}
              placeholder='Company'
              onChange={(e) => setCompany(e.currentTarget.value)}
              disabled={isSubmitting}
              className='w-full font-Bebas rounded-xl text-white bg-[#1a1a1a] border border-neutral-700 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500 placeholder:text-neutral-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed'
            />
          </div>

          {/**************** Email section ************************/}
          <div className='flex flex-col w-full gap-y-2'>
            <label htmlFor="Email" className='text-white font-semibold'>Email (required)</label>
            <input
              name='Email'
              type="email"
              value={email}
              placeholder='Email'
              onChange={(e) => setEmail(e.currentTarget.value)}
              disabled={isSubmitting}
              className='w-full font-Bebas rounded-xl text-white bg-[#1a1a1a] border border-neutral-700 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500 placeholder:text-neutral-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed'
            />
          </div>

          {/**************** Phone section ************************/}
          <div className='flex flex-col w-full gap-y-2'>
            <label htmlFor="Phone" className='text-white font-semibold'>Phone</label>
            <input
              name='Phone'
              type="text"
              value={phone}
              placeholder='Phone'
              onChange={(e) => setPhone(e.currentTarget.value)}
              disabled={isSubmitting}
              className='w-full font-Bebas rounded-xl text-white bg-[#1a1a1a] border border-neutral-700 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500 placeholder:text-neutral-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed'
            />
          </div>

          {/**************** Subject section ************************/}
          <div className='flex flex-col w-full gap-y-2'>
            <label htmlFor="Subject" className='text-white font-semibold'>Subject (Required)</label>
            <input
              name='Subject'
              type="text"
              value={subject}
              placeholder='Subject'
              onChange={(e) => setSubject(e.currentTarget.value)}
              disabled={isSubmitting}
              className='w-full font-Bebas rounded-xl text-white bg-[#1a1a1a] border border-neutral-700 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500 placeholder:text-neutral-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed'
            />
          </div>

          {/**************** Message section ************************/}
          <div className='flex flex-col w-full gap-y-2'>
            <label htmlFor="Message" className='text-white font-semibold'>Message (required)</label>
            <textarea
              name='Message'
              value={message}
              placeholder='Message to DKMedia'
              onChange={(e) => setMessage(e.currentTarget.value)}
              rows={5}
              disabled={isSubmitting}
              className='w-full font-Bebas rounded-xl text-white bg-[#1a1a1a] border border-neutral-700 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500 placeholder:text-neutral-500 resize-none transition-all disabled:opacity-50 disabled:cursor-not-allowed'
            />
          </div>
        </div>
        <button 
          className={`w-full max-w-[423px] cursor-pointer text-center font-Bebas py-3 rounded-xl justify-self-center transition-all ${isBtnActive() && !isSubmitting ? "bg-primary-500 hover:bg-primary-600" : "bg-primary-500/50 cursor-not-allowed"}`} 
          onClick={() => onSendClick()}
          disabled={!isBtnActive() || isSubmitting}
        >
          Send message
        </button>

        <ThrowAsyncError
          responseError={responseError}
          errorRef={errorRef}
          className={"!bottom-[20%]"}
        />

        <FeedbackPopup
          responseError={responseError}
          errorRef={feedbackRef}
          className={"!bottom-[20%]"}
        />

      </div>
    </main>
  )
}
