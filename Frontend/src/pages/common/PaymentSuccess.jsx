import React from "react";
import { CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

const PaymentSuccess = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-center px-4">
      <div className="flex justify-center items-center flex-col shadow-md bg-white rounded-2xl p-10">
        <CheckCircle className="w-16 h-16 text-green-600 mb-4" />
        <h1 className="text-2xl font-bold text-green-700">Payment Successful!</h1>
        <p className="text-gray-600 mt-2">
          Thank you for your payment. Your booking has been confirmed 🎉
        </p>
        <button
          onClick={() => navigate("/customer/bookings")}
          className="mt-6 px-6 py-3 bg-green-500 text-white font-semibold uppercase rounded-md hover:bg-green-600 ease-in-out duration-300 cursor-pointer"
        >
          Go to My Bookings
        </button>
      </div>
    </div>
  );
};

export default PaymentSuccess;
