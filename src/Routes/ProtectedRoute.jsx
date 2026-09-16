import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../Config/firebase";

export default function ProtectedRoute() {
  const [status, setStatus] = useState("checking"); // checking | none | needsPin | verified

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        setStatus("none");
        return;
      }
      const verified = sessionStorage.getItem("sessionVerified") === "true";
      setStatus(verified ? "verified" : "needsPin");
    });
    return unsubscribe;
  }, []);

  if (status === "checking") return null;
  if (status === "none") return <Navigate to="/welcome" replace />;
  if (status === "needsPin") return <Navigate to="/enter-pin" replace />;

  return <Outlet />;
}