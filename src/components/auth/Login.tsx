import { useState, useEffect } from 'react';
import { Eye, EyeOff, Ship, Anchor, Lock, Mail, AlertCircle, User } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface FormData {
  email: string;
  password: string;
  name?: string;
  role?: string;
}

export default function Login() {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    name: '',
    role: 'logistics_agent'
  });

  const navigate = useNavigate();
  const location = useLocation();
  const { login, register, user } = useAuth();

  useEffect(() => {
    // Check if we're in register mode from URL
    const searchParams = new URLSearchParams(location.search);
    setIsRegister(searchParams.get('register') === 'true');
  }, [location]);

  useEffect(() => {
    if (user) {
      if (user.role === 'admin') {
        navigate('/admin/dashboard');
      } else if (user.role === 'supervisor') {
        navigate('/supervisor/dashboard');
      } else if (user.role === 'logistics_agent') {
        navigate('/logistics_agent/dashboard');
      } else {
        navigate('/');
      }
    }
  }, [user, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    if (error) setError('');
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');

    try {
      if (isRegister) {
        await register(formData.email, formData.password, formData.name!, formData.role!);
      } else {
        await login(formData.email, formData.password);
      }
      // Navigation is handled by useEffect
    } catch (error: any) {
      setError(error.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = isRegister 
    ? formData.email && formData.password && formData.name && formData.role
    : formData.email && formData.password;

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl animate-pulse delay-700"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-128 h-128 bg-indigo-500/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-opacity-20" style={{
        backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.02'%3E%3Cpath d='m36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")"
      }}></div>

      <div className="relative z-10 min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          {/* Logo and Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-teal-600 rounded-2xl mb-6 shadow-2xl">
              <Ship className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent mb-2">
              PortFlow
            </h1>
            <p className="text-slate-400 text-lg">Port Management System</p>
            <div className="flex items-center justify-center mt-2 space-x-2">
              <Anchor className="w-4 h-4 text-blue-400" />
              <span className="text-slate-500 text-sm">Professional Maritime Solutions</span>
            </div>
          </div>

          {/* Login/Register Form */}
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl">
            <div className="mb-6">
              <h2 className="text-2xl font-semibold text-white mb-2">
                {isRegister ? 'Create Account' : 'Welcome Back'}
              </h2>
              <p className="text-slate-300">
                {isRegister ? 'Sign up to get started' : 'Sign in to access your dashboard'}
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center space-x-3">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                <p className="text-red-300 text-sm">{error}</p>
              </div>
            )}

            <div className="space-y-6">
              {isRegister && (
                <>
                  {/* Name Field */}
                  <div className="group">
                    <label className="block text-sm font-medium text-slate-200 mb-2">
                      Full Name
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <User className="h-5 w-5 text-slate-400 group-focus-within:text-blue-400 transition-colors" />
                      </div>
                      <input
                        id="name"
                        name="name"
                        type="text"
                        required
                        className="block w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400/50 transition-all duration-200 backdrop-blur-sm"
                        placeholder="Enter your full name"
                        value={formData.name}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  {/* Role Selection */}
                  <div className="group">
                    <label className="block text-sm font-medium text-slate-200 mb-2">
                      Role
                    </label>
                    <div className="relative">
                      <select
                        id="role"
                        name="role"
                        required
                        className="block w-full pl-4 pr-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400/50 transition-all duration-200 backdrop-blur-sm"
                        value={formData.role}
                        onChange={handleChange}
                      >
                        <option value="logistics_agent">Logistics Agent</option>
                        <option value="supervisor">Supervisor</option>
                      </select>
                    </div>
                  </div>
                </>
              )}

              {/* Email Field */}
              <div className="group">
                <label className="block text-sm font-medium text-slate-200 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-slate-400 group-focus-within:text-blue-400 transition-colors" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    className="block w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400/50 transition-all duration-200 backdrop-blur-sm"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="group">
                <label className="block text-sm font-medium text-slate-200 mb-2">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-blue-400 transition-colors" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    className="block w-full pl-12 pr-12 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400/50 transition-all duration-200 backdrop-blur-sm"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleChange}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-4 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-slate-400 hover:text-slate-300 transition-colors" />
                    ) : (
                      <Eye className="h-5 w-5 text-slate-400 hover:text-slate-300 transition-colors" />
                    )}
                  </button>
                </div>
              </div>

              {/* Remember Me & Forgot Password (only for login) */}
              {!isRegister && (
                <div className="flex items-center justify-between">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      className="h-4 w-4 text-blue-600 bg-white/10 border-white/20 rounded focus:ring-blue-500 focus:ring-2"
                    />
                    <span className="ml-2 text-sm text-slate-300">Remember me</span>
                  </label>
                  <button
                    type="button"
                    className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    Forgot password?
                  </button>
                </div>
              )}

              {/* Submit Button */}
              <button
                onClick={handleSubmit}
                disabled={!isFormValid || loading}
                className="relative w-full group"
              >
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-teal-600 rounded-xl blur opacity-75 group-hover:opacity-100 transition duration-300"></div>
                <div className="relative w-full flex items-center justify-center py-4 px-6 bg-gradient-to-r from-blue-600 to-teal-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-teal-700 focus:outline-none focus:ring-2 focus:ring-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200">
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                      {isRegister ? 'Creating Account...' : 'Signing In...'}
                    </>
                  ) : (
                    isRegister ? 'Create Account' : 'Sign In'
                  )}
                </div>
              </button>

              {/* Toggle Login/Register */}
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => {
                    setIsRegister(!isRegister);
                    setError('');
                  }}
                  className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
                >
                  {isRegister ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
                </button>
              </div>
            </div>

            {/* Demo Info (only for login) */}
            {!isRegister && (
              <div className="mt-8 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                <p className="text-xs text-blue-300 mb-2 font-medium">Demo Credentials:</p>
                <div className="text-xs text-slate-400 space-y-1">
                  <div>admin@portflow.com - Admin Dashboard</div>
                  <div>supervisor@portflow.com - Supervisor Dashboard</div>
                  <div>logistics@portflow.com - Logistics Dashboard</div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-slate-500 text-sm">
              © 2025 PortFlow. Secure maritime management solutions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}