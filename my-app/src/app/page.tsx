"use client";

import { auth } from "../firebase/firebase";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
    const router = useRouter();

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(
            (user) => {
                router.push(user?.uid ? "/editor" : "/login");
            }
        );
        return unsubscribe;
    }, [router]);

    return <p>Loading...</p>;
}
