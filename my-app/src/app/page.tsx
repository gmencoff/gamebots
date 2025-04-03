"use client";

import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../firebase/firebase";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
    const [user, loading] = useAuthState(auth);
    const router = useRouter();

    useEffect(() => {
        if (!loading) {
            router.push(user ? "/editor" : "/login");
        }
    }, [user, loading, router]);

    return <p>Loading...</p>;
}
