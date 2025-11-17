import { useState, FormEvent } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '@/services/auth.service';
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  User,
  Building,
  Phone,
  ArrowRight,
  CheckCircle2,
  Package,
  Shield,
  Zap,
  Users
} from 'lucide-react';
import { GradientButton } from '@/components/ui/GradientButton';
import { ThemeToggle } from '@/components/ui/Themetoggle';
import { ROUTES } from '@/config/constants';
import toast from 'react-hot-toast';

export const RegisterPage = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // Multi-step form
  const [formData, setFormData] = useState({
    username: '',
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    terms: false,
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match!');
      return;
    }

    if (!formData.terms) {
      toast.error('Please accept the Terms of Service and Privacy Policy');
      return;
    }

    if (!validatePassword(formData.password)) {
      toast.error('Password does not meet requirements');
      return;
    }

    setLoading(true);
    
    try {
      // Call real backend API
      await authService.register({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
      });

      toast.success('Registration successful! Please verify your email.');
      
      // Redirect to verify email page instead of login
      navigate(ROUTES.VERIFY_EMAIL);
      
    } catch (error: any) {
      console.error('Registration error:', error);
      const message = error.response?.data?.message || 'Registration failed. Please try again.';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const validatePassword = (password: string): boolean => {
    return (
      password.length >= 8 &&
      /[A-Z]/.test(password) &&
      /[0-9]/.test(password) &&
      /[!@#$%^&*]/.test(password)
    );
  };

  const nextStep = () => {
    // Validate Step 1
    if (step === 1) {
      if (!formData.username || !formData.firstName || !formData.lastName || !formData.email) {
        toast.error('Please fill in all required fields');
        return;
      }
      
      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        toast.error('Please enter a valid email address');
        return;
      }
    }
    
    if (step < 2) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
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

  const benefits = [
    {
      icon: Shield,
      title: 'Secure & Protected',
      description: 'Enterprise-grade security for your data',
    },
    {
      icon: Zap,
      title: 'Lightning Fast',
      description: 'Optimized performance for your workflow',
    },
    {
      icon: Users,
      title: 'Team Collaboration',
      description: 'Work together seamlessly',
    },
  ];

  const passwordRequirements = [
    { met: formData.password.length >= 8, text: 'At least 8 characters' },
    { met: /[A-Z]/.test(formData.password), text: 'One uppercase letter' },
    { met: /[0-9]/.test(formData.password), text: 'One number' },
    { met: /[!@#$%^&*]/.test(formData.password), text: 'One special character' },
  ];

  return (
    <div className="relative min-h-screen flex overflow-hidden bg-neutral-50 dark:bg-neutral-900">
      {/* Theme Toggle - Fixed Position */}
      <div className="fixed top-6 right-6 z-50">
        <ThemeToggle />
      </div>

      {/* Animated Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-100 via-primary-50 to-accent-teal/10 dark:from-purple-900 dark:via-primary-900 dark:to-accent-teal/20 opacity-50">
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
            opacity: [0.2, 0.5, 0.2],
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            delay: particle.delay,
          }}
        />
      ))}

      {/* Left Side - Features & Testimonial */}
      <div className="hidden lg:flex lg:flex-1 relative z-10">
        <motion.div
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="flex flex-col justify-between p-12 w-full"
        >
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-500 via-purple-500 to-accent-teal flex items-center justify-center shadow-2xl">
              <Package className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-neutral-800 dark:text-white">StockFlow</h1>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">Management System</p>
            </div>
          </div>

          {/* Features Grid */}
          <div className="space-y-6">
            <h2 className="text-4xl font-bold text-neutral-800 dark:text-white mb-4">
              Join thousands of teams 🚀
            </h2>
            <p className="text-neutral-600 dark:text-neutral-300 text-lg mb-8">
              Start managing your inventory with powerful features built for modern businesses.
            </p>

            <div className="space-y-4">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  className="flex items-start gap-4 p-6 rounded-2xl bg-white/70 dark:bg-white/10 backdrop-blur-lg border border-neutral-200 dark:border-white/20"
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent-teal to-primary-500 flex items-center justify-center flex-shrink-0">
                    <benefit.icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-neutral-800 dark:text-white font-semibold mb-1">{benefit.title}</h3>
                    <p className="text-neutral-600 dark:text-neutral-400 text-sm">{benefit.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Testimonial */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="bg-white/70 dark:bg-white/5 backdrop-blur-lg border border-neutral-200 dark:border-white/10 rounded-2xl p-6"
          >
            <p className="text-neutral-600 dark:text-neutral-300 mb-4 italic">
              "StockFlow has transformed how we manage inventory. 
              We've seen a 40% increase in efficiency since switching!"
            </p>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent-teal to-primary-500 flex items-center justify-center text-white font-bold">
                JD
              </div>
              <div>
                <div className="text-neutral-800 dark:text-white font-semibold">John Doe</div>
                <div className="text-neutral-600 dark:text-neutral-400 text-sm">CEO, Tech Solutions Inc.</div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Right Side - Registration Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Glassmorphism Card */}
          <div className="bg-white/90 dark:bg-neutral-800/90 backdrop-blur-2xl rounded-3xl shadow-2xl border border-neutral-200 dark:border-white/20 p-8 sm:p-10">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-center mb-8"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-accent-teal mb-4 shadow-lg shadow-purple-500/30">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-neutral-800 dark:text-white mb-2">
                Create Account
              </h2>
              <p className="text-neutral-600 dark:text-neutral-300">
                Get started with your free account
              </p>
            </motion.div>

            {/* Progress Steps */}
            <div className="flex items-center justify-center gap-2 mb-8">
              {[1, 2].map((s) => (
                <div key={s} className="flex items-center">
                  <motion.div
                    animate={{
                      scale: step === s ? 1.2 : 1,
                      backgroundColor: step >= s ? '#00BFA5' : 'rgba(156, 163, 175, 0.3)',
                    }}
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white transition-all ${
                      step >= s ? 'shadow-lg shadow-accent-teal/30' : ''
                    }`}
                  >
                    {step > s ? <CheckCircle2 className="w-6 h-6" /> : s}
                  </motion.div>
                  {s < 2 && (
                    <div className={`w-12 h-1 mx-2 rounded transition-all ${
                      step > s ? 'bg-accent-teal' : 'bg-neutral-300 dark:bg-white/20'
                    }`} />
                  )}
                </div>
              ))}
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Step 1 - Personal Info */}
              {step === 1 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-5"
                >
                  {/* Username */}
                  <div>
                    <label className="block text-sm font-semibold text-neutral-700 dark:text-white mb-2">
                      Username *
                    </label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                      <input
                        type="text"
                        value={formData.username}
                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                        className="w-full pl-12 pr-4 py-3 bg-white dark:bg-neutral-700 border-2 border-neutral-200 dark:border-neutral-600 rounded-xl focus:border-primary-400 dark:focus:border-primary-400 focus:outline-none transition-colors text-neutral-800 dark:text-white placeholder-neutral-400"
                        placeholder="johndoe"
                        required
                      />
                    </div>
                  </div>

                  {/* Name Fields */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-neutral-700 dark:text-white mb-2">
                        First Name *
                      </label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                        <input
                          type="text"
                          value={formData.firstName}
                          onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                          className="w-full pl-12 pr-4 py-3 bg-white dark:bg-neutral-700 border-2 border-neutral-200 dark:border-neutral-600 rounded-xl focus:border-primary-400 dark:focus:border-primary-400 focus:outline-none transition-colors text-neutral-800 dark:text-white placeholder-neutral-400"
                          placeholder="John"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-neutral-700 dark:text-white mb-2">
                        Last Name *
                      </label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                        <input
                          type="text"
                          value={formData.lastName}
                          onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                          className="w-full pl-12 pr-4 py-3 bg-white dark:bg-neutral-700 border-2 border-neutral-200 dark:border-neutral-600 rounded-xl focus:border-primary-400 dark:focus:border-primary-400 focus:outline-none transition-colors text-neutral-800 dark:text-white placeholder-neutral-400"
                          placeholder="Doe"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-semibold text-neutral-700 dark:text-white mb-2">
                      Email Address *
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full pl-12 pr-4 py-3 bg-white dark:bg-neutral-700 border-2 border-neutral-200 dark:border-neutral-600 rounded-xl focus:border-primary-400 dark:focus:border-primary-400 focus:outline-none transition-colors text-neutral-800 dark:text-white placeholder-neutral-400"
                        placeholder="you@example.com"
                        required
                      />
                    </div>
                  </div>

                  {/* Next Button */}
                  <GradientButton
                    type="button"
                    onClick={nextStep}
                    gradient="accent"
                    size="lg"
                    glow={true}
                    className="w-full"
                    icon={<ArrowRight className="w-5 h-5" />}
                  >
                    Continue
                  </GradientButton>
                </motion.div>
              )}

              {/* Step 2 - Security */}
              {step === 2 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-5"
                >
                  {/* Password */}
                  <div>
                    <label className="block text-sm font-semibold text-neutral-700 dark:text-white mb-2">
                      Password *
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="w-full pl-12 pr-12 py-3 bg-white dark:bg-neutral-700 border-2 border-neutral-200 dark:border-neutral-600 rounded-xl focus:border-primary-400 dark:focus:border-primary-400 focus:outline-none transition-colors text-neutral-800 dark:text-white placeholder-neutral-400"
                        placeholder="••••••••"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-800 dark:hover:text-white transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>

                    {/* Password Requirements */}
                    {formData.password && (
                      <div className="mt-3 space-y-2">
                        {passwordRequirements.map((req, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
                              req.met ? 'bg-green-500' : 'bg-neutral-300 dark:bg-neutral-600'
                            }`}>
                              {req.met && <CheckCircle2 className="w-3 h-3 text-white" />}
                            </div>
                            <span className={`text-sm ${
                              req.met ? 'text-green-500 dark:text-green-400' : 'text-neutral-500 dark:text-neutral-400'
                            }`}>
                              {req.text}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="block text-sm font-semibold text-neutral-700 dark:text-white mb-2">
                      Confirm Password *
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                        className="w-full pl-12 pr-12 py-3 bg-white dark:bg-neutral-700 border-2 border-neutral-200 dark:border-neutral-600 rounded-xl focus:border-primary-400 dark:focus:border-primary-400 focus:outline-none transition-colors text-neutral-800 dark:text-white placeholder-neutral-400"
                        placeholder="••••••••"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-800 dark:hover:text-white transition-colors"
                      >
                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                      <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                        <span className="text-red-500">✕</span> Passwords do not match
                      </p>
                    )}
                  </div>

                  {/* Terms */}
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={formData.terms}
                      onChange={(e) => setFormData({ ...formData, terms: e.target.checked })}
                      className="w-5 h-5 mt-1 rounded border-2 border-neutral-300 dark:border-neutral-600 text-accent-teal focus:ring-2 focus:ring-accent-teal transition-all"
                      required
                    />
                    <span className="text-sm text-neutral-600 dark:text-neutral-300 group-hover:text-neutral-800 dark:group-hover:text-white transition-colors">
                      I agree to the{' '}
                      <a href="#" className="text-accent-teal hover:underline">
                        Terms of Service
                      </a>{' '}
                      and{' '}
                      <a href="#" className="text-accent-teal hover:underline">
                        Privacy Policy
                      </a>
                    </span>
                  </label>

                  {/* Buttons */}
                  <div className="flex gap-3 mt-6">
                    <button
                      type="button"
                      onClick={prevStep}
                      className="flex-1 px-6 py-3 rounded-xl bg-neutral-100 dark:bg-white/10 hover:bg-neutral-200 dark:hover:bg-white/20 border border-neutral-200 dark:border-white/20 text-neutral-700 dark:text-white font-semibold transition-all"
                    >
                      Back
                    </button>
                    <GradientButton
                      type="submit"
                      gradient="accent"
                      size="lg"
                      loading={loading}
                      glow={true}
                      className="flex-1"
                      icon={<CheckCircle2 className="w-5 h-5" />}
                      disabled={loading || !formData.terms || formData.password !== formData.confirmPassword}
                    >
                      {loading ? 'Creating Account...' : 'Create Account'}
                    </GradientButton>
                  </div>
                </motion.div>
              )}
            </form>

            {/* Social Login - Only on Step 1 */}
            {step === 1 && (
              <>
                <div className="flex items-center gap-4 my-6">
                  <div className="flex-1 h-px bg-neutral-200 dark:bg-white/20"></div>
                  <span className="text-neutral-500 dark:text-neutral-400 text-sm">Or continue with</span>
                  <div className="flex-1 h-px bg-neutral-200 dark:bg-white/20"></div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-white dark:bg-white/10 hover:bg-neutral-50 dark:hover:bg-white/20 border border-neutral-200 dark:border-white/20 rounded-xl transition-all text-neutral-700 dark:text-white"
                    onClick={() => toast.info('Google sign up coming soon!')}
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="currentColor"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    Google
                  </button>
                  <button
                    type="button"
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-white dark:bg-white/10 hover:bg-neutral-50 dark:hover:bg-white/20 border border-neutral-200 dark:border-white/20 rounded-xl transition-all text-neutral-700 dark:text-white"
                    onClick={() => toast.info('GitHub sign up coming soon!')}
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                    </svg>
                    GitHub
                  </button>
                </div>
              </>
            )}

            {/* Login Link */}
            <p className="text-center mt-8 text-neutral-600 dark:text-neutral-300">
              Already have an account?{' '}
              <Link
                to={ROUTES.LOGIN}
                className="text-accent-teal hover:text-accent-teal-light font-semibold transition-colors"
              >
                Sign in
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};