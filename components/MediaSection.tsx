'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';
import { Video, FileText, Mic, Play } from 'lucide-react';
import Image from 'next/image';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

function VideoCard({ video, index, isInView, t }: any) {
  const [imageError, setImageError] = useState(false);
  const [useYouTubeThumbnail, setUseYouTubeThumbnail] = useState(false);
  // Initialize with a default image path to avoid empty src error
  const [imgSrc, setImgSrc] = useState(video.imageUrl || `/images/media/${video.imageName}.jpg`);
  const [isLoading, setIsLoading] = useState(true);

  // Extract YouTube video ID from URL
  const getYouTubeVideoId = (url: string) => {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/);
    return match ? match[1] : null;
  };

  // Add timestamp on client-side only to bust cache
  useEffect(() => {
    if (!video.imageUrl) {
      setImgSrc(`/images/media/${video.imageName}.jpg?t=${Date.now()}`);
    }
  }, [video.imageUrl, video.imageName]);

  return (
    <motion.a
      href={video.url}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, y: 30, rotateX: -10 }}
      animate={isInView ? { opacity: 1, y: 0, rotateX: 0 } : { opacity: 0, y: 30, rotateX: -10 }}
      transition={{ duration: 0.6, delay: index * 0.2 }}
      whileHover={{ scale: 1.02, y: -12 }}
      className="group relative aspect-video rounded-3xl overflow-hidden cursor-pointer shadow-2xl"
    >
      {/* Glow Effect on Hover */}
      <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 rounded-3xl opacity-0 group-hover:opacity-20 blur-xl transition-all duration-500" />

      <div className="relative h-full w-full rounded-3xl overflow-hidden bg-gray-900">
        {!imageError && imgSrc ? (
          <>
            {/* Loading Skeleton */}
            {isLoading && (
              <div className="absolute inset-0 bg-gradient-to-br from-purple-200 via-pink-200 to-blue-200 dark:from-purple-900 dark:via-pink-900 dark:to-blue-900 animate-pulse z-10" />
            )}
            {/* Video Thumbnail Image */}
            <Image
              src={imgSrc}
              alt={t(video.key)}
              fill
              className={`object-cover transition-all duration-700 group-hover:scale-110 group-hover:brightness-110 ${isLoading ? 'scale-110 blur-xl grayscale' : 'scale-100 blur-0 grayscale-0'
                }`}
              sizes="(max-width: 768px) 100vw, 50vw"
              onLoad={() => setIsLoading(false)}
              onError={() => {
                const timestamp = Date.now();
                const videoId = getYouTubeVideoId(video.url);

                // Try different image extensions
                if (imgSrc.includes('.jpg') && !imgSrc.includes('youtube')) {
                  setImgSrc(`/images/media/${video.imageName}.png?t=${timestamp}`);
                  setIsLoading(true);
                } else if (imgSrc.includes('.png')) {
                  setImgSrc(`/images/media/${video.imageName}.jpeg?t=${timestamp}`);
                  setIsLoading(true);
                } else if (imgSrc.includes('.jpeg')) {
                  setImgSrc(`/images/media/${video.imageName}.webp?t=${timestamp}`);
                  setIsLoading(true);
                } else if (imgSrc.includes('.webp') && videoId) {
                  // Fallback to YouTube thumbnail
                  setImgSrc(`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`);
                  setUseYouTubeThumbnail(true);
                  setIsLoading(true);
                } else {
                  setImageError(true);
                }
              }}
              unoptimized
              suppressHydrationWarning
            />
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
          </>
        ) : (
          /* Fallback: Logo + Emoji */
          <>
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/30 via-pink-500/30 to-blue-500/30 animate-gradient-shift" />
            <Image
              src="/images/nav/logo.png"
              alt="Logo"
              fill
              className="object-contain p-12 opacity-20"
              sizes="(max-width: 768px) 100vw, 50vw"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div
                className="text-9xl drop-shadow-2xl"
                whileHover={{ scale: 1.2, rotate: [0, -8, 8, 0] }}
                transition={{ duration: 0.5 }}
              >
                {video.thumbnail}
              </motion.div>
            </div>
          </>
        )}

        {/* Play Button Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/80 via-pink-900/80 to-blue-900/80 opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-center justify-center backdrop-blur-md">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex flex-col items-center gap-4"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-white/20 rounded-full blur-2xl animate-pulse" />
              <div className="relative bg-white/10 backdrop-blur-sm rounded-full p-6 border-2 border-white/40">
                <Video className="w-12 h-12 text-white drop-shadow-lg" />
              </div>
            </div>
            <span className="text-white text-lg font-bold tracking-wide drop-shadow-lg">Watch Now</span>
          </motion.div>
        </div>

        {/* Title with Enhanced Styling */}
        <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black/95 via-black/70 to-transparent">
          <motion.div
            initial={{ x: -10, opacity: 0.8 }}
            whileHover={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-red-600/90 backdrop-blur-sm">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                <span className="text-white text-xs font-bold uppercase tracking-wider">Video</span>
              </div>
            </div>
            <p className="text-white text-xl font-bold drop-shadow-lg leading-tight" suppressHydrationWarning>{t(video.key)}</p>
          </motion.div>
        </div>
      </div>
    </motion.a>
  );
}

function ArticleCard({ article, index, isInView, t }: any) {
  const [imageError, setImageError] = useState(false);
  // Initialize without timestamp to avoid hydration mismatch
  const [imgSrc, setImgSrc] = useState(article.imageUrl || `/images/media/${article.imageName}.jpg`);
  const [isLoading, setIsLoading] = useState(true);

  // Add timestamp on client-side only to bust cache
  useEffect(() => {
    if (!article.imageUrl) {
      setImgSrc(`/images/media/${article.imageName}.jpg?t=${Date.now()}`);
    }
  }, [article.imageUrl, article.imageName]);

  return (
    <motion.a
      href={article.url}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, y: 30, scale: 0.9 }}
      animate={isInView ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 30, scale: 0.9 }}
      transition={{ duration: 0.5, delay: index * 0.08 + 0.4 }}
      whileHover={{ scale: 1.03, y: -8 }}
      className="group relative rounded-2xl overflow-hidden cursor-pointer shadow-lg hover:shadow-2xl transition-all duration-300 bg-white dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700 hover:border-purple-400 dark:hover:border-purple-600"
    >
      {/* Gradient Border Glow on Hover */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 rounded-2xl opacity-0 group-hover:opacity-30 blur transition-all duration-500" />

      <div className="relative bg-white dark:bg-gray-800 rounded-2xl overflow-hidden h-full">
        {!imageError && imgSrc ? (
          <>
            {/* Article Thumbnail */}
            <div className="relative h-40 overflow-hidden bg-gradient-to-br from-purple-100 via-pink-100 to-blue-100 dark:from-purple-900/20 dark:via-pink-900/20 dark:to-blue-900/20">
              {isLoading && (
                <div className="absolute inset-0 bg-gradient-to-br from-purple-200 via-pink-200 to-blue-200 dark:from-purple-900/40 dark:via-pink-900/40 dark:to-blue-900/40 animate-pulse z-10" />
              )}
              <Image
                src={imgSrc}
                alt={t(article.key)}
                fill
                className={`object-cover transition-all duration-700 group-hover:scale-110 group-hover:brightness-105 ${isLoading ? 'scale-110 blur-xl grayscale' : 'scale-100 blur-0 grayscale-0'
                  }`}
                sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                onLoad={() => setIsLoading(false)}
                onError={() => {
                  // Try different image extensions in order: jpg -> png -> jpeg -> webp
                  const timestamp = Date.now();
                  if (imgSrc.includes('.jpg')) {
                    setImgSrc(`/images/media/${article.imageName}.png?t=${timestamp}`);
                    setIsLoading(true);
                  } else if (imgSrc.includes('.png')) {
                    setImgSrc(`/images/media/${article.imageName}.jpeg?t=${timestamp}`);
                    setIsLoading(true);
                  } else if (imgSrc.includes('.jpeg')) {
                    setImgSrc(`/images/media/${article.imageName}.webp?t=${timestamp}`);
                    setIsLoading(true);
                  } else {
                    setImageError(true);
                  }
                }}
                unoptimized
                suppressHydrationWarning
              />
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-300" />

              {/* Icon Badge */}
              <div className="absolute top-3 right-3 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full p-2.5 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <motion.div
                  className="text-purple-600 dark:text-purple-400"
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                >
                  {article.icon}
                </motion.div>
              </div>
            </div>

            {/* Text Content */}
            <div className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="h-1 w-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full group-hover:w-12 transition-all duration-300" />
                <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Article
                </span>
              </div>
              <h4 className="font-bold text-sm line-clamp-3 text-gray-900 dark:text-gray-100 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors duration-300 leading-relaxed" suppressHydrationWarning>
                {t(article.key)}
              </h4>

              {/* Read More Indicator */}
              <div className="mt-4 flex items-center gap-2 text-purple-600 dark:text-purple-400 opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:translate-x-1">
                <span className="text-xs font-semibold">Read More</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </>
        ) : (
          /* Fallback: Logo + Icon Display */
          <div className="p-6 h-full flex flex-col justify-center items-center text-center bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-purple-900/10 dark:via-pink-900/10 dark:to-blue-900/10 relative">
            <Image
              src="/images/nav/logo.png"
              alt="Logo"
              fill
              className="object-contain p-8 opacity-10"
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
            <motion.div
              className="mb-4 p-4 rounded-full bg-white dark:bg-gray-800 shadow-lg text-purple-500 dark:text-purple-400 relative z-10"
              whileHover={{ rotate: 360, scale: 1.2 }}
              transition={{ duration: 0.6 }}
            >
              {article.icon}
            </motion.div>
            <div className="h-1 w-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mb-3 relative z-10" />
            <h4 className="font-bold text-sm line-clamp-4 text-gray-900 dark:text-gray-100 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors leading-relaxed relative z-10" suppressHydrationWarning>
              {t(article.key)}
            </h4>
          </div>
        )}
      </div>
    </motion.a>
  );
}

export function MediaSection() {
  const t = useTranslations('media');
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const videos = [
    {
      key: 'tedx',
      url: 'https://www.youtube.com/watch?v=m2z6BRkCbSA',
      thumbnail: '🎤',
      imageName: 'tedx',
    },
    {
      key: 'nepalEarthquake',
      url: 'https://www.youtube.com/watch?v=c0A-E14HvhM',
      thumbnail: '🏔️',
      imageName: 'nepal-earthquake',
    },
  ];

  const articles = [
    {
      key: 'seplumo2019',
      url: 'https://seplumo.com/blogs/news/art-of-life-%E3%82%A4%E3%83%B3%E3%82%BF%E3%83%93%E3%83%A5%E3%83%BC-2019-10',
      icon: <FileText className="w-6 h-6" />,
      imageName: 'seplumo-interview',
    },
    {
      key: 'himeberryDelicious',
      url: 'https://www.delicious-japan.com/posts/20230721-himeberry.html',
      icon: <FileText className="w-6 h-6" />,
      imageName: 'himeberry-delicious',
    },
    {
      key: 'focusOn',
      url: 'https://thefocus-on.com/wakayama_nanami/',
      icon: <Mic className="w-6 h-6" />,
      imageName: 'focus-on',
    },
    {
      key: 'businessInsider',
      url: 'https://www.businessinsider.jp/article/288780/',
      icon: <FileText className="w-6 h-6" />,
      imageName: 'business-insider',
    },
    {
      key: 'harajuku',
      url: 'https://harajuku-omotesando-shimbun.com/archives/2337',
      icon: <Mic className="w-6 h-6" />,
      imageName: 'harajuku-omotesando',
    },
    {
      key: 'erisSelect',
      url: 'https://eris-select.com/things/seplumo/',
      icon: <FileText className="w-6 h-6" />,
      imageName: 'eris-select',
    },
    {
      key: 'awlf',
      url: 'https://awlf.or.jp/ja/connect-with-asia-women/nanami-wakayama-ja/',
      icon: <Mic className="w-6 h-6" />,
      imageName: 'awlf',
    },
    {
      key: 'facebookCommunity',
      url: 'https://www.facebook.com/groups/1306700827523311/posts/1309221273937933',
      icon: <FileText className="w-6 h-6" />,
      imageName: 'facebook-community',
    },
  ];

  return (
    <section id="media" className="relative py-32 overflow-hidden" ref={ref}>
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-gray-900 dark:via-purple-950/20 dark:to-gray-900" />
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.02] dark:opacity-[0.05]" />

      {/* Floating Orbs */}
      <motion.div
        className="absolute top-20 left-10 w-64 h-64 bg-purple-400/10 rounded-full blur-3xl"
        animate={{
          x: [0, 50, 0],
          y: [0, 30, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-20 right-10 w-80 h-80 bg-pink-400/10 rounded-full blur-3xl"
        animate={{
          x: [0, -40, 0],
          y: [0, -50, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="relative max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.6 }}
            className="inline-block"
          >
            <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-md mb-6 border border-purple-300 dark:border-purple-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              <Video className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              <span className="text-sm font-bold text-purple-700 dark:text-purple-300 uppercase tracking-wider">
                Featured In
              </span>
            </div>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 dark:from-purple-400 dark:via-pink-400 dark:to-blue-400 bg-clip-text text-transparent"
          >
            {t('title')}
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto"
          >
            {t('subtitle')}
          </motion.p>
        </div>

        {/* Videos Showcase */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="mb-24"
        >
          <div className="flex items-center gap-4 mb-10">
            <div className="flex items-center gap-3 px-5 py-2 rounded-full bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700">
              <Video className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
                {t('videos')}
              </h3>
            </div>
            <div className="flex-1 h-px bg-gradient-to-r from-purple-200 via-pink-200 to-transparent dark:from-purple-800 dark:via-pink-800" />
          </div>

          {/* Desktop Grid / Mobile Slider */}
          {isMobile ? (
            <div className="md:hidden">
              <Swiper
                modules={[Navigation, Pagination, Autoplay]}
                spaceBetween={20}
                slidesPerView={1}
                navigation
                pagination={{ clickable: true }}
                autoplay={{ delay: 4000, disableOnInteraction: false }}
                className="media-swiper pb-12"
              >
                {videos.map((video, index) => (
                  <SwiperSlide key={index}>
                    <VideoCard
                      video={video}
                      index={index}
                      isInView={isInView}
                      t={t}
                    />
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          ) : (
            <div className="hidden md:grid md:grid-cols-2 gap-8">
              {videos.map((video, index) => (
                <VideoCard
                  key={index}
                  video={video}
                  index={index}
                  isInView={isInView}
                  t={t}
                />
              ))}
            </div>
          )}
        </motion.div>

        {/* Articles Grid */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
          transition={{ duration: 0.7, delay: 0.5 }}
        >
          <div className="flex items-center gap-4 mb-10">
            <div className="flex items-center gap-3 px-5 py-2 rounded-full bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700">
              <FileText className="w-6 h-6 text-pink-600 dark:text-pink-400" />
              <h3 className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 dark:from-pink-400 dark:to-purple-400 bg-clip-text text-transparent">
                {t('featured')}
              </h3>
            </div>
            <div className="flex-1 h-px bg-gradient-to-r from-pink-200 via-purple-200 to-transparent dark:from-pink-800 dark:via-purple-800" />
          </div>

          {/* Desktop Grid / Mobile Slider */}
          {isMobile ? (
            <div className="md:hidden">
              <Swiper
                modules={[Navigation, Pagination, Autoplay]}
                spaceBetween={20}
                slidesPerView={1.2}
                centeredSlides={false}
                navigation
                pagination={{ clickable: true }}
                autoplay={{ delay: 3500, disableOnInteraction: false }}
                className="media-swiper pb-12"
                breakpoints={{
                  480: {
                    slidesPerView: 1.5,
                    spaceBetween: 15
                  },
                  640: {
                    slidesPerView: 2,
                    spaceBetween: 20
                  }
                }}
              >
                {articles.map((article, index) => (
                  <SwiperSlide key={index}>
                    <ArticleCard
                      article={article}
                      index={index}
                      isInView={isInView}
                      t={t}
                    />
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          ) : (
            <div className="hidden md:grid md:grid-cols-4 gap-6">
              {articles.map((article, index) => (
                <ArticleCard
                  key={index}
                  article={article}
                  index={index}
                  isInView={isInView}
                  t={t}
                />
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
}
