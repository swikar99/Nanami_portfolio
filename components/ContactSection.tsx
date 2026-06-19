'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';
import { Instagram, Facebook, Link as LinkIcon, Users, Mail, Send, Sparkles, ExternalLink } from 'lucide-react';

interface SocialLink {
  key: string;
  name: string;
  url: string;
  icon: string;
  gradient: string;
}

const ICON_MAP: Record<string, React.ReactNode> = {
  Instagram: <Instagram className="w-7 h-7" />,
  Facebook: <Facebook className="w-7 h-7" />,
  Link: <LinkIcon className="w-7 h-7" />,
  Users: <Users className="w-7 h-7" />,
  ExternalLink: <ExternalLink className="w-7 h-7" />,
  Mail: <Mail className="w-7 h-7" />,
};

export function ContactSection() {
  const t = useTranslations('contact');
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const [socials, setSocials] = useState<SocialLink[]>([]);

  useEffect(() => {
    fetch('/api/content/socials')
      .then((r) => r.json())
      .then((json) => setSocials(json.items || []))
      .catch(() => {});
  }, []);

  return (
    <section id="contact" className="relative py-32 overflow-hidden bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50" ref={ref}>
      <motion.div className="absolute top-20 right-10 w-72 h-72 bg-blue-200/30 rounded-full blur-3xl"
        animate={{ x: [0, -60, 0], y: [0, 40, 0], scale: [1, 1.15, 1] }}
        transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }} />
      <motion.div className="absolute bottom-20 left-10 w-96 h-96 bg-purple-200/30 rounded-full blur-3xl"
        animate={{ x: [0, 50, 0], y: [0, -60, 0], scale: [1, 1.2, 1] }}
        transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut' }} />

      <div className="relative max-w-5xl mx-auto px-6">
        <div className="text-center mb-16">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }} transition={{ duration: 0.6 }} className="inline-block">
            <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 mb-6 border border-blue-200">
              <Send className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-semibold text-blue-800 uppercase tracking-wider">Let's Connect</span>
            </div>
          </motion.div>
          <motion.h2 initial={{ opacity: 0, y: 30 }} animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }} transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            {t('title')}
          </motion.h2>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }} transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            {t('description')}
          </motion.p>
        </div>

        {socials.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 40 }} animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }} transition={{ duration: 0.7, delay: 0.3 }} className="mb-16">
            <div className="flex items-center justify-center gap-4 mb-12">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-blue-200 to-transparent" />
              <h3 className="text-2xl font-bold text-gray-800 px-6">{t('social')}</h3>
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-purple-200 to-transparent" />
            </div>

            {/* Desktop */}
            <div className="hidden md:grid gap-6" style={{ gridTemplateColumns: `repeat(${Math.min(socials.length, 4)}, 1fr)` }}>
              {socials.map((social, index) => (
                <motion.a key={social.key} href={social.url} target="_blank" rel="noopener noreferrer"
                  initial={{ opacity: 0, scale: 0.8, y: 20 }}
                  animate={isInView ? { opacity: 1, scale: 1, y: 0 } : { opacity: 0, scale: 0.8, y: 20 }}
                  transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
                  whileHover={{ scale: 1.05, y: -8 }}
                  className="group relative">
                  <div className={`absolute -inset-1 bg-gradient-to-r ${social.gradient} rounded-2xl opacity-0 group-hover:opacity-30 blur-xl transition-all duration-500`} />
                  <div className="relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-200 group-hover:border-transparent h-full">
                    <div className="flex flex-col items-center gap-4">
                      <div className={`relative p-4 rounded-xl bg-gradient-to-br ${social.gradient} text-white shadow-lg transition-all duration-300`}>
                        <motion.div whileHover={{ rotate: 360 }} transition={{ duration: 0.6 }}>
                          {ICON_MAP[social.icon] ?? <ExternalLink className="w-7 h-7" />}
                        </motion.div>
                        <motion.div className="absolute -top-1 -right-1" initial={{ scale: 0, opacity: 0 }} whileHover={{ scale: 1, opacity: 1 }} transition={{ duration: 0.3 }}>
                          <Sparkles className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                        </motion.div>
                      </div>
                      <p className="font-bold text-sm text-gray-800 group-hover:bg-gradient-to-r group-hover:from-purple-600 group-hover:to-pink-600 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300 text-center">
                        {social.name}
                      </p>
                    </div>
                  </div>
                </motion.a>
              ))}
            </div>

            {/* Mobile */}
            <div className="md:hidden overflow-x-auto overflow-y-hidden scrollbar-hide snap-x snap-mandatory">
              <div className="flex gap-6 pb-4 px-4">
                {socials.map((social, index) => (
                  <motion.a key={social.key} href={social.url} target="_blank" rel="noopener noreferrer"
                    initial={{ opacity: 0, scale: 0.8, y: 20 }}
                    animate={isInView ? { opacity: 1, scale: 1, y: 0 } : { opacity: 0, scale: 0.8, y: 20 }}
                    transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
                    className="group relative snap-center flex-shrink-0" style={{ width: '70vw' }}>
                    <div className={`absolute -inset-1 bg-gradient-to-r ${social.gradient} rounded-2xl opacity-0 group-hover:opacity-30 blur-xl transition-all`} />
                    <div className="relative bg-white rounded-2xl p-8 shadow-lg border border-gray-200 h-full">
                      <div className="flex flex-col items-center gap-4">
                        <div className={`p-4 rounded-xl bg-gradient-to-br ${social.gradient} text-white shadow-lg`}>
                          {ICON_MAP[social.icon] ?? <ExternalLink className="w-7 h-7" />}
                        </div>
                        <p className="font-bold text-sm text-gray-800 text-center">{social.name}</p>
                      </div>
                    </div>
                  </motion.a>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        <motion.div initial={{ opacity: 0, y: 30 }} animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }} transition={{ duration: 0.6, delay: 0.8 }} className="text-center">
          <div className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-purple-100 via-pink-100 to-blue-100 border-2 border-dashed border-purple-300">
            <Mail className="w-6 h-6 text-purple-600" />
            <p className="text-lg font-semibold text-gray-700">{t('cta')}</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
