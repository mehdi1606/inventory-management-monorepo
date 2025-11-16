import { useState, FormEvent, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { useAppDispatch } from '@/store/hooks';
import { setUser } from '@/store/slices/auth.slice';
import { authService } from '@/services/auth.service';
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight,
  Package,
  Sparkles,
  TrendingUp,
  Shield,
  Zap
} from 'lucide-react';
import { GradientButton } from '@/components/ui/GradientButton';
import { ROUTES } from '@/config/constants';
import toast from 'react-hot-toast';

export const LoginPage = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    usernameOrEmail: '', // Backend expects this field name
    password: '',
    remember: false,
  });

  // Load saved credentials when component mounts
  useEffect(() => {
    const savedUsername = localStorage.getItem('rememberedUsername');
    const savedPassword = localStorage.getItem('rememberedPassword');
    const rememberMe = localStorage.getItem('rememberMe');

    if (rememberMe === 'true' && savedUsername && savedPassword) {
      setFormData({
        usernameOrEmail: savedUsername,
        password: savedPassword,
        remember: true,
      });
    }
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Save or remove credentials based on "Remember Me" checkbox
      if (formData.remember) {
        localStorage.setItem('rememberedUsername', formData.usernameOrEmail);
        localStorage.setItem('rememberedPassword', formData.password);
        localStorage.setItem('rememberMe', 'true');
      } else {
        localStorage.removeItem('rememberedUsername');
        localStorage.removeItem('rememberedPassword');
        localStorage.removeItem('rememberMe');
      }

      // Call real backend API
      const response = await authService.login({
        usernameOrEmail: formData.usernameOrEmail,
        password: formData.password,
      });

      // Store user in Redux
      dispatch(setUser(response.user));
      
      toast.success('Login successful!');
      navigate(ROUTES.DASHBOARD);
    } catch (error: any) {
      console.error('Login error:', error);
      const message = error.response?.data?.message || 'Login failed. Please check your credentials.';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  // Floating particles animation
  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    size: Math.random() * 4 + 2,
    x: Math.random() * 100,
    y: Math.random() * 100,
    duration: Math.random() * 10 + 10,
    delay: Math.random() * 5,
  }));

  const features = [
    {
      icon: Package,
      title: 'Inventory Management',
      description: 'Complete control over your stock',
    },
    {
      icon: TrendingUp,
      title: 'Real-time Analytics',
      description: 'Live insights and reports',
    },
    {
      icon: Shield,
      title: 'Secure & Reliable',
      description: 'Enterprise-grade security',
    },
    {
      icon: Zap,
      title: 'Lightning Fast',
      description: 'Optimized for performance',
    },
  ];

  const stats = [
    { label: 'Active Users', value: '10K+' },
    { label: 'Products Managed', value: '500K+' },
    { label: 'Daily Transactions', value: '50K+' },
  ];

  return (
    <div className="relative min-h-screen flex overflow-hidden bg-neutral-900">
      {/* Animated Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-900 via-purple-900 to-accent-teal opacity-50">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiM2NjdlZWEiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yIDItNCAzLTRzMyAyIDMgNGMwIDItMiA0LTMgNHMtMy0yLTMtNHptLTEwIDhjMC0yIDItNCAzLTRzMyAyIDMgNGMwIDItMiA0LTMgNHMtMy0yLTMtNHoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-20"></div>
      </div>

      {/* Floating Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute bg-white rounded-full"
            style={{
              width: particle.size,
              height: particle.size,
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              opacity: 0.2,
            }}
            animate={{
              y: [0, -30, 0],
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
      </div>

      {/* Left Side - Branding & Features */}
      <div className="hidden lg:flex flex-1 relative z-10">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="flex flex-col justify-center px-12 xl:px-20 w-full"
        >
          {/* Logo & Title */}
          <div className="mb-12">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="inline-flex items-center gap-3 mb-6"
            >
              <div className="p-3 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-teal shadow-glow-accent">
                <Package className="w-10 h-10 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">StockFlow</h1>
                <p className="text-accent-teal-light text-sm">Inventory Management System</p>
              </div>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-5xl font-bold text-white mb-4 leading-tight"
            >
              Streamline Your
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-teal to-primary-400">
                Inventory Operations
              </span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-xl text-neutral-300 mb-8 max-w-md"
            >
              Advanced tools for modern businesses to manage stock, track movements, and optimize operations.
            </motion.p>
          </div>

          {/* Features Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="grid grid-cols-2 gap-6 mb-12"
          >
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 + index * 0.1 }}
                  className="card-glass p-6 backdrop-blur-xl border border-white/10 hover:border-accent-teal/30 transition-all duration-300 group"
                >
                  <div className="flex items-start gap-4">
                    <div className="p-2 rounded-lg bg-white/10 group-hover:bg-accent-teal/20 transition-colors">
                      <Icon className="w-6 h-6 text-accent-teal" />
                    </div>
                    <div>
                      <h3 className="text-white font-semibold mb-1">{feature.title}</h3>
                      <p className="text-sm text-neutral-400">{feature.description}</p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="flex gap-8"
          >
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
                <div className="text-sm text-neutral-400">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Glassmorphism Card */}
          <div className="card-glass p-8 sm:p-10 backdrop-blur-2xl border border-white/20 shadow-3d-2xl">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-center mb-8"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-teal mb-4 shadow-glow-accent">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-2">
                Welcome Back
              </h2>
              <p className="text-neutral-300">
                Sign in to continue to your dashboard
              </p>
            </motion.div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Username or Email Field */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <label className="block text-sm font-semibold text-white mb-2">
                  Username or Email
                </label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400 group-focus-within:text-accent-teal transition-colors" />
                  <input
                    type="text"
                    value={formData.usernameOrEmail}
                    onChange={(e) =>
                      setFormData({ ...formData, usernameOrEmail: e.target.value })
                    }
                    className="input-glass pl-12 pr-4 py-4 w-full text-white placeholder-neutral-500 focus:border-accent-teal/50"
                    placeholder="Username or email"
                    required
                    autoComplete="username"
                  />
                </div>
              </motion.div>

              {/* Password Field */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <label className="block text-sm font-semibold text-white mb-2">
                  Password
                </label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400 group-focus-within:text-accent-teal transition-colors" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    className="input-glass pl-12 pr-12 py-4 w-full text-white placeholder-neutral-500 focus:border-accent-teal/50"
                    placeholder="••••••••"
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </motion.div>

              {/* Remember & Forgot */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="flex items-center justify-between"
              >
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={formData.remember}
                    onChange={(e) =>
                      setFormData({ ...formData, remember: e.target.checked })
                    }
                    className="w-4 h-4 rounded border-2 border-white/30 bg-white/10 checked:bg-accent-teal checked:border-accent-teal transition-all"
                  />
                  <span className="text-sm text-neutral-300 group-hover:text-white transition-colors">
                    Remember me
                  </span>
                </label>
                <Link
                  to={ROUTES.FORGOT_PASSWORD}
                  className="text-sm text-accent-teal hover:text-accent-teal-light transition-colors font-semibold"
                >
                  Forgot password?
                </Link>
              </motion.div>

              {/* Submit Button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <GradientButton
                  type="submit"
                  gradient="accent"
                  size="lg"
                  loading={loading}
                  glow={true}
                  className="w-full"
                  icon={!loading && <ArrowRight className="w-5 h-5" />}
                >
                  {loading ? 'Signing in...' : 'Sign In'}
                </GradientButton>
              </motion.div>
            </form>

            {/* Sign Up Link */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="text-center mt-8 text-neutral-300"
            >
              Don't have an account?{' '}
              <Link
                to={ROUTES.REGISTER}
                className="text-accent-teal hover:text-accent-teal-light font-semibold transition-colors"
              >
                Sign up for free
              </Link>
            </motion.p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};