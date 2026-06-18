'use client';

import { useTranslations } from 'next-intl';
import { FloatingShapes } from './FloatingShapes';
import { ParticleBackground } from './ParticleBackground';
import { motion } from 'framer-motion';
import { ArrowDown, Sparkles, ArrowRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import Image from 'next/image';

export function HeroSection() {
  const t = useTranslations('hero');
  const [imgSrc, setImgSrc] = useState('/images/hero/profile.png');
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setImgSrc(`/images/hero/profile.png?t=${Date.now()}`);
  }, []);

  return (
    <section id="home" className="relative min-h-screen flex items-center overflow-hidden bg-white">
      <ParticleBackground />
      <FloatingShapes />

      {/* Soft gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-white to-pink-50" />

      {/* Decorative circles */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-purple-200/30 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-pink-200/30 rounded-full blur-3xl" />

      {/* Main Content Grid */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 py-20">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">

          {/* Left Side - Text Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="order-2 lg:order-1"
          >
            {/* Greeting Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full bg-purple-100 border border-purple-200"
            >
              <Sparkles className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-medium text-purple-700">{t('greeting')}</span>
            </motion.div>

            {/* Name */}
            <motion.h1
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
            >
              {t('name')}
            </motion.h1>

            {/* Title */}
            <motion.p
              className="text-xl sm:text-2xl md:text-3xl font-semibold mb-4 text-gray-800"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
            >
              {t('title')}
            </motion.p>

            {/* Subtitle */}
            <motion.p
              className="text-base sm:text-lg text-gray-600 mb-8 max-w-lg leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.8 }}
            >
              {t('subtitle')}
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              className="flex flex-wrap gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, duration: 0.6 }}
            >
              <motion.a
                href="#about"
                className="group inline-flex items-center gap-2 px-8 py-4 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40 transition-all duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {t('cta')}
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </motion.a>

              <motion.a
                href="#contact"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-white border-2 border-gray-200 text-gray-700 font-semibold hover:border-purple-300 hover:text-purple-600 transition-all duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Contact Me
              </motion.a>
            </motion.div>

            {/* Stats or Social Proof */}
            <motion.div
              className="flex gap-8 mt-12 pt-8 border-t border-gray-200"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.1, duration: 0.8 }}
            >
              <div>
                <p className="text-3xl font-bold text-purple-600">6+</p>
                <p className="text-sm text-gray-500">Projects</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-pink-600">10+</p>
                <p className="text-sm text-gray-500">Media Features</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-blue-600">5+</p>
                <p className="text-sm text-gray-500">Years Experience</p>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Side - Profile Image */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
            className="order-1 lg:order-2 flex justify-center lg:justify-end"
          >
            <div className="relative">
              {/* Background decorative elements */}
              <motion.div
                className="absolute -top-8 -left-8 w-full h-full bg-gradient-to-br from-purple-400 to-pink-400 rounded-3xl"
                initial={{ rotate: -6 }}
                animate={{ rotate: [-6, -3, -6] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              />
              <motion.div
                className="absolute -bottom-8 -right-8 w-full h-full bg-gradient-to-br from-pink-400 to-blue-400 rounded-3xl"
                initial={{ rotate: 6 }}
                animate={{ rotate: [6, 3, 6] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              />

              {/* Main Image Container */}
              <div className="relative w-72 h-72 sm:w-80 sm:h-80 md:w-96 md:h-96 lg:w-[420px] lg:h-[420px] rounded-3xl overflow-hidden bg-white shadow-2xl">
                {!imageError ? (
                  <>
                    {isLoading && (
                      <div className="absolute inset-0 bg-gradient-to-br from-purple-100 to-pink-100 animate-pulse" />
                    )}
                    <Image
                      src={imgSrc}
                      alt={t('name')}
                      fill
                      loading="eager"
                      priority
                      className={`object-cover transition-all duration-700 ${isLoading ? 'scale-110 blur-xl grayscale' : 'scale-100 blur-0 grayscale-0'}`}
                      sizes="(max-width: 640px) 288px, (max-width: 768px) 320px, (max-width: 1024px) 384px, 420px"
                      onLoad={() => setIsLoading(false)}
                      onError={() => {
                        const timestamp = Date.now();
                        if (imgSrc.includes('.png')) {
                          setImgSrc(`/images/hero/profile.jpg?t=${timestamp}`);
                          setIsLoading(true);
                        } else if (imgSrc.includes('.jpg')) {
                          setImgSrc(`/images/hero/profile.jpeg?t=${timestamp}`);
                          setIsLoading(true);
                        } else if (imgSrc.includes('.jpeg')) {
                          setImgSrc(`/images/hero/profile.webp?t=${timestamp}`);
                          setIsLoading(true);
                        } else {
                          setImageError(true);
                        }
                      }}
                      unoptimized
                    />
                  </>
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
                    <Sparkles className="w-20 h-20 text-purple-400" />
                  </div>
                )}
              </div>

              {/* Floating badges */}
              <motion.div
                className="absolute -top-4 -right-4 bg-white rounded-2xl shadow-xl px-4 py-3 flex items-center gap-2"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1, duration: 0.5, type: "spring" }}
              >
                <span className="text-2xl">🍓</span>
                <span className="font-semibold text-gray-700">Himeberry</span>
              </motion.div>

              <motion.div
                className="absolute -bottom-4 -left-4 bg-white rounded-2xl shadow-xl px-4 py-3 flex items-center gap-2"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.2, duration: 0.5, type: "spring" }}
              >
                <span className="text-2xl">👗</span>
                <span className="font-semibold text-gray-700">Seplumo</span>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4, duration: 0.8 }}
      >
        <span className="text-sm text-gray-400 mb-2">Scroll Down</span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          className="w-6 h-10 rounded-full border-2 border-gray-300 flex justify-center pt-2"
        >
          <motion.div
            className="w-1.5 h-1.5 bg-gray-400 rounded-full"
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          />
        </motion.div>
      </motion.div>
    </section>
  );
}
