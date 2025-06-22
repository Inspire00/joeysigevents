'use client'

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { motion } from 'framer-motion';
import Header from '../components/Header';
import { Home, Dashboard, Settings, Camera } from 'lucide-react'; // Ensure correct import

export default function Admin() {
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        router.push('/login');
      }
    });
    return () => unsubscribe();
  }, [router]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (!user) {
    return null; // Prevent rendering until auth state is confirmed
  }

  const handleNavigate = (path) => {
    router.push(path);
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans">
     
      {/* Admin Content */}
      <div className="flex items-center justify-center pt-16">
        <motion.div
          className="max-w-5xl mx-auto p-8"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-bold mb-6 text-center" style={{ color: '#ea176b' }}>
             Joeys Signature Events Admin Dashboard
          </h1>
          <p className="text-lg mb-8 text-center">
            Welcome, {user.email}! This is your admin panel for managing Signature Events staffing services.
          </p>

          {/* Cards Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Home Card */}
            <motion.div
              className="bg-gray-900 p-6 rounded-lg cursor-pointer hover:bg-gray-800 transition"
              whileHover={{ scale: 1.05 }}
              onClick={() => handleNavigate('/casual')}
            >
              <Home className="w-12 h-12 mb-4 text-[#ea176b]" />
              <h2 className="text-xl font-semibold">Casuals Payroll</h2>
            </motion.div>

            {/* Dashboard Card */}
            <motion.div
              className="bg-gray-900 p-6 rounded-lg cursor-pointer hover:bg-gray-800 transition"
              whileHover={{ scale: 1.05 }}
              onClick={() => handleNavigate('/dashboard')}
            >
              <Camera className="w-12 h-12 mb-4 text-[#ea176b]" />
              <h2 className="text-xl font-semibold">Staff Payroll</h2>
            </motion.div>

            {/* Steps Dashboard Card */}
            <motion.div
              className="bg-gray-900 p-6 rounded-lg cursor-pointer hover:bg-gray-800 transition"
              whileHover={{ scale: 1.05 }}
              onClick={() => handleNavigate('/stepsdashboard')}
            >
              <Settings className="w-12 h-12 mb-4 text-[#ea176b]" />
              <h2 className="text-xl font-semibold">Steps Dashboard</h2>
            </motion.div>
          </div>

          {/* Logout Button */}
          <div className="text-center mt-8">
            <button
              onClick={handleLogout}
              className="px-6 py-3 bg-[#ea176b] text-black font-semibold rounded-full hover:bg-[#c0145a] transition"
            >
              Logout
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}