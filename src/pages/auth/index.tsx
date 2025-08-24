import { useState } from "react";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import useLoginAuth from "./hooks/useLoginAuth";
import { ReloadIcon } from "@radix-ui/react-icons";
import { BiponiMainLogo } from "../../utils/contents";
import { Eye, EyeOff } from "lucide-react";

const SignIn = () => {
  const [username, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { login, loading } = useLoginAuth();

  return (
    <div className='min-h-screen w-full bg-gray-100 dark:bg-gray-950 flex items-center justify-center p-4 relative overflow-hidden'>
      {/* Subtle animated background pattern */}
      <div className='absolute inset-0 bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#1f1f1f_1px,transparent_1px),linear-gradient(to_bottom,#1f1f1f_1px,transparent_1px)] bg-[size:24px_24px] opacity-20 animate-pulse-slow'></div>

      {/* Floating geometric elements */}
      <div className='absolute inset-0 overflow-hidden'>
        <div className='absolute top-1/4 left-1/4 w-2 h-2 bg-gray-300/30 dark:bg-gray-700/30 rounded-full animate-float-1'></div>
        <div className='absolute top-1/3 right-1/4 w-1 h-1 bg-gray-400/20 dark:bg-gray-600/20 rounded-full animate-float-2'></div>
        <div className='absolute bottom-1/4 left-1/3 w-1.5 h-1.5 bg-gray-300/25 dark:bg-gray-700/25 rounded-full animate-float-3'></div>
        <div className='absolute bottom-1/3 right-1/3 w-1 h-1 bg-gray-400/30 dark:bg-gray-600/30 rounded-full animate-float-4'></div>
        <div className='absolute top-1/2 left-1/6 w-2 h-2 bg-gray-300/20 dark:bg-gray-700/20 rounded-full animate-float-5'></div>
        <div className='absolute top-3/4 right-1/6 w-1 h-1 bg-gray-400/25 dark:bg-gray-600/25 rounded-full animate-float-6'></div>
      </div>

      {/* Subtle gradient orbs */}
      <div className='absolute top-20 right-20 w-32 h-32 bg-gradient-to-br from-gray-200/10 to-gray-300/5 dark:from-gray-800/10 dark:to-gray-700/5 rounded-full blur-2xl animate-drift-1'></div>
      <div className='absolute bottom-20 left-20 w-40 h-40 bg-gradient-to-tr from-gray-100/15 to-gray-200/8 dark:from-gray-900/15 dark:to-gray-800/8 rounded-full blur-3xl animate-drift-2'></div>

      <div className='relative z-10 w-full max-w-md'>
        {/* Logo */}
        <div className='flex justify-center mb-12 animate-fade-in-down'>
          <div className='relative'>
            <img
              className='h-12 w-12 object-contain transition-transform duration-300 hover:scale-105'
              src={BiponiMainLogo}
              alt='Biponi Logo'
            />
          </div>
        </div>

        {/* Main Card */}
        <Card className='border border-gray-200 dark:border-gray-800 shadow-sm bg-white dark:bg-gray-900/80 backdrop-blur-sm animate-fade-in-up'>
          <CardHeader className='space-y-1 pb-8'>
            <CardTitle className='text-2xl font-semibold tracking-tight text-center text-gray-900 dark:text-white'>
              Sign in
            </CardTitle>
            <CardDescription className='text-center text-gray-600 dark:text-gray-400'>
              Welcome back! Please sign in to your account
            </CardDescription>
          </CardHeader>

          <CardContent className='space-y-6'>
            {/* Email/Phone Field */}
            <div className='space-y-2'>
              <Label
                htmlFor='email'
                className='text-sm font-medium text-gray-900 dark:text-gray-100'>
                Email or Phone
              </Label>
              <Input
                id='email'
                type='text'
                value={username}
                placeholder='Enter your email or phone number'
                onChange={(e) => setUserName(e.target.value)}
                className='h-11 bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 focus:border-gray-900 dark:focus:border-gray-300 focus:ring-0 transition-colors duration-200'
                required
              />
            </div>

            {/* Password Field */}
            <div className='space-y-2'>
              <Label
                htmlFor='password'
                className='text-sm font-medium text-gray-900 dark:text-gray-100'>
                Password
              </Label>
              <div className='relative'>
                <Input
                  id='password'
                  type={showPassword ? "text" : "password"}
                  value={password}
                  placeholder='Enter your password'
                  onChange={(e) => setPassword(e.target.value)}
                  className='h-11 bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 focus:border-gray-900 dark:focus:border-gray-300 focus:ring-0 transition-colors duration-200 pr-10'
                  required
                />
                <button
                  type='button'
                  onClick={() => setShowPassword(!showPassword)}
                  className='absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors'
                  tabIndex={-1}>
                  {showPassword ? (
                    <EyeOff className='h-4 w-4' />
                  ) : (
                    <Eye className='h-4 w-4' />
                  )}
                </button>
              </div>
            </div>

            {/* Forgot Password */}
            <div className='flex justify-end'>
              <button
                type='button'
                className='text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors duration-200'>
                Forgot password?
              </button>
            </div>
          </CardContent>

          <CardFooter className='pt-2'>
            <Button
              disabled={loading || !username || !password}
              className='w-full h-11 bg-gray-900 hover:bg-gray-800 dark:bg-gray-100 dark:hover:bg-gray-200 dark:text-gray-900 text-white font-medium transition-colors duration-200 disabled:opacity-50'
              onClick={() => {
                login(username, password);
              }}>
              {loading ? (
                <div className='flex items-center space-x-2'>
                  <ReloadIcon className='h-4 w-4 animate-spin' />
                  <span>Signing in...</span>
                </div>
              ) : (
                "Sign in"
              )}
            </Button>
          </CardFooter>
        </Card>

        {/* Footer */}
        <div className='mt-8 text-center'>
          <p className='text-sm text-gray-500 dark:text-gray-400'>
            Need help?{" "}
            <button
              type='button'
              className='text-gray-900 dark:text-gray-100 hover:underline font-medium transition-all duration-200'>
              Contact support
            </button>
          </p>
        </div>

        {/* Subtle accent line */}
        <div className='mt-12 flex justify-center'>
          <div className='w-12 h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-700 to-transparent'></div>
        </div>
      </div>

      <style>{`
        @keyframes float-1 {
          0%,
          100% {
            transform: translateY(0px) translateX(0px);
          }
          25% {
            transform: translateY(-10px) translateX(5px);
          }
          50% {
            transform: translateY(-5px) translateX(-3px);
          }
          75% {
            transform: translateY(-12px) translateX(2px);
          }
        }

        @keyframes float-2 {
          0%,
          100% {
            transform: translateY(0px) translateX(0px);
          }
          33% {
            transform: translateY(-8px) translateX(-4px);
          }
          66% {
            transform: translateY(-3px) translateX(6px);
          }
        }

        @keyframes float-3 {
          0%,
          100% {
            transform: translateY(0px) translateX(0px);
          }
          50% {
            transform: translateY(-15px) translateX(-8px);
          }
        }

        @keyframes float-4 {
          0%,
          100% {
            transform: translateY(0px) translateX(0px);
          }
          40% {
            transform: translateY(-6px) translateX(4px);
          }
          80% {
            transform: translateY(-12px) translateX(-2px);
          }
        }

        @keyframes float-5 {
          0%,
          100% {
            transform: translateY(0px) translateX(0px);
          }
          30% {
            transform: translateY(-18px) translateX(7px);
          }
          70% {
            transform: translateY(-8px) translateX(-5px);
          }
        }

        @keyframes float-6 {
          0%,
          100% {
            transform: translateY(0px) translateX(0px);
          }
          45% {
            transform: translateY(-10px) translateX(-6px);
          }
        }

        @keyframes drift-1 {
          0%,
          100% {
            transform: translateX(0px) translateY(0px) scale(1);
          }
          25% {
            transform: translateX(-20px) translateY(-15px) scale(1.1);
          }
          50% {
            transform: translateX(15px) translateY(-25px) scale(0.9);
          }
          75% {
            transform: translateX(-10px) translateY(10px) scale(1.05);
          }
        }

        @keyframes drift-2 {
          0%,
          100% {
            transform: translateX(0px) translateY(0px) scale(1);
          }
          30% {
            transform: translateX(25px) translateY(20px) scale(0.95);
          }
          60% {
            transform: translateX(-15px) translateY(-10px) scale(1.08);
          }
        }

        @keyframes pulse-slow {
          0%,
          100% {
            opacity: 0.15;
          }
          50% {
            opacity: 0.25;
          }
        }

        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fade-in-down {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-float-1 {
          animation: float-1 8s ease-in-out infinite;
        }

        .animate-float-2 {
          animation: float-2 6s ease-in-out infinite 1s;
        }

        .animate-float-3 {
          animation: float-3 7s ease-in-out infinite 2s;
        }

        .animate-float-4 {
          animation: float-4 5s ease-in-out infinite 0.5s;
        }

        .animate-float-5 {
          animation: float-5 9s ease-in-out infinite 3s;
        }

        .animate-float-6 {
          animation: float-6 4s ease-in-out infinite 1.5s;
        }

        .animate-drift-1 {
          animation: drift-1 20s ease-in-out infinite;
        }

        .animate-drift-2 {
          animation: drift-2 25s ease-in-out infinite 5s;
        }

        .animate-pulse-slow {
          animation: pulse-slow 4s ease-in-out infinite;
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out 0.3s both;
        }

        .animate-fade-in-down {
          animation: fade-in-down 0.6s ease-out both;
        }
      `}</style>
    </div>
  );
};

export default SignIn;
