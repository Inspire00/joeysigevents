'use client'

import { UserIcon, PhoneIcon, EnvelopeIcon } from '@heroicons/react/24/outline';

export default function Header() {
  return (
    <header className="fixed top-0 left-0 w-full bg-black shadow-md z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold" style={{ color: '#ea176b' }}>
          Joeys Signature Events
        </h1>
        <nav className="flex space-x-4 items-center">
          <a href="/home#home" className="text-white hover:text-[#ea176b] transition">
            Home
          </a>
          <a href="/home#services" className="text-white hover:text-[#ea176b] transition">
            Services
          </a>
          <a href="/home#contact" className="text-white hover:text-[#ea176b] transition">
            Contact
          </a>
          <div className="flex space-x-4">
            <a href="/admin" className="flex items-center space-x-1 text-white hover:text-[#ea176b] transition">
              <UserIcon className="h-5 w-5" />
              <span>Admin</span>
            </a>
            <a href="tel:+27123456789" className="flex items-center space-x-1 text-white hover:text-[#ea176b] transition">
              <PhoneIcon className="h-5 w-5" />
              <span>Call Us</span>
            </a>
            <a href="mailto:info@signatureevents.co.za" className="flex items-center space-x-1 text-white hover:text-[#ea176b] transition">
              <EnvelopeIcon className="h-5 w-5" />
              <span>Email</span>
            </a>
          </div>
        </nav>
      </div>
    </header>
  );
}