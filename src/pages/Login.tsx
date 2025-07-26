import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Shield, AlertTriangle, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import uciipLogo from '@/assets/uciip-professional-logo.png';

interface LoginFormData {
  emailOrUsername: string;
  password: string;
  rememberMe: boolean;
}

interface TwoFactorData {
  code: string;
  useBackupCode: boolean;
}

const Login = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [showTwoFactor, setShowTwoFactor] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [sessionWarning, setSessionWarning] = useState('');

  const loginForm = useForm<LoginFormData>({
    defaultValues: {
      emailOrUsername: '',
      password: '',
      rememberMe: false
    }
  });

  const twoFactorForm = useForm<TwoFactorData>({
    defaultValues: {
      code: '',
      useBackupCode: false
    }
  });

  const { watch: watchLogin } = loginForm;
  const emailOrUsername = watchLogin('emailOrUsername');
  const password = watchLogin('password');
  const isFormValid = emailOrUsername?.trim() && password?.trim();

  const handleLogin = async (data: LoginFormData) => {
    try {
      setLoginError('');
      
      // Simulate login API call
      console.log('Login attempt:', data);
      
      // Check for valid credentials
      if (data.emailOrUsername === 'yuva00raj@gmail.com' && data.password === '987654321') {
        setShowTwoFactor(true);
      } else {
        setLoginAttempts(prev => prev + 1);
        setLoginError('Invalid credentials. Please verify your username/email and password.');
        
        if (loginAttempts >= 2) {
          setIsLocked(true);
          setLoginError('Account temporarily locked due to multiple failed attempts. Please try again later or contact your administrator.');
        }
      }
    } catch (error) {
      setLoginError('Login failed. Please try again.');
    }
  };

  const handleTwoFactor = async (data: TwoFactorData) => {
    try {
      console.log('2FA verification:', data);
      // Check for valid 2FA code
      if (data.code === '917621') {
        setSessionWarning('Login successful. Redirecting...');
        setTimeout(() => {
          navigate('/page');
        }, 1500);
      } else {
        setLoginError('Invalid verification code. Please try again.');
      }
    } catch (error) {
      setLoginError('Invalid verification code. Please try again.');
    }
  };

  const handleForgotPassword = () => {
    console.log('Forgot password clicked');
    // This would trigger password reset for authorized accounts only
  };

  if (showTwoFactor) {
    return (
      <div className="min-h-screen bg-gradient-dark flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-8">
          {/* UCIIP Branding */}
          <div className="text-center space-y-4">
            <img 
              src={uciipLogo} 
              alt="UCIIP Logo" 
              className="mx-auto h-20 w-auto"
            />
            <div className="space-y-2">
              <h1 className="text-2xl font-cyber font-bold text-cyber-glow">
                UCIIP SECURE ACCESS
              </h1>
              <p className="text-cyber-glow font-mono text-sm animate-pulse-glow">
                FOR OFFICIAL USE ONLY
              </p>
            </div>
          </div>

          {/* Two-Factor Authentication */}
          <Card className="bg-card/50 border-cyber-glow/30 backdrop-blur-sm">
            <CardHeader className="text-center space-y-2">
              <Shield className="mx-auto h-12 w-12 text-cyber-glow" />
              <h2 className="text-xl font-semibold text-foreground">Two-Factor Authentication</h2>
              <p className="text-sm text-muted-foreground">
                Enter the verification code from your authenticator app or SMS
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={twoFactorForm.handleSubmit(handleTwoFactor)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="code" className="text-foreground">
                    Verification Code
                  </Label>
                  <Input
                    {...twoFactorForm.register('code')}
                    id="code"
                    type="text"
                    placeholder="Enter 6-digit code"
                    className="text-center text-lg tracking-widest font-mono"
                    maxLength={6}
                    autoComplete="one-time-code"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    {...twoFactorForm.register('useBackupCode')}
                    id="backup-code"
                  />
                  <Label htmlFor="backup-code" className="text-sm text-muted-foreground">
                    Use backup code instead
                  </Label>
                </div>

                {loginError && (
                  <Alert className="border-destructive/50 bg-destructive/10">
                    <AlertTriangle className="h-4 w-4 text-destructive" />
                    <AlertDescription className="text-destructive">
                      {loginError}
                    </AlertDescription>
                  </Alert>
                )}

                {sessionWarning && (
                  <Alert className="border-cyber-glow/50 bg-cyber-glow/10">
                    <Shield className="h-4 w-4 text-cyber-glow" />
                    <AlertDescription className="text-cyber-glow">
                      {sessionWarning}
                    </AlertDescription>
                  </Alert>
                )}

                <Button
                  type="submit"
                  variant="cyber"
                  className="w-full"
                  disabled={!twoFactorForm.watch('code')}
                >
                  <Lock className="mr-2 h-4 w-4" />
                  Verify & Login
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  className="w-full text-muted-foreground"
                  onClick={() => setShowTwoFactor(false)}
                >
                  Back to Login
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-dark flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        {/* UCIIP Branding */}
        <div className="text-center space-y-4">
          <img 
            src={uciipLogo} 
            alt="UCIIP Logo" 
            className="mx-auto h-20 w-auto"
            role="img"
            aria-label="UCIIP Official Logo"
          />
          <div className="space-y-2">
            <h1 className="text-2xl font-cyber font-bold text-cyber-glow">
              UCIIP SECURE ACCESS
            </h1>
            <p className="text-cyber-glow font-mono text-sm animate-pulse-glow">
              FOR OFFICIAL USE ONLY
            </p>
          </div>
        </div>

        {/* Login Form */}
        <Card className="bg-card/50 border-cyber-glow/30 backdrop-blur-sm">
          <CardHeader className="text-center">
            <h2 className="text-xl font-semibold text-foreground">Authorized Personnel Only</h2>
            <p className="text-sm text-muted-foreground">
              Please enter your credentials to access the system
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="emailOrUsername" className="text-foreground">
                  Username or Email
                </Label>
                <Input
                  {...loginForm.register('emailOrUsername')}
                  id="emailOrUsername"
                  type="text"
                  placeholder="Enter your username or email"
                  autoComplete="username"
                  disabled={isLocked}
                  aria-describedby="email-username-help"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-foreground">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    {...loginForm.register('password')}
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    disabled={isLocked}
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLocked}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    {...loginForm.register('rememberMe')}
                    id="remember-me"
                    disabled={isLocked}
                  />
                  <Label htmlFor="remember-me" className="text-sm text-muted-foreground">
                    Remember me (policy permitting)
                  </Label>
                </div>
                <Button
                  type="button"
                  variant="link"
                  className="text-cyber-glow text-sm p-0 h-auto"
                  onClick={handleForgotPassword}
                  disabled={isLocked}
                >
                  Forgot Password?
                </Button>
              </div>

              {loginError && (
                <Alert className="border-destructive/50 bg-destructive/10">
                  <AlertTriangle className="h-4 w-4 text-destructive" />
                  <AlertDescription className="text-destructive">
                    {loginError}
                  </AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                variant={isFormValid ? "cyberActive" : "cyber"}
                className="w-full transition-all duration-300"
                disabled={!isFormValid || isLocked}
              >
                <Lock className="mr-2 h-4 w-4" />
                {isFormValid ? "SECURE LOGIN" : "SECURE LOGIN"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Security Warning */}
        <Card className="bg-card/30 border-cyber-warning/50">
          <CardContent className="pt-4">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="h-5 w-5 text-cyber-warning mt-0.5 flex-shrink-0" />
              <div className="space-y-2 text-sm">
                <p className="text-cyber-warning font-medium">
                  SECURITY NOTICE
                </p>
                <p className="text-muted-foreground">
                  All access is logged and monitored. Unauthorized access is prohibited 
                  and may be prosecuted to the full extent of the law.
                </p>
                <Button
                  variant="link"
                  className="text-cyber-glow text-xs p-0 h-auto"
                >
                  View Usage Policy & Terms
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Session Info */}
        <div className="text-center text-xs text-muted-foreground space-y-1">
          <p>Sessions expire after 30 minutes of inactivity</p>
          <p>No self-registration • Authorized personnel only</p>
        </div>
      </div>
    </div>
  );
};

export default Login;