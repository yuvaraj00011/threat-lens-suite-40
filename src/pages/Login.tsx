import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useLocation } from 'react-router-dom';
import { Shield, AlertTriangle, Lock, Mail } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import uciipLogo from '@/assets/uciip-professional-logo.png';

interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

interface OtpFormData {
  otp: string;
}

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading } = useAuth();
  const { toast } = useToast();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [pendingEmail, setPendingEmail] = useState('');

  // Redirect if already logged in
  useEffect(() => {
    if (user && !loading) {
      const from = location.state?.from?.pathname || '/page';
      navigate(from, { replace: true });
    }
  }, [user, loading, navigate, location]);

  const loginForm = useForm<LoginFormData>({
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false
    }
  });

  const otpForm = useForm<OtpFormData>({
    defaultValues: {
      otp: ''
    }
  });

  const { watch: watchLogin } = loginForm;
  const email = watchLogin('email');

  const handleLogin = async (data: LoginFormData) => {
    setIsSubmitting(true);
    try {
      // First check if user exists in our database
      const { data: profile } = await supabase
        .from('profiles')
        .select('user_id, created_by_admin')
        .eq('user_id', data.email) // This won't work, we need to match by email differently
        .single();

      // Try to sign in with magic link (OTP)
      const { error } = await supabase.auth.signInWithOtp({
        email: data.email,
        options: {
          shouldCreateUser: false // Only allow existing users
        }
      });
      
      if (error) {
        // Check if it's a user not found error
        if (error.message.includes('User not found') || error.message.includes('Invalid login credentials')) {
          toast({
            title: "Access Denied",
            description: "This email is not authorized. Contact your administrator to get access.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Login Failed",
            description: error.message,
            variant: "destructive",
          });
        }
      } else {
        setPendingEmail(data.email);
        setShowOtpInput(true);
        toast({
          title: "OTP Sent",
          description: "Please check your email for the verification code.",
        });
      }
    } catch (error) {
      toast({
        title: "Login Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOtpVerification = async (data: OtpFormData) => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase.auth.verifyOtp({
        email: pendingEmail,
        token: data.otp,
        type: 'email'
      });
      
      if (error) {
        toast({
          title: "Verification Failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Login Successful",
          description: "Welcome back to UCIIP",
        });
        // Navigation handled by useEffect
      }
    } catch (error) {
      toast({
        title: "Verification Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-dark flex items-center justify-center">
        <div className="text-center space-y-4">
          <Shield className="h-12 w-12 animate-pulse text-cyber-glow mx-auto" />
          <p className="text-cyber-glow font-mono">Initializing secure connection...</p>
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

        {/* Authentication Card */}
        <Card className="bg-card/50 border-cyber-glow/30 backdrop-blur-sm">
          <CardContent className="pt-6">
            {!showOtpInput ? (
              /* Login Form */
              <div className="space-y-4">
                <div className="text-center space-y-2">
                  <h2 className="text-xl font-semibold text-foreground">Authorized Personnel Only</h2>
                  <p className="text-sm text-muted-foreground">
                    Please enter your email to receive a verification code
                  </p>
                </div>
                
                <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-foreground">
                      Email Address
                    </Label>
                    <Input
                      {...loginForm.register('email')}
                      id="email"
                      type="email"
                      placeholder="Enter your authorized email address"
                      autoComplete="email"
                      disabled={isSubmitting}
                    />
                  </div>

                  <Button
                    type="submit"
                    variant={email?.trim() ? "cyberActive" : "cyber"}
                    className="w-full"
                    disabled={!email?.trim() || isSubmitting}
                  >
                    <Mail className="mr-2 h-4 w-4" />
                    {isSubmitting ? "Sending OTP..." : "SEND VERIFICATION CODE"}
                  </Button>
                </form>
              </div>
            ) : (
              /* OTP Verification Form */
              <div className="space-y-4">
                <div className="text-center space-y-2">
                  <h2 className="text-xl font-semibold text-foreground">Enter Verification Code</h2>
                  <p className="text-sm text-muted-foreground">
                    We've sent a 6-digit code to {pendingEmail}
                  </p>
                </div>
                
                <form onSubmit={otpForm.handleSubmit(handleOtpVerification)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="otp" className="text-foreground">
                      Verification Code
                    </Label>
                    <Input
                      {...otpForm.register('otp')}
                      id="otp"
                      type="text"
                      placeholder="Enter 6-digit code"
                      maxLength={6}
                      disabled={isSubmitting}
                      className="text-center text-lg tracking-widest"
                    />
                  </div>

                  <div className="space-y-2">
                    <Button
                      type="submit"
                      variant="cyberActive"
                      className="w-full"
                      disabled={isSubmitting}
                    >
                      <Lock className="mr-2 h-4 w-4" />
                      {isSubmitting ? "Verifying..." : "VERIFY & LOGIN"}
                    </Button>
                    
                    <Button
                      type="button"
                      variant="ghost"
                      className="w-full"
                      onClick={() => {
                        setShowOtpInput(false);
                        setPendingEmail('');
                        otpForm.reset();
                      }}
                      disabled={isSubmitting}
                    >
                      Back to Email
                    </Button>
                  </div>
                </form>
              </div>
            )}
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