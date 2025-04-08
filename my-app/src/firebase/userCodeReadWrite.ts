import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, firestore } from "./firebase";

export const saveUserCode = async (value: string) => {
    const user = auth.currentUser;
    if (user) {
        const userId = user.uid;
        const userCodeRef = getUserCodeRef(userId);
        await setDoc(userCodeRef, { code: value });
    }
};

export const saveDefaultCode = async (value: string) => {
    const defaultCodeRef = getDefaultCodeRef();
    await setDoc(defaultCodeRef, { code: value });
};

export const loadUserCode = async (): Promise<string | undefined> => {
    const user = auth.currentUser;
    if (user) {
        const userId = user.uid;
        const userCodeRef = getUserCodeRef(userId);
        const codeDoc = await getDoc(userCodeRef);

        // If doc exists, return the code, otherwise return default code
        if (codeDoc.exists()) {
            const data = codeDoc.data().code;
            return data;
        } else {
            const defaultCodeRef = getDefaultCodeRef();
            const defaultCode = await getDoc(defaultCodeRef);
            if (defaultCode.exists()) {
                const data = defaultCode.data().code;
                return data;
            } else {
                return undefined;
            }
        }
    }
};

const getUserCodeRef = (id: string) => {
    return doc(firestore, "code", id);
};

const getDefaultCodeRef = () => {
    return doc(firestore, "code", "default");
};