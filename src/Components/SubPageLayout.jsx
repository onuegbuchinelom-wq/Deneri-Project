import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";

export default function SubPageLayout({ title, children }) {
  const navigate = useNavigate();
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-8 py-6 sm:py-8">
      <div className="flex items-center gap-3 mb-8">
        <button onClick={() => navigate(-1)} className="text-neutral-500 hover:text-neutral-700">
          <ChevronLeft size={22} />
        </button>
        <h1 className="text-xl font-bold text-neutral-900">{title}</h1>
      </div>
      {children}
    </div>
  );
}