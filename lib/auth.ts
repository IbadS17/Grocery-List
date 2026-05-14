import {
    signInAnonymously,
} from "firebase/auth";

import { auth } from "./firebase";

export const loginAnonymously =
  async () => {
    try {
      const result =
        await signInAnonymously(auth);

      return result.user;
    } catch (error) {
      console.log(error);
    }
  };