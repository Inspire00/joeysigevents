'use client'

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Head from 'next/head';
import Header from '../components/Header';

const slides = [
  {
    image: 'https://fra.cloud.appwrite.io/v1/storage/buckets/670e7068001eb54a1075/files/683496d200064dd61626/view?project=66bcc317000e93b4164f&mode=admin',
    title: 'Elevate Your Event with Professional Staff',
    subtitle: 'Our skilled team ensures seamless service for any occasion.',
  },
  {
    image: 'https://fra.cloud.appwrite.io/v1/storage/buckets/670e7068001eb54a1075/files/683496d200064dd61626/view?project=66bcc317000e93b4164f&mode=admin',
    title: 'Hospitality at Its Finest',
    subtitle: 'From bartenders to waiters, we deliver excellence.',
  },
  {
    image: 'https://fra.cloud.appwrite.io/v1/storage/buckets/670e7068001eb54a1075/files/683496d200064dd61626/view?project=66bcc317000e93b4164f&mode=admin',
    title: 'Tailored Staffing Solutions',
    subtitle: 'Perfect for events of any size, from intimate to grand.',
  },
];

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <Head>
        <title>Signature Events | Premier Event Staffing in South Africa</title>
        <meta name="description" content="Signature Events provides professional staffing solutions for events in Gauteng, South Africa. From bartenders to waiters, our diligent and hospitable staff ensure your event is a success." />
      </Head>
      <div className="min-h-screen bg-black text-white font-sans">
        {/* Header */}
        <Header />

        {/* Hero Section with Slideshow */}
        <section id="home" className="relative h-screen pt-16">
          <AnimatePresence>
            <motion.div
              key={currentSlide}
              className="absolute inset-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1 }}
            >
              <Image
                src={slides[currentSlide].image}
                alt={slides[currentSlide].title}
                fill
                style={{ objectFit: 'cover' }}
                className="brightness-50"
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
                <motion.h1
                  className="text-4xl md:text-6xl font-bold mb-4"
                  style={{ color: '#ea176b' }}
                  initial={{ y: 50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  {slides[currentSlide].title}
                </motion.h1>
                <motion.p
                  className="text-lg md:text-2xl max-w-2xl"
                  initial={{ y: 50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.7 }}
                >
                  {slides[currentSlide].subtitle}
                </motion.p>
                <motion.a
                  href="#contact"
                  className="mt-8 px-6 py-3 bg-[#ea176b] text-black font-semibold rounded-full hover:bg-[#c0145a] transition"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 1 }}
                >
                  Book Your Staff Now
                </motion.a>
              </div>
            </motion.div>
          </AnimatePresence>
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
            {slides.map((_, index) => (
              <button
                key={index}
                className={`w-3 h-3 rounded-full ${index === currentSlide ? 'bg-[#ea176b]' : 'bg-gray-500'}`}
                onClick={() => setCurrentSlide(index)}
              />
            ))}
          </div>
        </section>

        {/* About Section */}
        <section className="py-16 px-4 md:px-16 bg-gray-900">
          <motion.div
            className="max-w-5xl mx-auto text-center"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6" style={{ color: '#ea176b' }}>
              About Signature Events
            </h2>
            <p className="text-lg mb-6">
              Based in Gauteng, South Africa, Signature Events is your premier partner for professional staffing solutions. We specialize in providing highly skilled, diligent, and hospitable staff for events of all sizes, from intimate house functions to large-scale gatherings of up to 2000 delegates. Our team includes expert bartenders, waiters, waitresses, kitchen support staff and general workers, all trained to deliver exceptional service that elevates your event.
            </p>
            <p className="text-lg">
              At Signature Events, we pride ourselves on our staffs professionalism and commitment to excellence. Whether you are hosting a corporate function, wedding, or private party, our team ensures every detail is handled with care, leaving you free to enjoy your event. Let us bring your vision to life with staffing services tailored to your needs.
            </p>
          </motion.div>
        </section>

        {/* Services Section */}
        <section id="services" className="py-16 px-4 md:px-16 bg-black">
          <motion.div
            className="max-w-5xl mx-auto"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12" style={{ color: '#ea176b' }}>
              Our Staffing Services
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  title: 'Bartending',
                  description: 'Our professional bartenders craft cocktails with flair, ensuring your guests enjoy a premium bar experience.',
                },
                {
                  title: 'Waitering',
                  description: 'Skilled waiters provide seamless service, delivering food and drinks with poise and hospitality.',
                },
                {
                  title: 'Kitchen Support & General Workers',
                  description: 'From catering assistance to general event setup, our diligent staff handle every task efficiently.',
                },
              ].map((service, index) => (
                <motion.div
                  key={service.title}
                  className="bg-gray-800 p-6 rounded-lg text-center"
                  initial={{ y: 50, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  transition={{ delay: index * 0.2 }}
                  viewport={{ once: true }}
                >
                  <h3 className="text-xl font-semibold mb-4" style={{ color: '#ea176b' }}>
                    {service.title}
                  </h3>
                  <p className="text-gray-300">
                    {service.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* Call to Action Section */}
        <section id="contact" className="py-16 px-4 md:px-16 bg-[#ea176b] text-center">
          <motion.div
            className="max-w-5xl mx-auto text-center"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-black">
              Ready to Elevate Your Event?
            </h2>
            <p className="text-lg mb-8 text-black">
              Partner with Signature Events for professional, reliable staffing that makes your event unforgettable. Contact us today to discuss your staffing needs and let our team bring your vision to life.
            </p>
            <a
              href="mailto:info@signatureevents.co.za"
              className="px-8 py-4 bg-black text-[#ea176b] font-semibold rounded-full hover:bg-gray-800 transition"
            >
              Get a Quote Today!
            </a>
          </motion.div>
        </section>

        {/* Footer */}
        <footer className="py-6 bg-gray-900 text-center">
          <p className="text-sm text-gray-500">
            © 2025 Signature Events. All rights reserved. | Gauteng, South Africa
          </p>
        </footer>
      </div>
    </>
  );
}