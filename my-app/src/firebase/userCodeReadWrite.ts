import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, firestore } from "./firebase";

export const saveUserCode = async (value: string) => {
    const user = auth.currentUser;
    if (user) {
        const userId = user.uid;
        const userCodeRef = doc(firestore, "usercode", userId);
        await setDoc(userCodeRef, { code: value });
    }
};

export const loadUserCode = async (): Promise<string | undefined> => {
    const user = auth.currentUser;
    if (user) {
        const userId = user.uid;
        const userCodeRef = doc(firestore, "usercode", userId);
        const codeDoc = await getDoc(userCodeRef);
        if (codeDoc.exists()) {
            const data = codeDoc.data().code;
            return data;
        } else {
            return undefined;
        }
    }
};