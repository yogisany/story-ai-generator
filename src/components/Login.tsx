import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BookOpen, Lock, User as UserIcon, AlertCircle, Mail, ArrowRight } from 'lucide-react';
import { useStore } from '../store/useStore';

export const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState<'admin' | 'user'>('user');
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    name: ''
  });
  const [error, setError] = useState('');
  const setUser = useStore((state) => state.setUser);
  const brandSettings = useStore((state) => state.brandSettings);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isLogin) {
      // Mock Login Logic
      if (role === 'admin') {
        if (formData.username === 'admin' && formData.password === 'admin123') {
          setUser({
            id: 'admin-id',
            name: 'Administrator',
            email: 'admin@storybook.ai',
            role: 'admin',
            credits: 9999
          });
        } else {
          setError('Username atau password admin salah!');
        }
      } else {
        // Mock User Login
        if (formData.username && formData.password) {
          setUser({
            id: 'user-id',
            name: formData.username,
            email: `${formData.username}@example.com`,
            role: 'user',
            credits: 10
          });
        } else {
          setError('Silakan isi username dan password!');
        }
      }
    } else {
      // Mock Sign Up Logic
      if (formData.username && formData.password && formData.email && formData.name) {
        setUser({
          id: Math.random().toString(36).substr(2, 9),
          name: formData.name,
          email: formData.email,
          role: role,
          credits: role === 'admin' ? 9999 : 10
        });
      } else {
        setError('Silakan lengkapi semua data pendaftaran!');
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FE] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white rounded-[2.5rem] shadow-2xl p-10 border border-indigo-50"
      >
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center overflow-hidden shadow-xl border border-gray-50 mx-auto mb-6">
            <img 
              src={brandSettings.logoUrl} 
              alt="Logo" 
              className="w-full h-full object-contain p-2"
              referrerPolicy="no-referrer"
            />
          </div>
          <h1 className="text-2xl font-black text-gray-900 mb-1">{brandSettings.name} <span className="text-indigo-600">{brandSettings.tagline}</span></h1>
          <p className="text-gray-500 text-sm">
            {isLogin ? 'Masuk ke akun Anda' : 'Buat akun baru Anda'}
          </p>
        </div>

        {/* Role Toggle */}
        <div className="flex p-1 bg-gray-100 rounded-2xl mb-8">
          <button
            onClick={() => setRole('user')}
            className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all ${
              role === 'user' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500'
            }`}
          >
            User
          </button>
          <button
            onClick={() => {
              setRole('admin');
              setIsLogin(true);
            }}
            className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all ${
              role === 'admin' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500'
            }`}
          >
            Admin
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <AnimatePresence mode="wait">
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="p-4 bg-red-50 text-red-600 rounded-2xl flex items-center gap-3 text-sm font-medium"
              >
                <AlertCircle size={18} />
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {!isLogin && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <label className="block text-xs font-bold text-gray-400 mb-1 ml-1 uppercase tracking-wider">Nama Lengkap</label>
              <div className="relative">
                <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  className="w-full pl-12 pr-4 py-3 rounded-2xl border border-gray-100 focus:ring-2 focus:ring-indigo-500 outline-none transition-all bg-gray-50/50"
                  placeholder="Nama Lengkap"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
            </motion.div>
          )}

          <div>
            <label className="block text-xs font-bold text-gray-400 mb-1 ml-1 uppercase tracking-wider">Username</label>
            <div className="relative">
              <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                className="w-full pl-12 pr-4 py-3 rounded-2xl border border-gray-100 focus:ring-2 focus:ring-indigo-500 outline-none transition-all bg-gray-50/50"
                placeholder="Username"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              />
            </div>
          </div>

          {!isLogin && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <label className="block text-xs font-bold text-gray-400 mb-1 ml-1 uppercase tracking-wider">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="email"
                  className="w-full pl-12 pr-4 py-3 rounded-2xl border border-gray-100 focus:ring-2 focus:ring-indigo-500 outline-none transition-all bg-gray-50/50"
                  placeholder="email@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </motion.div>
          )}

          <div>
            <label className="block text-xs font-bold text-gray-400 mb-1 ml-1 uppercase tracking-wider">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="password"
                className="w-full pl-12 pr-4 py-3 rounded-2xl border border-gray-100 focus:ring-2 focus:ring-indigo-500 outline-none transition-all bg-gray-50/50"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold text-lg hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
          >
            {isLogin ? 'Masuk Sekarang' : 'Daftar Sekarang'}
            <ArrowRight size={20} />
          </button>
        </form>

        {role === 'user' && (
          <div className="mt-8 text-center">
            <button 
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm font-bold text-indigo-600 hover:text-indigo-700 transition-all"
            >
              {isLogin ? 'Belum punya akun? Daftar di sini' : 'Sudah punya akun? Masuk di sini'}
            </button>
          </div>
        )}

        <div className="mt-8 text-center text-[10px] text-gray-400 uppercase tracking-widest">
          <p>© 2026 {brandSettings.name} • SDN Cimahi Mandiri 3</p>
        </div>
      </motion.div>
    </div>
  );
};
