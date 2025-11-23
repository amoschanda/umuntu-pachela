import { useEffect } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "@getmocha/users-service/react";
import { Loader2 } from "lucide-react";

export default function AuthCallback() {
  const { exchangeCodeForSessionToken } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    handleCallback();
  }, []);

  const handleCallback = async () => {
    try {
      await exchangeCodeForSessionToken();
      navigate("/");
    } catch (error) {
      console.error("Error exchanging code:", error);
      navigate("/");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100">
      <div className="text-center">
        <Loader2 className="w-12 h-12 text-amber-600 animate-spin mx-auto mb-4" />
        <p className="text-gray-700">Completing sign in...</p>
      </div>
    </div>
  );
}
