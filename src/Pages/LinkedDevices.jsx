import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { collection, deleteDoc, doc, getFirestore, onSnapshot, setDoc, serverTimestamp } from "firebase/firestore";
import { auth } from "../Config/firebase";
import SubPageLayout from "../Components/SubPageLayout";

const DEVICE_ID_KEY = "denari-device-id";

function getDeviceId() {
  let id = localStorage.getItem(DEVICE_ID_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(DEVICE_ID_KEY, id);
  }
  return id;
}

export default function LinkedDevices() {
  const [devices, setDevices] = useState([]);
  const [selectedDeviceIds, setSelectedDeviceIds] = useState([]);
  const [currentDeviceId, setCurrentDeviceId] = useState("");
  const [isWorking, setIsWorking] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return undefined;
    const deviceId = getDeviceId();
    setCurrentDeviceId(deviceId);
    const deviceRef = doc(getFirestore(), "users", user.uid, "devices", deviceId);
    setDoc(deviceRef, { deviceId, name: navigator.userAgent.includes("Mobile") ? "Mobile browser" : "Desktop browser", lastActiveAt: serverTimestamp() }, { merge: true });
    return onSnapshot(collection(getFirestore(), "users", user.uid, "devices"), (snapshot) => {
      setDevices(snapshot.docs.map((item) => ({ id: item.id, ...item.data() })));
    });
  }, []);

  function toggleDevice(deviceId) {
    setSelectedDeviceIds((current) => current.includes(deviceId)
      ? current.filter((id) => id !== deviceId)
      : [...current, deviceId]);
  }

  async function unlinkSelectedDevices() {
    if (selectedDeviceIds.length === 0) return;
    if (!window.confirm(`Unlink ${selectedDeviceIds.length} selected device${selectedDeviceIds.length > 1 ? "s" : ""}?`)) return;
    const user = auth.currentUser;
    if (!user) return;
    setIsWorking(true);
    try {
      await Promise.all(selectedDeviceIds.map((deviceId) => deleteDoc(doc(getFirestore(), "users", user.uid, "devices", deviceId))));
      const currentWasSelected = selectedDeviceIds.includes(currentDeviceId);
      setSelectedDeviceIds([]);
      if (currentWasSelected) {
        sessionStorage.removeItem("sessionVerified");
        await signOut(auth);
        navigate("/welcome");
      }
    } catch (error) {
      alert(error.message);
      setIsWorking(false);
    }
  }

  return (
    <SubPageLayout title="Linked device">
      <div className="space-y-4">
        {devices.length === 0 ? (
          <p className="text-sm text-neutral-500">No linked devices found.</p>
        ) : (
          <div className="space-y-3">
            {devices.map((device) => (
              <label key={device.id} className="flex cursor-pointer items-center gap-4 rounded-2xl border border-neutral-200 px-5 py-4">
                <input type="checkbox" checked={selectedDeviceIds.includes(device.id)} onChange={() => toggleDevice(device.id)} className="h-4 w-4 accent-orange-500" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-neutral-900">{device.name || "Unknown device"}{device.id === currentDeviceId && <span className="ml-2 text-xs font-medium text-orange-600">This device</span>}</p>
                  <p className="mt-1 text-xs text-neutral-500">Last active: {device.lastActiveAt?.toDate ? device.lastActiveAt.toDate().toLocaleString() : "Updating..."}</p>
                </div>
              </label>
            ))}
          </div>
        )}
        <button type="button" onClick={unlinkSelectedDevices} disabled={isWorking || selectedDeviceIds.length === 0} className="w-full rounded-xl border border-red-200 px-4 py-3 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60">
          {isWorking ? "Unlinking..." : "Unlink selected devices"}
        </button>
      </div>
    </SubPageLayout>
  );
}
