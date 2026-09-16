import { useEffect, useState } from "react";
import { auth } from "../Config/firebase";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import SubPageLayout from "../Components/SubPageLayout";

export default function PersonalInfoDetail() {
  const [data, setData] = useState({});
  useEffect(() => {
    (async () => {
      const snap = await getDoc(doc(getFirestore(), "users", auth.currentUser.uid));
      if (snap.exists()) setData(snap.data());
    })();
  }, []);

  const rows = [
    ["Full name", data.fullName],
    ["Email", data.email],
    ["Phone", data.phone],
    ["Date of birth", data.dob],
    ["Occupation", data.occupation],
  ];

  return (
    <SubPageLayout title="Personal information">
      <div className="space-y-4">
        {rows.map(([label, value]) => (
          <div key={label} className="border-b border-neutral-100 pb-3">
            <p className="text-xs text-neutral-400">{label}</p>
            <p className="text-sm font-medium text-neutral-800">{value || "—"}</p>
          </div>
        ))}
      </div>
    </SubPageLayout>
  );
}