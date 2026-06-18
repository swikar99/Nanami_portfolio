'use client';

import { useTranslations } from 'next-intl';
import { FloatingShapes } from './FloatingShapes';
import { ParticleBackground } from './ParticleBackground';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowDown, Sparkles } from 'lucide-react';
import { useState, useEffect } from 'react';
import Image from 'next/image';

export function HeroSection() {
  const t = useTranslations('hero');
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.3], [1, 0.8]);
  // Initialize without timestamp to avoid hydration mismatch
  const [imgSrc, setImgSrc] = useState('/images/hero/profile.png');
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Add timestamp on client-side only to bust cache
  useEffect(() => {
    setImgSrc(`/images/hero/profile.png?t=${Date.now()}`);
  }, []);

  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Particle Background */}
      <ParticleBackground />

      {/* Floating 3D Shapes */}
      <FloatingShapes />

      {/* Animated Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-blue-500/10 animate-gradient-shift" />
      <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent dark:from-black" />

      {/* Content */}
      <motion.div
        style={{ opacity, scale }}
        className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 text-center"
      >
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          {/* Profile Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, duration: 0.8, type: "spring" }}
            className="mb-6 sm:mb-8 relative inline-block"
          >
            <div className="relative w-28 h-28 sm:w-32 sm:h-32 md:w-40 md:h-40 mx-auto">
              {!imageError ? (
                <>
                  {/* Gradient Ring */}
                  <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 animate-gradient-shift p-1">
                    <div className="w-full h-full rounded-full bg-white dark:bg-black p-1 relative">
                      {isLoading && (
                        <div className="w-full h-full rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
                      )}
                      <Image
                        src={imgSrc}
                        alt={t('name')}
                        fill
                        loading="eager"
                        priority
                        className={`rounded-full object-cover transition-all duration-500 ${isLoading ? 'scale-110 blur-xl grayscale' : 'scale-100 blur-0 grayscale-0'
                          }`}
                        sizes="(max-width: 640px) 112px, (max-width: 768px) 128px, 160px"
                        onLoad={() => setIsLoading(false)}
                        onError={() => {
                          // Try different image extensions in order: png -> jpg -> jpeg -> webp
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
                    </div>
                  </div>
                  {/* Glow Effect */}
                  <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 blur-2xl opacity-30 animate-pulse-glow" />
                </>
              ) : (
                /* Fallback when no image is found */
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 animate-gradient-shift p-1">
                  <div className="w-full h-full rounded-full bg-white dark:bg-black flex items-center justify-center">
                    <Sparkles className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 text-purple-500" />
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* Greeting Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="inline-flex items-center gap-2 mb-4 sm:mb-6 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-white/80 dark:bg-black/80 backdrop-blur-sm border border-gray-200 dark:border-gray-800 shadow-lg"
          >
            <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-500" />
            <span className="text-xs sm:text-sm font-medium">{t('greeting')}</span>
          </motion.div>

          {/* Name with 3D Text Effect */}
          <motion.h1
            className="hero-text mb-4 sm:mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 dark:from-purple-400 dark:via-pink-400 dark:to-blue-400 px-4"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            style={{
              textShadow: '0 0 80px rgba(168, 85, 247, 0.4)',
            }}
          >
            {t('name')}
          </motion.h1>

          {/* Title */}
          <motion.p
            className="text-lg sm:text-xl md:text-3xl font-bold mb-3 sm:mb-4 max-w-3xl mx-auto bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            {t('title')}
          </motion.p>

          {/* Subtitle */}
          <motion.p
            className="text-sm sm:text-base md:text-lg opacity-70 max-w-2xl mx-auto mb-8 sm:mb-12 px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.8 }}
          >
            {t('subtitle')}
          </motion.p>

          {/* CTA Button with Hover Effect */}
          <motion.a
            href="#about"
            className="group relative inline-flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-4 rounded-full font-medium overflow-hidden text-sm sm:text-base"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.6 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 transition-transform group-hover:scale-110" />
            <div className="absolute inset-0 bg-gradient-to-r from-pink-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" />
            <span className="relative text-white font-semibold">{t('cta')}</span>
          </motion.a>
        </motion.div>

        {/* Animated Scroll Indicator */}
        <motion.div
          className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.8 }}
        >
          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <ArrowDown className="w-6 h-6 opacity-60" />
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
}
