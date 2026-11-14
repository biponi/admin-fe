import { useState } from "react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import useLoginAuth from "./hooks/useLoginAuth";
import { BrandLogo } from "../../assets/brand";
import { BRAND_CONFIG } from "../../config/brand";
import { Eye, EyeOff } from "lucide-react";
import { ButtonLoadingText } from "@/components/loaders";
import topBarBg from "../../assets/top-bar-bg-3.jpg";

const SignIn = () => {
  const [username, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { login, loading } = useLoginAuth();

  return (
    <div className='grid min-h-screen w-full lg:grid-cols-2'>
      {/* Image banner — mobile, text centered over the image */}
      <div className='relative flex h-56 flex-col items-center justify-center gap-2 px-6 text-center text-white sm:h-64 lg:hidden'>
        <img
          src={topBarBg}
          alt={`${BRAND_CONFIG.name} background`}
          className='absolute inset-0 h-full w-full object-cover'
        />
        <div className='absolute inset-0 bg-black/40' />
        <div className='relative z-10 flex flex-col items-center gap-3'>
          <img
            src={BrandLogo}
            alt={`${BRAND_CONFIG.shortName} Logo`}
            className='h-12 w-12 object-contain drop-shadow'
          />
          <p className='text-xl font-semibold leading-tight'>
            Welcome back to {BRAND_CONFIG.name}
          </p>
          <p className='text-sm text-white/80'>
            Sign in to manage your account.
          </p>
        </div>
      </div>

      {/* Image panel — left side */}
      <div className='relative hidden lg:block'>
        <img
          src={topBarBg}
          alt={`${BRAND_CONFIG.name} background`}
          className='absolute inset-0 h-full w-full object-cover'
        />
        <div className='absolute inset-0 bg-black/40 border-r-4 border-gray-200 backdrop-blur-[2px]' />
        <div className='relative z-10 flex h-full flex-col justify-between p-10 text-white'>
          <div className='flex items-center gap-3'>
            <img
              src={BrandLogo}
              alt={`${BRAND_CONFIG.shortName} Logo`}
              className='h-10 w-10 object-contain drop-shadow'
            />
            <span className='text-lg font-semibold tracking-tight text-white drop-shadow'>
              {BRAND_CONFIG.name}
            </span>
          </div>
          <div className='space-y-2 text-white drop-shadow'>
            <p className='text-2xl font-semibold leading-tight'>
              Welcome back to {BRAND_CONFIG.name}
            </p>
            <p className='text-sm text-white/80'>
              Sign in to manage your account.
            </p>
          </div>
        </div>
      </div>

      {/* Form panel — right side */}
      <div className='flex flex-1 flex-col items-center justify-center gap-6 bg-background p-6 md:p-10 mobile:pt-[max(2rem,env(safe-area-inset-top))]'>
        <div className='w-full max-w-sm'>
          <form
            className='flex flex-col gap-6'
            onSubmit={(e) => {
              e.preventDefault();
              login(username, password);
            }}>
            <div className='flex flex-col items-start gap-2'>
              <h1 className='text-2xl font-semibold tracking-tight'>Login</h1>
              <p className='text-balance text-sm text-muted-foreground'>
                Welcome back! Please sign in to your account.
              </p>
            </div>

            {/* Email/Phone field */}
            <div className='grid gap-2'>
              <Label htmlFor='email'>Email or Phone</Label>
              <Input
                id='email'
                type='text'
                value={username}
                placeholder='Enter your email or phone number'
                onChange={(e) => setUserName(e.target.value)}
                required
              />
            </div>

            {/* Password field */}
            <div className='grid gap-2'>
              <div className='flex items-center justify-between'>
                <Label htmlFor='password'>Password</Label>
                <button
                  type='button'
                  className='text-sm text-muted-foreground hover:text-primary underline-offset-4 hover:underline'
                  tabIndex={-1}>
                  Forgot password?
                </button>
              </div>
              <div className='relative'>
                <Input
                  id='password'
                  type={showPassword ? "text" : "password"}
                  value={password}
                  placeholder='Enter your password'
                  onChange={(e) => setPassword(e.target.value)}
                  className='pr-10'
                  required
                />
                <button
                  type='button'
                  onClick={() => setShowPassword(!showPassword)}
                  className='absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground transition-colors'
                  tabIndex={-1}>
                  {showPassword ? (
                    <EyeOff className='h-4 w-4' />
                  ) : (
                    <Eye className='h-4 w-4' />
                  )}
                </button>
              </div>
            </div>

            <Button
              type='submit'
              className='w-full'
              disabled={loading || !username || !password}>
              {loading ? (
                <ButtonLoadingText text='Signing in…' />
              ) : (
                "Login"
              )}
            </Button>
          </form>

          <div className='mt-6 text-center text-sm'>
            Need help?{" "}
            <button
              type='button'
              className='font-medium text-primary underline-offset-4 hover:underline'>
              Contact support
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
