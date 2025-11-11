import React from "react";
import { XCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

const PaymentFailed = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-red-50 text-center px-4">
      <XCircle className="w-16 h-16 text-red-600 mb-4" />
      <h1 className="text-2xl font-bold text-red-700">Payment Cancelled</h1>
      <p className="text-gray-600 mt-2">
        Your payment was cancelled. You can try again anytime.
      </p>
      <button
        onClick={() => navigate("/services")}
        className="mt-6 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
      >
        Back to Services
      </button>
    </div>
  );
};

export default PaymentFailed;
