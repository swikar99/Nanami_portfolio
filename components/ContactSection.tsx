'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import { Instagram, Facebook, Linkedin, Link as LinkIcon, Mail, Send, Sparkles } from 'lucide-react';

export function ContactSection() {
  const t = useTranslations('contact');
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  const socials = [
    {
      name: 'Instagram',
      icon: <Instagram className="w-7 h-7" />,
      url: 'https://www.instagram.com/nanami733/',
      gradient: 'from-purple-600 via-pink-600 to-orange-500',
      hoverGlow: 'group-hover:shadow-pink-500/50',
    },
    {
      name: 'Facebook',
      icon: <Facebook className="w-7 h-7" />,
      url: 'https://www.facebook.com/nanami.wakayama.56/',
      gradient: 'from-blue-600 to-blue-700',
      hoverGlow: 'group-hover:shadow-blue-500/50',
    },
    {
      name: 'Linktree',
      icon: <LinkIcon className="w-7 h-7" />,
      url: 'https://linktr.ee/Nanaminmin',
      gradient: 'from-green-500 to-emerald-600',
      hoverGlow: 'group-hover:shadow-green-500/50',
    },
    {
      name: 'AWLF',
      icon: <Linkedin className="w-7 h-7" />,
      url: 'https://awlf.asia/ja/members/nanami-wakayama/',
      gradient: 'from-blue-500 to-cyan-600',
      hoverGlow: 'group-hover:shadow-blue-400/50',
    },
  ];

  return (
    <section id="contact" className="relative py-32 overflow-hidden bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50" ref={ref}>
      {/* Floating Orbs */}
      <motion.div
        className="absolute top-20 right-10 w-72 h-72 bg-blue-200/30 rounded-full blur-3xl"
        animate={{
          x: [0, -60, 0],
          y: [0, 40, 0],
          scale: [1, 1.15, 1],
        }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-20 left-10 w-96 h-96 bg-purple-200/30 rounded-full blur-3xl"
        animate={{
          x: [0, 50, 0],
          y: [0, -60, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="relative max-w-5xl mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.6 }}
            className="inline-block"
          >
            <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 mb-6 border border-blue-200">
              <Send className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-semibold text-blue-800 uppercase tracking-wider">
                Let's Connect
              </span>
            </div>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent"
          >
            {t('title')}
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed"
          >
            {t('description')}
          </motion.p>
        </div>

        {/* Social Media Section */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="mb-16"
        >
          <div className="flex items-center justify-center gap-4 mb-12">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-blue-200 to-transparent" />
            <h3 className="text-2xl font-bold text-gray-800 px-6">{t('social')}</h3>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-purple-200 to-transparent" />
          </div>

          <div className="relative group">
            {/* Desktop: Grid Layout */}
            <div className="hidden md:grid md:grid-cols-4 gap-6">
              {socials.map((social, index) => (
                <motion.a
                  key={social.name}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, scale: 0.8, y: 20 }}
                  animate={isInView ? { opacity: 1, scale: 1, y: 0 } : { opacity: 0, scale: 0.8, y: 20 }}
                  transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
                  whileHover={{ scale: 1.05, y: -8 }}
                  className="group relative"
                >
                  <div className={`absolute -inset-1 bg-gradient-to-r ${social.gradient} rounded-2xl opacity-0 group-hover:opacity-30 blur-xl transition-all duration-500`} />

                  <div className="relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-200 group-hover:border-transparent h-full">
                    <div className="flex flex-col items-center gap-4">
                      <div className={`relative p-4 rounded-xl bg-gradient-to-br ${social.gradient} text-white shadow-lg ${social.hoverGlow} transition-all duration-300`}>
                        <motion.div
                          whileHover={{ rotate: 360 }}
                          transition={{ duration: 0.6 }}
                        >
                          {social.icon}
                        </motion.div>

                        <motion.div
                          className="absolute -top-1 -right-1"
                          initial={{ scale: 0, opacity: 0 }}
                          whileHover={{ scale: 1, opacity: 1 }}
                          transition={{ duration: 0.3 }}
                        >
                          <Sparkles className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                        </motion.div>
                      </div>

                      <div className="text-center">
                        <p className="font-bold text-sm text-gray-800 group-hover:bg-gradient-to-r group-hover:from-purple-600 group-hover:to-pink-600 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300">
                          {social.name}
                        </p>
                      </div>

                      <motion.div
                        className="opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        initial={{ x: -5 }}
                        whileHover={{ x: 0 }}
                      >
                        <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                      </motion.div>
                    </div>
                  </div>
                </motion.a>
              ))}
            </div>

            {/* Mobile: Horizontal Scrolling */}
            <div className="md:hidden">
              <div className="overflow-x-auto overflow-y-hidden scrollbar-hide snap-x snap-mandatory">
                <div className="flex gap-6 pb-4 px-4">
                  {socials.map((social, index) => (
                    <motion.a
                      key={social.name}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      initial={{ opacity: 0, scale: 0.8, y: 20 }}
                      animate={isInView ? { opacity: 1, scale: 1, y: 0 } : { opacity: 0, scale: 0.8, y: 20 }}
                      transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
                      whileHover={{ scale: 1.05, y: -8 }}
                      className="group relative snap-center flex-shrink-0"
                      style={{ width: '70vw' }}
                    >
                      <div className={`absolute -inset-1 bg-gradient-to-r ${social.gradient} rounded-2xl opacity-0 group-hover:opacity-30 blur-xl transition-all duration-500`} />

                      <div className="relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-200 group-hover:border-transparent h-full">
                        <div className="flex flex-col items-center gap-4">
                          <div className={`relative p-4 rounded-xl bg-gradient-to-br ${social.gradient} text-white shadow-lg ${social.hoverGlow} transition-all duration-300`}>
                            <motion.div
                              whileHover={{ rotate: 360 }}
                              transition={{ duration: 0.6 }}
                            >
                              {social.icon}
                            </motion.div>

                            <motion.div
                              className="absolute -top-1 -right-1"
                              initial={{ scale: 0, opacity: 0 }}
                              whileHover={{ scale: 1, opacity: 1 }}
                              transition={{ duration: 0.3 }}
                            >
                              <Sparkles className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                            </motion.div>
                          </div>

                          <div className="text-center">
                            <p className="font-bold text-sm text-gray-800 group-hover:bg-gradient-to-r group-hover:from-purple-600 group-hover:to-pink-600 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300">
                              {social.name}
                            </p>
                          </div>

                          <motion.div
                            className="opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                            initial={{ x: -5 }}
                            whileHover={{ x: 0 }}
                          >
                            <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                            </svg>
                          </motion.div>
                        </div>
                      </div>
                    </motion.a>
                  ))}
                </div>
              </div>

              <div className="flex justify-center gap-2 mt-6">
                {socials.map((_, index) => (
                  <div
                    key={index}
                    className="w-2 h-2 rounded-full bg-blue-300 transition-all duration-300"
                  />
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="text-center"
        >
          <div className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-purple-100 via-pink-100 to-blue-100 border-2 border-dashed border-purple-300">
            <Mail className="w-6 h-6 text-purple-600" />
            <p className="text-lg font-semibold text-gray-700">
              {t('cta')}
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
