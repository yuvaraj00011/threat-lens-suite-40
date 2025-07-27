import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Eye, EyeOff, Shield, AlertTriangle, Lock, UserPlus, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import uciipLogo from '@/assets/uciip-professional-logo.png';

interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

interface SignUpFormData {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  department: string;
  badgeNumber: string;
}

interface ForgotPasswordData {
  email: string;
}

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn, signUp, resetPassword, user, loading } = useAuth();
  const { toast } = useToast();
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('login');

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

  const signUpForm = useForm<SignUpFormData>({
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      firstName: '',
      lastName: '',
      department: '',
      badgeNumber: ''
    }
  });

  const forgotPasswordForm = useForm<ForgotPasswordData>({
    defaultValues: {
      email: ''
    }
  });

  const { watch: watchLogin } = loginForm;
  const { watch: watchSignUp } = signUpForm;
  const email = watchLogin('email');
  const password = watchLogin('password');
  const signUpPassword = watchSignUp('password');
  const confirmPassword = watchSignUp('confirmPassword');
  const isLoginFormValid = email?.trim() && password?.trim();
  const isSignUpFormValid = signUpPassword?.trim() && confirmPassword?.trim() && signUpPassword === confirmPassword;

  const handleLogin = async (data: LoginFormData) => {
    setIsSubmitting(true);
    try {
      const { error } = await signIn(data.email, data.password);
      
      if (error) {
        toast({
          title: "Login Failed",
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
        title: "Login Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignUp = async (data: SignUpFormData) => {
    if (data.password !== data.confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Passwords do not match. Please try again.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await signUp(data.email, data.password, {
        first_name: data.firstName,
        last_name: data.lastName,
        display_name: `${data.firstName} ${data.lastName}`,
        department: data.department,
        badge_number: data.badgeNumber,
      });
      
      if (error) {
        toast({
          title: "Registration Failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Registration Successful",
          description: "Please check your email to verify your account.",
        });
        setActiveTab('login');
      }
    } catch (error) {
      toast({
        title: "Registration Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPassword = async (data: ForgotPasswordData) => {
    setIsSubmitting(true);
    try {
      const { error } = await resetPassword(data.email);
      
      if (error) {
        toast({
          title: "Reset Failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Reset Email Sent",
          description: "Please check your email for reset instructions.",
        });
        setActiveTab('login');
      }
    } catch (error) {
      toast({
        title: "Reset Error",
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

        {/* Authentication Tabs */}
        <Card className="bg-card/50 border-cyber-glow/30 backdrop-blur-sm">
          <CardContent className="pt-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="signup">Register</TabsTrigger>
                <TabsTrigger value="forgot">Reset Password</TabsTrigger>
              </TabsList>

              {/* Login Tab */}
              <TabsContent value="login" className="space-y-4">
                <div className="text-center space-y-2">
                  <h2 className="text-xl font-semibold text-foreground">Authorized Personnel Only</h2>
                  <p className="text-sm text-muted-foreground">
                    Please enter your credentials to access the system
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
                      placeholder="Enter your email address"
                      autoComplete="email"
                      disabled={isSubmitting}
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
                        disabled={isSubmitting}
                        className="pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={isSubmitting}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      {...loginForm.register('rememberMe')}
                      id="remember-me"
                      disabled={isSubmitting}
                    />
                    <Label htmlFor="remember-me" className="text-sm text-muted-foreground">
                      Remember me (policy permitting)
                    </Label>
                  </div>

                  <Button
                    type="submit"
                    variant={isLoginFormValid ? "cyberActive" : "cyber"}
                    className="w-full"
                    disabled={!isLoginFormValid || isSubmitting}
                  >
                    <Lock className="mr-2 h-4 w-4" />
                    {isSubmitting ? "Authenticating..." : "SECURE LOGIN"}
                  </Button>
                </form>
              </TabsContent>

              {/* Sign Up Tab */}
              <TabsContent value="signup" className="space-y-4">
                <div className="text-center space-y-2">
                  <h2 className="text-xl font-semibold text-foreground">Create Account</h2>
                  <p className="text-sm text-muted-foreground">
                    Register for authorized system access
                  </p>
                </div>
                
                <form onSubmit={signUpForm.handleSubmit(handleSignUp)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName" className="text-foreground">
                        First Name
                      </Label>
                      <Input
                        {...signUpForm.register('firstName')}
                        id="firstName"
                        placeholder="First name"
                        disabled={isSubmitting}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName" className="text-foreground">
                        Last Name
                      </Label>
                      <Input
                        {...signUpForm.register('lastName')}
                        id="lastName"
                        placeholder="Last name"
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signupEmail" className="text-foreground">
                      Email Address
                    </Label>
                    <Input
                      {...signUpForm.register('email')}
                      id="signupEmail"
                      type="email"
                      placeholder="Enter your email address"
                      autoComplete="email"
                      disabled={isSubmitting}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="department" className="text-foreground">
                        Department
                      </Label>
                      <Input
                        {...signUpForm.register('department')}
                        id="department"
                        placeholder="Department"
                        disabled={isSubmitting}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="badgeNumber" className="text-foreground">
                        Badge Number
                      </Label>
                      <Input
                        {...signUpForm.register('badgeNumber')}
                        id="badgeNumber"
                        placeholder="Badge #"
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signupPassword" className="text-foreground">
                      Password
                    </Label>
                    <div className="relative">
                      <Input
                        {...signUpForm.register('password')}
                        id="signupPassword"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Create a strong password"
                        autoComplete="new-password"
                        disabled={isSubmitting}
                        className="pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={isSubmitting}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-foreground">
                      Confirm Password
                    </Label>
                    <div className="relative">
                      <Input
                        {...signUpForm.register('confirmPassword')}
                        id="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="Confirm your password"
                        autoComplete="new-password"
                        disabled={isSubmitting}
                        className="pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        disabled={isSubmitting}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    variant={isSignUpFormValid ? "cyberActive" : "cyber"}
                    className="w-full"
                    disabled={!isSignUpFormValid || isSubmitting}
                  >
                    <UserPlus className="mr-2 h-4 w-4" />
                    {isSubmitting ? "Creating Account..." : "CREATE ACCOUNT"}
                  </Button>
                </form>
              </TabsContent>

              {/* Forgot Password Tab */}
              <TabsContent value="forgot" className="space-y-4">
                <div className="text-center space-y-2">
                  <h2 className="text-xl font-semibold text-foreground">Reset Password</h2>
                  <p className="text-sm text-muted-foreground">
                    Enter your email to receive reset instructions
                  </p>
                </div>
                
                <form onSubmit={forgotPasswordForm.handleSubmit(handleForgotPassword)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="resetEmail" className="text-foreground">
                      Email Address
                    </Label>
                    <Input
                      {...forgotPasswordForm.register('email')}
                      id="resetEmail"
                      type="email"
                      placeholder="Enter your email address"
                      autoComplete="email"
                      disabled={isSubmitting}
                    />
                  </div>

                  <Button
                    type="submit"
                    variant="cyber"
                    className="w-full"
                    disabled={isSubmitting}
                  >
                    <Mail className="mr-2 h-4 w-4" />
                    {isSubmitting ? "Sending..." : "SEND RESET EMAIL"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
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