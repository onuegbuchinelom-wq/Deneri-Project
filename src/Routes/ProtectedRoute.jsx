import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../Config/firebase";
import { doc, getDoc, getFirestore } from "firebase/firestore";

export default function ProtectedRoute() {
  const [status, setStatus] = useState("checking"); // checking | none | needsPin | verified

  useEffect(() => {
    let active = true;
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setStatus("none");
        return;
      }
      const verified = sessionStorage.getItem("sessionVerified") === "true";
      if (verified) {
        setStatus("verified");
        return;
      }
      try {
        const snapshot = await getDoc(doc(getFirestore(), "users", user.uid));
        const requirePin = snapshot.data()?.settings?.security?.requirePinOnOpen === true;
        if (active) setStatus(requirePin ? "needsPin" : "verified");
      } catch (error) {
        console.error("Failed to load security settings:", error.message);
        if (active) setStatus("needsPin");
      }
    });
    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  if (status === "checking") return null;
  if (status === "none") return <Navigate to="/welcome" replace />;
  if (status === "needsPin") return <Navigate to="/enter-pin" replace />;

  return <Outlet />;
}