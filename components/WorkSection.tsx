'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';
import { ExternalLink, Play, X } from 'lucide-react';
import Image from 'next/image';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

function WorkCard({ work, index, isInView, t, onVideoClick }: any) {
  const [imageError, setImageError] = useState(false);
  // Initialize without timestamp to avoid hydration mismatch
  const [imgSrc, setImgSrc] = useState(work.imageUrl || `/images/projects/${work.imageName}.png`);
  const [isLoading, setIsLoading] = useState(true);

  // Add timestamp on client-side only to bust cache
  useEffect(() => {
    if (!work.imageUrl) {
      setImgSrc(`/images/projects/${work.imageName}.png?t=${Date.now()}`);
    }
  }, [work.imageUrl, work.imageName]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, rotateX: -10 }}
      animate={isInView ? { opacity: 1, y: 0, rotateX: 0 } : { opacity: 0, y: 50, rotateX: -10 }}
      transition={{
        duration: 0.6,
        delay: index * 0.15,
        ease: [0.23, 1, 0.32, 1]
      }}
      whileHover={{
        scale: 1.05,
        y: -10,
        rotateY: 5,
        rotateX: 5,
        transition: { duration: 0.4 }
      }}
      className="group relative rounded-3xl glass overflow-hidden cursor-pointer card-3d w-full h-full"
      style={{ transformStyle: 'preserve-3d' }}
    >
      {/* Image or Icon Display */}
      <div className="relative h-48 sm:h-52 md:h-56 overflow-hidden bg-gray-100 dark:bg-gray-800">
        {/* Video Play Button */}
        {work.videoUrl && (
          <button
            onClick={(e) => {
              e.preventDefault();
              onVideoClick(work);
            }}
            className="absolute top-4 right-4 z-20 bg-black/70 hover:bg-black/90 text-white rounded-full p-3 transition-all duration-300 hover:scale-110"
          >
            <Play className="w-5 h-5" />
          </button>
        )}
        {!imageError ? (
          <>
            {/* Skeleton Loader */}
            {isLoading && (
              <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 animate-pulse z-10" />
            )}
            {/* Project Image */}
            <Image
              src={imgSrc}
              alt={t(`${work.key}.title`)}
              fill
              className={`object-cover transition-all duration-500 group-hover:scale-110 ${isLoading ? 'scale-110 blur-xl grayscale' : 'scale-100 blur-0 grayscale-0'
                }`}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              onLoad={() => setIsLoading(false)}
              onError={() => {
                // Try different image extensions in order: png -> jpg -> jpeg -> webp
                const timestamp = Date.now();
                if (imgSrc.includes('.png')) {
                  setImgSrc(`/images/projects/${work.imageName}.jpg?t=${timestamp}`);
                  setIsLoading(true);
                } else if (imgSrc.includes('.jpg')) {
                  setImgSrc(`/images/projects/${work.imageName}.jpeg?t=${timestamp}`);
                  setIsLoading(true);
                } else if (imgSrc.includes('.jpeg')) {
                  setImgSrc(`/images/projects/${work.imageName}.webp?t=${timestamp}`);
                  setIsLoading(true);
                } else {
                  setImageError(true);
                }
              }}
              unoptimized
            />
            {/* Gradient Overlay */}
            <div className={`absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent`} />
          </>
        ) : (
          /* Fallback: Show logo or emoji icon */
          <div className={`w-full h-full flex items-center justify-center bg-gradient-to-br ${work.color} relative`}>
            <Image
              src="/images/nav/logo.png"
              alt="Logo"
              fill
              className="object-contain p-8 opacity-30"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              onError={(e) => {
                // If logo fails, hide it and show emoji
                e.currentTarget.style.display = 'none';
              }}
            />
            <motion.div
              className="text-8xl absolute"
              whileHover={{
                scale: 1.2,
                rotate: [0, -10, 10, -10, 0],
                transition: { duration: 0.5 }
              }}
            >
              {work.icon}
            </motion.div>
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="relative p-4 sm:p-5 md:p-6 min-h-[140px] sm:min-h-[150px] md:min-h-[160px] flex flex-col justify-between">
        {/* Animated Gradient Background */}
        <div
          className={`absolute inset-0 bg-gradient-to-br ${work.color} opacity-0 group-hover:opacity-20 transition-all duration-500 animate-gradient-shift`}
        />

        {/* Glow effect on hover */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
          <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${work.color} blur-3xl opacity-50`} />
        </div>

        {/* Text Content */}
        <div className="relative z-10">
          <h3 className="text-xl sm:text-2xl font-bold mb-2 flex items-center gap-2">
            {t(`${work.key}.title`)}
            <ExternalLink className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />
          </h3>
          <p className="text-sm sm:text-base opacity-70 group-hover:opacity-90 transition-opacity line-clamp-3">
            {t(`${work.key}.description`)}
          </p>
        </div>

        {/* Bottom gradient line */}
        <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${work.color} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left`} />
      </div>

      {/* External Link */}
      {work.link && (
        <a
          href={work.link}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute top-4 left-4 z-20 bg-white/90 dark:bg-black/90 text-gray-900 dark:text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110"
        >
          <ExternalLink className="w-4 h-4" />
        </a>
      )}
    </motion.div>
  );
}

export function WorkSection() {
  const t = useTranslations('work');
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const [selectedVideo, setSelectedVideo] = useState<any>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const works = [
    {
      key: 'himeberry',
      icon: '🍓',
      imageName: 'himeberry',
      color: 'from-red-400 to-pink-400',
      link: 'https://www.himeberry.com',
      videoUrl: '', // Add video URL here if available
    },
    {
      key: 'ourFarms',
      icon: '🌱',
      imageName: 'our-farms',
      color: 'from-green-400 to-emerald-400',
      link: 'https://thefocus-on.com/wakayama_nanami/',
      videoUrl: '', // Add video URL here if available
    },
    {
      key: 'seplumo',
      icon: '👗',
      imageName: 'seplumo',
      color: 'from-purple-400 to-pink-400',
      link: 'https://seplumo.com/',
      videoUrl: '', // Add video URL here if available
    },
    {
      key: 'enwa',
      icon: '🏢',
      imageName: 'enwa-tokyo',
      color: 'from-blue-400 to-cyan-400',
      link: 'https://www.enwa-tokyo.com/',
      videoUrl: '', // Add video URL here if available
    },
    {
      key: 'jobmatchy',
      icon: '💼',
      imageName: 'jobmatchy',
      color: 'from-orange-400 to-yellow-400',
      link: 'https://www.jobmatchy.jp/',
      videoUrl: '', // Add video URL here if available
    },
    {
      key: 'lernado',
      icon: '🎓',
      imageName: 'lernado',
      color: 'from-indigo-400 to-purple-400',
      link: 'https://lernado-school.com/',
      videoUrl: '', // Add video URL here if available
    },
  ];

  return (
    <section id="work" className="py-32 bg-white dark:bg-black" ref={ref}>
      <div className="max-w-7xl mx-auto px-6">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6 }}
          className="text-5xl md:text-6xl font-bold mb-16 text-center"
        >
          {t('title')}
        </motion.h2>

        {/* Mobile Slider */}
        {isMobile ? (
          <div className="md:hidden">
            <Swiper
              modules={[Navigation, Pagination, Autoplay]}
              spaceBetween={20}
              slidesPerView={1}
              navigation
              pagination={{ clickable: true }}
              autoplay={{ delay: 3500, disableOnInteraction: false }}
              className="work-swiper pb-12"
              style={{ height: 'auto' }}
            >
              {works.map((work, index) => (
                <SwiperSlide key={work.key} style={{ height: 'auto' }}>
                  <div className="h-full min-h-[400px] sm:min-h-[420px]">
                    <WorkCard
                      work={work}
                      index={index}
                      isInView={isInView}
                      t={t}
                      onVideoClick={setSelectedVideo}
                    />
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        ) : (
          /* Desktop Grid */
          <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {works.map((work, index) => (
              <div key={work.key} className="h-full min-h-[440px]">
                <WorkCard
                  work={work}
                  index={index}
                  isInView={isInView}
                  t={t}
                  onVideoClick={setSelectedVideo}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Video Modal */}
      {selectedVideo && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/95 p-4 sm:p-6 md:p-8"
          onClick={() => setSelectedVideo(null)}
        >
          <button
            onClick={() => setSelectedVideo(null)}
            className="absolute top-2 right-2 sm:top-4 sm:right-4 bg-white/20 hover:bg-white/30 text-white rounded-full p-2 sm:p-3 transition-all duration-300 hover:scale-110 z-10"
            aria-label="Close video"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
          <div
            className="relative w-full max-w-5xl aspect-video bg-black rounded-lg sm:rounded-xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <iframe
              src={selectedVideo.videoUrl}
              title={t(`${selectedVideo.key}.title`)}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </motion.div>
      )}
    </section>
  );
}
