import { useState, FormEvent } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Mail, 
  ArrowLeft,
  Send,
  CheckCircle,
  Package,
  Shield,
  Key
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { GradientButton } from '@/components/ui/GradientButton';
import { ThemeToggle } from '@/components/ui/Themetoggle';
import { ROUTES } from '@/config/constants';

export const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate sending reset email
    setTimeout(() => {
      setLoading(false);
      setEmailSent(true);
    }, 2000);
  };

  const handleResend = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 1500);
  };

  // Floating particles
  const particles = Array.from({ length: 12 }, (_, i) => ({
    id: i,
    size: Math.random() * 4 + 2,
    x: Math.random() * 100,
    y: Math.random() * 100,
    duration: Math.random() * 10 + 10,
    delay: Math.random() * 5,
  }));

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-neutral-50 dark:bg-neutral-900 p-6">
      {/* Theme Toggle - Fixed Position */}
      <div className="fixed top-6 right-6 z-50">
        <ThemeToggle />
      </div>

      {/* Animated Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-100 via-indigo-50 to-purple-100 dark:from-primary-900 dark:via-indigo-900 dark:to-purple-900 opacity-50">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNnoiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLW9wYWNpdHk9Ii4wNSIgc3Ryb2tlLXdpZHRoPSIyIi8+PC9nPjwvc3ZnPg==')] opacity-20" />
      </div>

      {/* Floating Particles */}
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full bg-white/20 dark:bg-white/10 backdrop-blur-sm"
          style={{
            width: particle.size,
            height: particle.size,
            left: `${particle.x}%`,
            top: `${particle.y}%`,
          }}
          animate={{
            y: [0, -30, 0],
            x: [0, 15, 0],
            opacity: [0.2, 0.5, 0.2],
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-6"
        >
          <Link to={ROUTES.LOGIN}>
            <Button
              variant="ghost"
              icon={<ArrowLeft className="w-4 h-4" />}
              className="text-neutral-700 dark:text-white hover:bg-neutral-100 dark:hover:bg-white/10"
            >
              Back to Login
            </Button>
          </Link>
        </motion.div>

        {/* Glassmorphism Card */}
        <div className="bg-white/90 dark:bg-neutral-800/90 backdrop-blur-2xl rounded-3xl shadow-2xl border border-neutral-200 dark:border-white/20 p-8 sm:p-10">
          {!emailSent ? (
            // Request Reset Form
            <>
              {/* Header */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-center mb-8"
              >
                <motion.div
                  animate={{
                    rotate: [0, 10, -10, 0],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                  className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-purple-600 mb-4 shadow-lg shadow-primary-500/30"
                >
                  <Key className="w-8 h-8 text-white" />
                </motion.div>
                <h2 className="text-3xl font-bold text-neutral-800 dark:text-white mb-2">
                  Forgot Password?
                </h2>
                <p className="text-neutral-600 dark:text-neutral-300">
                  No worries! Enter your email and we'll send you reset instructions.
                </p>
              </motion.div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <label className="block text-sm font-semibold text-neutral-700 dark:text-white mb-2">
                    Email Address
                  </label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400 group-focus-within:text-primary-400 transition-colors" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 bg-white dark:bg-neutral-700 border-2 border-neutral-200 dark:border-neutral-600 rounded-xl focus:border-primary-400 dark:focus:border-primary-400 focus:outline-none transition-colors text-neutral-800 dark:text-white placeholder-neutral-400"
                      placeholder="you@example.com"
                      required
                    />
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <GradientButton
                    type="submit"
                    gradient="primary"
                    size="lg"
                    loading={loading}
                    glow={true}
                    className="w-full"
                    icon={<Send className="w-5 h-5" />}
                  >
                    {loading ? 'Sending...' : 'Send Reset Link'}
                  </GradientButton>
                </motion.div>
              </form>

              {/* Info Box */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-8 p-4 bg-primary-500/10 dark:bg-primary-500/20 border border-primary-500/20 rounded-xl"
              >
                <div className="flex gap-3">
                  <Shield className="w-5 h-5 text-primary-500 dark:text-primary-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-neutral-800 dark:text-white font-semibold mb-1">
                      Secure Process
                    </h4>
                    <p className="text-sm text-neutral-600 dark:text-neutral-300">
                      The reset link will expire in 1 hour for your security.
                      If you don't see the email, check your spam folder.
                    </p>
                  </div>
                </div>
              </motion.div>
            </>
          ) : (
            // Email Sent Confirmation
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-success to-success-light mb-6 shadow-lg shadow-success/30">
                <CheckCircle className="w-10 h-10 text-white" />
              </div>

              <h2 className="text-3xl font-bold text-neutral-800 dark:text-white mb-3">
                Check your email!
              </h2>
              <p className="text-neutral-600 dark:text-neutral-300 mb-4">
                We've sent a password reset link to
              </p>
              <p className="text-lg font-semibold text-primary-600 dark:text-primary-400 mb-8">
                {email}
              </p>

              <div className="p-6 bg-neutral-100 dark:bg-neutral-700 rounded-xl mb-8">
                <p className="text-sm text-neutral-600 dark:text-neutral-300">
                  Didn't receive the email? Check your spam folder or{' '}
                  <button
                    onClick={handleResend}
                    disabled={loading}
                    className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-semibold disabled:opacity-50"
                  >
                    {loading ? 'Sending...' : 'click to resend'}
                  </button>
                </p>
              </div>

              <Link to={ROUTES.LOGIN}>
                <Button
                  variant="outline"
                  icon={<ArrowLeft className="w-4 h-4" />}
                  className="w-full"
                >
                  Back to Login
                </Button>
              </Link>
            </motion.div>
          )}
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