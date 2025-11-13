import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { authService } from '@/services/auth.service';
import { 
  Mail, 
  CheckCircle2, 
  XCircle, 
  Loader2,
  ArrowRight,
  Clock,
  RefreshCw
} from 'lucide-react';
import { GradientButton } from '@/components/ui/GradientButton';
import { ROUTES } from '@/config/constants';
import toast from 'react-hot-toast';

type VerificationStatus = 'pending' | 'verifying' | 'success' | 'error' | 'expired';

export const VerifyEmailPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<VerificationStatus>('pending');
  const [email, setEmail] = useState('');
  const [resending, setResending] = useState(false);
  
  const token = searchParams.get('token');

  useEffect(() => {
    if (token) {
      verifyEmail(token);
    }
  }, [token]);

  const verifyEmail = async (verificationToken: string) => {
    setStatus('verifying');
    
    try {
      const response = await authService.verifyEmail(verificationToken);
      setStatus('success');
      toast.success('Email verified successfully!');
      
      // Auto redirect to login after 3 seconds
      setTimeout(() => {
        navigate(ROUTES.LOGIN);
      }, 3000);
    } catch (error: any) {
      console.error('Email verification error:', error);
      const errorMessage = error.response?.data?.message || 'Verification failed';
      
      if (errorMessage.includes('expired')) {
        setStatus('expired');
      } else {
        setStatus('error');
      }
      
      toast.error(errorMessage);
    }
  };

  const handleResendEmail = async () => {
    if (!email) {
      toast.error('Please enter your email address');
      return;
    }

    setResending(true);
    
    try {
      // You'll need to add this endpoint to your authService
      await authService.resendVerificationEmail(email);
      toast.success('Verification email sent! Please check your inbox.');
    } catch (error: any) {
      console.error('Resend error:', error);
      toast.error(error.response?.data?.message || 'Failed to resend email');
    } finally {
      setResending(false);
    }
  };

  const renderContent = () => {
    switch (status) {
      case 'pending':
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 mb-6 shadow-3d-xl">
              <Mail className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-3">
              Verify Your Email
            </h2>
            <p className="text-neutral-300 mb-8">
              We've sent a verification email to your inbox. Click the link in the email to verify your account.
            </p>
            
            <div className="text-left space-y-3 p-6 bg-white/5 rounded-xl border border-white/10">
              <h4 className="text-white font-semibold mb-3">Next Steps:</h4>
              {[
                'Check your email inbox (and spam folder)',
                'Click the verification link in the email',
                'You will be redirected automatically',
                'Sign in with your credentials',
              ].map((step, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + i * 0.1 }}
                  className="flex items-start gap-3"
                >
                  <div className="w-6 h-6 rounded-full bg-primary-500/20 text-primary-400 flex items-center justify-center text-sm font-bold flex-shrink-0">
                    {i + 1}
                  </div>
                  <p className="text-neutral-300 text-sm">{step}</p>
                </motion.div>
              ))}
            </div>

            <div className="mt-8">
              <p className="text-neutral-400 text-sm mb-4">
                Didn't receive the email?
              </p>
              <div className="flex gap-3">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-glass flex-1 px-4 py-3 text-white placeholder-neutral-500"
                  placeholder="your@email.com"
                />
                <GradientButton
                  onClick={handleResendEmail}
                  gradient="primary"
                  loading={resending}
                  icon={<RefreshCw className="w-4 h-4" />}
                >
                  Resend
                </GradientButton>
              </div>
            </div>
          </motion.div>
        );

      case 'verifying':
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center"
          >
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 mb-6 shadow-3d-xl">
              <Loader2 className="w-10 h-10 text-white animate-spin" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-3">
              Verifying Your Email...
            </h2>
            <p className="text-neutral-300">
              Please wait while we verify your email address.
            </p>
          </motion.div>
        );

      case 'success':
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{
                type: 'spring',
                stiffness: 200,
                damping: 15,
              }}
              className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-success to-success-light mb-6 shadow-3d-xl"
            >
              <CheckCircle2 className="w-10 h-10 text-white" />
            </motion.div>

            <h2 className="text-3xl font-bold text-white mb-3">
              Email Verified Successfully! 🎉
            </h2>
            <p className="text-neutral-300 mb-8">
              Your email has been verified. You can now sign in to your account.
            </p>

            <div className="p-6 bg-success/10 border border-success/20 rounded-xl mb-8">
              <div className="flex items-center justify-center gap-2 text-success mb-2">
                <CheckCircle2 className="w-5 h-5" />
                <span className="font-semibold">Account Activated</span>
              </div>
              <p className="text-neutral-300 text-sm">
                Redirecting you to login page in a few seconds...
              </p>
            </div>

            <GradientButton
              onClick={() => navigate(ROUTES.LOGIN)}
              gradient="primary"
              size="lg"
              glow={true}
              icon={<ArrowRight className="w-5 h-5" />}
              className="w-full"
            >
              Continue to Login
            </GradientButton>
          </motion.div>
        );

      case 'expired':
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-warning to-warning-light mb-6 shadow-3d-xl">
              <Clock className="w-10 h-10 text-white" />
            </div>

            <h2 className="text-3xl font-bold text-white mb-3">
              Verification Link Expired
            </h2>
            <p className="text-neutral-300 mb-8">
              This verification link has expired. Please request a new one.
            </p>

            <div className="p-6 bg-warning/10 border border-warning/20 rounded-xl mb-8">
              <p className="text-neutral-300 text-sm">
                Verification links expire after 24 hours for security reasons.
                Enter your email below to receive a new verification link.
              </p>
            </div>

            <div className="flex gap-3 mb-4">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-glass flex-1 px-4 py-3 text-white placeholder-neutral-500"
                placeholder="your@email.com"
              />
              <GradientButton
                onClick={handleResendEmail}
                gradient="primary"
                loading={resending}
                icon={<RefreshCw className="w-4 h-4" />}
              >
                Resend
              </GradientButton>
            </div>

            <Link
              to={ROUTES.LOGIN}
              className="text-primary-400 hover:text-primary-300 text-sm transition-colors"
            >
              Back to Login
            </Link>
          </motion.div>
        );

      case 'error':
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-danger to-danger-light mb-6 shadow-3d-xl">
              <XCircle className="w-10 h-10 text-white" />
            </div>

            <h2 className="text-3xl font-bold text-white mb-3">
              Verification Failed
            </h2>
            <p className="text-neutral-300 mb-8">
              We couldn't verify your email. The link may be invalid or already used.
            </p>

            <div className="p-6 bg-danger/10 border border-danger/20 rounded-xl mb-8">
              <p className="text-neutral-300 text-sm">
                If you continue having issues, please contact support or try registering again.
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex gap-3">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-glass flex-1 px-4 py-3 text-white placeholder-neutral-500"
                  placeholder="your@email.com"
                />
                <GradientButton
                  onClick={handleResendEmail}
                  gradient="primary"
                  loading={resending}
                  icon={<RefreshCw className="w-4 h-4" />}
                >
                  Resend
                </GradientButton>
              </div>

              <Link
                to={ROUTES.REGISTER}
                className="block text-primary-400 hover:text-primary-300 text-sm transition-colors"
              >
                Register a new account
              </Link>
            </div>
          </motion.div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 flex items-center justify-center p-4">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-teal/10 rounded-full blur-3xl animate-pulse-slow animation-delay-2000" />
      </div>

      {/* Content Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-lg"
      >
        <div className="card-glass p-8 md:p-12 backdrop-blur-xl shadow-3d-xl border border-white/10">
          {renderContent()}
        </div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-6"
        >
          <p className="text-neutral-400 text-sm">
            Need help?{' '}
            <a
              href="#"
              className="text-primary-400 hover:text-primary-300 transition-colors font-medium"
            >
              Contact Support
            </a>
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};