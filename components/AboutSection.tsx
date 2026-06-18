'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';

export function AboutSection() {
  const t = useTranslations('about');
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  const highlights = [
    t('highlight1'),
    t('highlight2'),
    t('highlight3'),
  ];

  return (
    <section id="about" className="py-32 bg-gray-50" ref={ref}>
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-5xl md:text-6xl font-bold mb-12 text-center text-gray-900">
            {t('title')}
          </h2>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <p className="text-lg leading-relaxed text-gray-600">
                {t('description')}
              </p>

              <div className="space-y-4 mt-8">
                {highlights.map((highlight, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                    transition={{ duration: 0.5, delay: index * 0.1 + 0.3 }}
                    className="flex items-center gap-3"
                  >
                    <div className="w-2 h-2 rounded-full bg-purple-500" />
                    <span className="font-medium text-gray-700">{highlight}</span>
                  </motion.div>
                ))}
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9, rotateY: -15 }}
              animate={isInView ? { opacity: 1, scale: 1, rotateY: 0 } : { opacity: 0, scale: 0.9, rotateY: -15 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative h-96 rounded-3xl overflow-hidden bg-white shadow-xl group"
              style={{ perspective: '1000px' }}
            >
              {/* Gradient Background */}
              <div className="absolute inset-0 bg-gradient-to-br from-purple-200 via-pink-200 to-blue-200 opacity-50" />

              {/* Profile Image */}
              <div className="absolute inset-0">
                <img
                  src="/images/profile/nanami-about.png"
                  alt="Nanami Wakayama"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = '/images/profile/nanami-about.jpg';
                    e.currentTarget.onerror = () => {
                      e.currentTarget.style.display = 'none';
                      const fallback = e.currentTarget.nextElementSibling;
                      if (fallback) fallback.classList.remove('hidden');
                    };
                  }}
                />
                <div className="hidden absolute inset-0 flex items-center justify-center">
                  <motion.div
                    className="text-8xl"
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  >
                    🍓
                  </motion.div>
                </div>
              </div>

              {/* Decorative orbs */}
              <div className="absolute top-10 right-10 w-32 h-32 rounded-full bg-purple-300/30 blur-3xl" />
              <div className="absolute bottom-10 left-10 w-40 h-40 rounded-full bg-pink-300/30 blur-3xl" />
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
