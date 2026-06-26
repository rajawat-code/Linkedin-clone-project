import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import API from '../api/axios';
import toast from 'react-hot-toast';
import { Loader2 } from 'lucide-react';

export default function ForgotPasswordPage() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const res = await API.post('/auth/forgot-password', { email: data.email });
      toast.success(res.data.message || 'Reset link sent to your email!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <h1 className="text-3xl font-extrabold text-linkedin-blue flex items-center justify-center gap-1 font-sans">
          Linked<span className="bg-linkedin-blue text-white px-1.5 py-0.5 rounded font-black">in</span>
        </h1>
        <h2 className="mt-6 text-2xl font-bold text-gray-900">Forgot Password</h2>
        <p className="mt-2 text-sm text-gray-600">
          Enter your email and we'll send you a link to reset your password.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-gray-200">
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email address</label>
              <div className="mt-1">
                <input
                  type="email"
                  {...register('email', { required: 'Email is required' })}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-linkedin-blue focus:border-linkedin-blue sm:text-sm"
                />
                {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-full shadow-sm text-sm font-semibold text-white bg-linkedin-blue hover:bg-linkedin-blue-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-linkedin-blue disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {loading ? <Loader2 className="animate-spin h-5 w-5" /> : 'Send reset link'}
              </button>
            </div>

            <div className="text-center mt-4">
              <Link to="/login" className="font-semibold text-linkedin-blue hover:text-linkedin-blue-hover text-sm hover:underline">
                Back to Sign in
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
