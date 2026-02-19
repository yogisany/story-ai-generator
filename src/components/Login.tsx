import React, { useState } from 'react';
import { motion } from 'motion/react';
import { BookOpen, Lock, User as UserIcon, AlertCircle } from 'lucide-react';
import { useStore } from '../store/useStore';

export const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const setUser = useStore((state) => state.setUser);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'admin' && password === 'admin123') {
      setUser({
        id: 'admin-id',
        name: 'Administrator',
        email: 'admin@storybook.ai',
        credits: 9999
      });
    } else {
      setError('Username atau password salah!');
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FE] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white rounded-[2.5rem] shadow-2xl p-10 border border-indigo-50"
      >
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-200 mx-auto mb-6">
            <BookOpen size={32} />
          </div>
          <h1 className="text-3xl font-black text-gray-900 mb-2">StoryAI Admin</h1>
          <p className="text-gray-500">Silakan masuk untuk mengelola buku cerita</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          {error && (
            <div className="p-4 bg-red-50 text-red-600 rounded-2xl flex items-center gap-3 text-sm font-medium animate-shake">
              <AlertCircle size={18} />
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Username</label>
            <div className="relative">
              <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-100 focus:ring-2 focus:ring-indigo-500 outline-none transition-all bg-gray-50/50"
                placeholder="Masukkan username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="password"
                className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-100 focus:ring-2 focus:ring-indigo-500 outline-none transition-all bg-gray-50/50"
                placeholder="Masukkan password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold text-lg hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all active:scale-[0.98]"
          >
            Masuk Sekarang
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-gray-400">
          <p>© 2026 Kids Storybook Creator AI</p>
        </div>
      </motion.div>
    </div>
  );
};
