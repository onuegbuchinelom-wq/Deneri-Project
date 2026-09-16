import { useNavigate } from "react-router-dom";
import SubPageLayout from "../Components/SubPageLayout";

export default function Security() {
  const navigate = useNavigate();
  return (
    <SubPageLayout title="Security">
      <button
        onClick={() => navigate("/setup-pin")}
        className="w-full text-left rounded-2xl border border-neutral-200 px-5 py-4 hover:border-orange-300"
      >
        Change PIN
      </button>
    </SubPageLayout>
  );
}