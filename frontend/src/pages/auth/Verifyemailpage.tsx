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
  RefreshCw,
  Package
} from 'lucide-react';
import { GradientButton } from '@/components/ui/GradientButton';
import { ThemeToggle } from '@/components/ui/Themetoggle';
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
      console.error('Resend email error:', error);
      toast.error(error.response?.data?.message || 'Failed to resend email');
    } finally {
      setResending(false);
    }
  };

  // Floating particles
  const particles = Array.from({ length: 15 }, (_, i) => ({
    id: i,
    size: Math.random() * 4 + 2,
    x: Math.random() * 100,
    y: Math.random() * 100,
    duration: Math.random() * 10 + 10,
    delay: Math.random() * 5,
  }));

  const renderContent = () => {
    switch (status) {
      case 'pending':
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-primary-500 to-purple-500 mb-6 shadow-lg shadow-primary-500/30">
              <Mail className="w-10 h-10 text-white" />
            </div>

            <h2 className="text-3xl font-bold text-neutral-800 dark:text-white mb-3">
              Check your inbox
            </h2>
            <p className="text-neutral-600 dark:text-neutral-300 mb-8">
              We've sent a verification link to your email address.
              Click the link to verify your account.
            </p>

            <div className="p-6 bg-primary-500/10 dark:bg-primary-500/20 border border-primary-500/20 rounded-xl mb-8">
              <p className="text-neutral-700 dark:text-neutral-300 text-sm">
                Didn't receive the email? Check your spam folder or request a new verification link below.
              </p>
            </div>

            <div className="flex gap-3 mb-4">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 px-4 py-3 bg-white dark:bg-neutral-700 border-2 border-neutral-200 dark:border-neutral-600 rounded-xl focus:border-primary-400 dark:focus:border-primary-400 focus:outline-none transition-colors text-neutral-800 dark:text-white placeholder-neutral-400"
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
              className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 text-sm transition-colors"
            >
              Back to Login
            </Link>
          </motion.div>
        );

      case 'verifying':
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center"
          >
            <Loader2 className="w-16 h-16 text-primary-500 dark:text-primary-400 animate-spin mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-neutral-800 dark:text-white mb-2">
              Verifying your email...
            </h2>
            <p className="text-neutral-600 dark:text-neutral-300">
              Please wait while we verify your account.
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
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-success to-success-light mb-6 shadow-lg shadow-success/30">
              <CheckCircle2 className="w-10 h-10 text-white" />
            </div>

            <h2 className="text-3xl font-bold text-neutral-800 dark:text-white mb-3">
              Email Verified! 🎉
            </h2>
            <p className="text-neutral-600 dark:text-neutral-300 mb-8">
              Your email has been verified. You can now sign in to your account.
            </p>

            <div className="p-6 bg-success/10 dark:bg-success/20 border border-success/20 rounded-xl mb-8">
              <div className="flex items-center justify-center gap-2 text-success mb-2">
                <CheckCircle2 className="w-5 h-5" />
                <span className="font-semibold">Account Activated</span>
              </div>
              <p className="text-neutral-600 dark:text-neutral-300 text-sm">
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
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-warning to-warning-light mb-6 shadow-lg shadow-warning/30">
              <Clock className="w-10 h-10 text-white" />
            </div>

            <h2 className="text-3xl font-bold text-neutral-800 dark:text-white mb-3">
              Verification Link Expired
            </h2>
            <p className="text-neutral-600 dark:text-neutral-300 mb-8">
              This verification link has expired. Please request a new one.
            </p>

            <div className="p-6 bg-warning/10 dark:bg-warning/20 border border-warning/20 rounded-xl mb-8">
              <p className="text-neutral-700 dark:text-neutral-300 text-sm">
                Verification links expire after 24 hours for security reasons.
                Enter your email below to receive a new verification link.
              </p>
            </div>

            <div className="flex gap-3 mb-4">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 px-4 py-3 bg-white dark:bg-neutral-700 border-2 border-neutral-200 dark:border-neutral-600 rounded-xl focus:border-primary-400 dark:focus:border-primary-400 focus:outline-none transition-colors text-neutral-800 dark:text-white placeholder-neutral-400"
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
              className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 text-sm transition-colors"
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
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-danger to-danger-light mb-6 shadow-lg shadow-danger/30">
              <XCircle className="w-10 h-10 text-white" />
            </div>

            <h2 className="text-3xl font-bold text-neutral-800 dark:text-white mb-3">
              Verification Failed
            </h2>
            <p className="text-neutral-600 dark:text-neutral-300 mb-8">
              We couldn't verify your email. The link may be invalid or already used.
            </p>

            <div className="p-6 bg-danger/10 dark:bg-danger/20 border border-danger/20 rounded-xl mb-8">
              <p className="text-neutral-700 dark:text-neutral-300 text-sm">
                If you continue having issues, please contact support or try registering again.
              </p>
            </div>

            <div className="flex gap-3">
              <Link to={ROUTES.REGISTER} className="flex-1">
                <GradientButton
                  gradient="accent"
                  size="lg"
                  className="w-full"
                >
                  Register Again
                </GradientButton>
              </Link>
              <Link to={ROUTES.LOGIN} className="flex-1">
                <GradientButton
                  gradient="primary"
                  size="lg"
                  className="w-full"
                >
                  Back to Login
                </GradientButton>
              </Link>
            </div>
          </motion.div>
        );
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-neutral-50 dark:bg-neutral-900 p-6">
      {/* Theme Toggle - Fixed Position */}
      <div className="fixed top-6 right-6 z-50">
        <ThemeToggle />
      </div>

      {/* Animated Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-100 via-purple-50 to-accent-teal/10 dark:from-primary-900 dark:via-purple-900 dark:to-accent-teal/20 opacity-50">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNnoiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLW9wYWNpdHk9Ii4wNSIgc3Ryb2tlLXdpZHRoPSIyIi8+PC9nPjwvc3ZnPg==')] opacity-20" />
      </div>

      {/* Floating Particles */}
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full bg-white/20 dark:bg-primary-400/20"
          style={{
            width: particle.size,
            height: particle.size,
            left: `${particle.x}%`,
            top: `${particle.y}%`,
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [0.2, 0.5, 0.2],
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            delay: particle.delay,
          }}
        />
      ))}

      {/* Content Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="bg-white/90 dark:bg-neutral-800/90 backdrop-blur-2xl rounded-3xl shadow-2xl border border-neutral-200 dark:border-white/20 p-8 sm:p-10">
          {renderContent()}
        </div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-8 flex items-center justify-center gap-3"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-purple-500 flex items-center justify-center">
            <Package className="w-5 h-5 text-white" />
          </div>
          <div className="text-left">
            <h3 className="font-bold text-neutral-800 dark:text-white">StockFlow</h3>
            <p className="text-xs text-neutral-600 dark:text-neutral-400">Management System</p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};