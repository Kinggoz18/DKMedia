import emailJs from "@emailjs/nodejs"
import dotenv from 'dotenv';
dotenv.config();

const initEmailJs = () => {
  emailJs.init({
    publicKey: process.env.EMAILJS_KEY
  })

  return emailJs;
}

export default initEmailJs;