'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Video, FileText, Mic } from 'lucide-react';
import Image from 'next/image';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

interface MediaData {
  key: string;
  type: 'video' | 'article';
  url: string;
  imageName: string;
  thumbnail: string;
  label: string;
}

function VideoCard({ video, index, isInView }: { video: MediaData; index: number; isInView: boolean }) {
  const [imageError, setImageError] = useState(false);
  const [imgSrc, setImgSrc] = useState(`/images/media/${video.imageName}.jpg`);
  const [isLoading, setIsLoading] = useState(true);

  const getYouTubeVideoId = (url: string) => {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/);
    return match ? match[1] : null;
  };

  useEffect(() => {
    setImgSrc(`/images/media/${video.imageName}.jpg?t=${Date.now()}`);
  }, [video.imageName]);

  return (
    <motion.a href={video.url} target="_blank" rel="noopener noreferrer"
      initial={{ opacity: 0, y: 30, rotateX: -10 }}
      animate={isInView ? { opacity: 1, y: 0, rotateX: 0 } : { opacity: 0, y: 30, rotateX: -10 }}
      transition={{ duration: 0.6, delay: index * 0.2 }}
      whileHover={{ scale: 1.02, y: -12 }}
      className="group relative aspect-video rounded-3xl overflow-hidden cursor-pointer shadow-xl"
    >
      <div className="absolute -inset-1 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 rounded-3xl opacity-0 group-hover:opacity-20 blur-xl transition-all duration-500" />
      <div className="relative h-full w-full rounded-3xl overflow-hidden bg-gray-100">
        {!imageError ? (
          <>
            {isLoading && <div className="absolute inset-0 bg-gradient-to-br from-purple-100 via-pink-100 to-blue-100 animate-pulse z-10" />}
            <Image src={imgSrc} alt={video.label} fill
              className={`object-cover transition-all duration-700 group-hover:scale-110 group-hover:brightness-110 ${isLoading ? 'scale-110 blur-xl grayscale' : 'scale-100 blur-0 grayscale-0'}`}
              sizes="(max-width: 768px) 100vw, 50vw"
              onLoad={() => setIsLoading(false)}
              onError={() => {
                const ts = Date.now();
                const videoId = getYouTubeVideoId(video.url);
                if (imgSrc.includes('.jpg') && !imgSrc.includes('youtube')) { setImgSrc(`/images/media/${video.imageName}.png?t=${ts}`); setIsLoading(true); }
                else if (imgSrc.includes('.png')) { setImgSrc(`/images/media/${video.imageName}.jpeg?t=${ts}`); setIsLoading(true); }
                else if (imgSrc.includes('.jpeg')) { setImgSrc(`/images/media/${video.imageName}.webp?t=${ts}`); setIsLoading(true); }
                else if (imgSrc.includes('.webp') && videoId) { setImgSrc(`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`); setIsLoading(true); }
                else setImageError(true);
              }}
              unoptimized suppressHydrationWarning
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          </>
        ) : (
          <>
            <div className="absolute inset-0 bg-gradient-to-br from-purple-200 via-pink-200 to-blue-200" />
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div className="text-9xl drop-shadow-2xl" whileHover={{ scale: 1.2, rotate: [0, -8, 8, 0] }} transition={{ duration: 0.5 }}>
                {video.thumbnail}
              </motion.div>
            </div>
          </>
        )}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/70 via-pink-600/70 to-blue-600/70 opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-center justify-center backdrop-blur-sm">
          <motion.div className="flex flex-col items-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 bg-white/20 rounded-full blur-2xl animate-pulse" />
              <div className="relative bg-white/20 backdrop-blur-sm rounded-full p-6 border-2 border-white/40">
                <Video className="w-12 h-12 text-white drop-shadow-lg" />
              </div>
            </div>
            <span className="text-white text-lg font-bold tracking-wide drop-shadow-lg">Watch Now</span>
          </motion.div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black/90 via-black/60 to-transparent">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-red-600/90 backdrop-blur-sm">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
              <span className="text-white text-xs font-bold uppercase tracking-wider">Video</span>
            </div>
          </div>
          <p className="text-white text-xl font-bold drop-shadow-lg leading-tight" suppressHydrationWarning>{video.label}</p>
        </div>
      </div>
    </motion.a>
  );
}

const ARTICLE_ICONS: Record<string, React.ReactNode> = {
  default: <FileText className="w-6 h-6" />,
  speech: <Mic className="w-6 h-6" />,
};

function ArticleCard({ article, index, isInView }: { article: MediaData; index: number; isInView: boolean }) {
  const [imageError, setImageError] = useState(false);
  const [imgSrc, setImgSrc] = useState(`/images/media/${article.imageName}.jpg`);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setImgSrc(`/images/media/${article.imageName}.jpg?t=${Date.now()}`);
  }, [article.imageName]);

  const icon = ARTICLE_ICONS.default;

  return (
    <motion.a href={article.url} target="_blank" rel="noopener noreferrer"
      initial={{ opacity: 0, y: 30, scale: 0.9 }}
      animate={isInView ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 30, scale: 0.9 }}
      transition={{ duration: 0.5, delay: index * 0.08 + 0.4 }}
      whileHover={{ scale: 1.03, y: -8 }}
      className="group relative rounded-2xl overflow-hidden cursor-pointer shadow-lg hover:shadow-2xl transition-all duration-300 bg-white border border-gray-200 hover:border-purple-400"
    >
      <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 rounded-2xl opacity-0 group-hover:opacity-30 blur transition-all duration-500" />
      <div className="relative bg-white rounded-2xl overflow-hidden h-full">
        {!imageError ? (
          <>
            <div className="relative h-40 overflow-hidden bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
              {isLoading && <div className="absolute inset-0 bg-gradient-to-br from-purple-100 via-pink-100 to-blue-100 animate-pulse z-10" />}
              <Image src={imgSrc} alt={article.label} fill
                className={`object-cover transition-all duration-700 group-hover:scale-110 group-hover:brightness-105 ${isLoading ? 'scale-110 blur-xl grayscale' : 'scale-100 blur-0 grayscale-0'}`}
                sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                onLoad={() => setIsLoading(false)}
                onError={() => {
                  const ts = Date.now();
                  if (imgSrc.includes('.jpg')) { setImgSrc(`/images/media/${article.imageName}.png?t=${ts}`); setIsLoading(true); }
                  else if (imgSrc.includes('.png')) { setImgSrc(`/images/media/${article.imageName}.jpeg?t=${ts}`); setIsLoading(true); }
                  else if (imgSrc.includes('.jpeg')) { setImgSrc(`/images/media/${article.imageName}.webp?t=${ts}`); setIsLoading(true); }
                  else setImageError(true);
                }}
                unoptimized suppressHydrationWarning
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-300" />
              <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full p-2.5 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <motion.div className="text-purple-600" whileHover={{ rotate: 360 }} transition={{ duration: 0.6 }}>{icon}</motion.div>
              </div>
            </div>
            <div className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="h-1 w-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full group-hover:w-12 transition-all duration-300" />
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Article</span>
              </div>
              <h4 className="font-bold text-sm line-clamp-3 text-gray-900 group-hover:text-purple-600 transition-colors duration-300 leading-relaxed" suppressHydrationWarning>
                {article.label}
              </h4>
              <div className="mt-4 flex items-center gap-2 text-purple-600 opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:translate-x-1">
                <span className="text-xs font-semibold">Read More</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </>
        ) : (
          <div className="p-6 h-full flex flex-col justify-center items-center text-center bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 relative">
            <motion.div className="mb-4 p-4 rounded-full bg-white shadow-lg text-purple-500 relative z-10" whileHover={{ rotate: 360, scale: 1.2 }} transition={{ duration: 0.6 }}>
              {icon}
            </motion.div>
            <div className="h-1 w-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mb-3 relative z-10" />
            <h4 className="font-bold text-sm line-clamp-4 text-gray-900 group-hover:text-purple-600 transition-colors leading-relaxed relative z-10" suppressHydrationWarning>
              {article.label}
            </h4>
          </div>
        )}
      </div>
    </motion.a>
  );
}

export function MediaSection() {
  const t = useTranslations('media');
  const { locale } = useParams<{ locale: string }>();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const [isMobile, setIsMobile] = useState(false);
  const [items, setItems] = useState<MediaData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const currentLocale = locale || 'en';
    fetch(`/api/content/media?locale=${currentLocale}`)
      .then((r) => r.json())
      .then((json) => { setItems(json.items || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [locale]);

  const videos = items.filter((i) => i.type === 'video');
  const articles = items.filter((i) => i.type === 'article');

  return (
    <section id="media" className="relative py-32 overflow-hidden bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50" ref={ref}>
      <motion.div className="absolute top-20 left-10 w-64 h-64 bg-purple-200/30 rounded-full blur-3xl"
        animate={{ x: [0, 50, 0], y: [0, 30, 0], scale: [1, 1.1, 1] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }} />
      <motion.div className="absolute bottom-20 right-10 w-80 h-80 bg-pink-200/30 rounded-full blur-3xl"
        animate={{ x: [0, -40, 0], y: [0, -50, 0], scale: [1, 1.2, 1] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }} />

      <div className="relative max-w-7xl mx-auto px-6">
        <div className="text-center mb-20">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }} transition={{ duration: 0.6 }} className="inline-block">
            <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-white/80 backdrop-blur-md mb-6 border border-purple-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              <Video className="w-5 h-5 text-purple-600" />
              <span className="text-sm font-bold text-purple-700 uppercase tracking-wider">Featured In</span>
            </div>
          </motion.div>
          <motion.h2 initial={{ opacity: 0, y: 30 }} animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }} transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
            {t('title')}
          </motion.h2>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }} transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg text-gray-600 max-w-2xl mx-auto">
            {t('subtitle')}
          </motion.p>
        </div>

        {/* Videos */}
        {(loading || videos.length > 0) && (
          <motion.div initial={{ opacity: 0, y: 40 }} animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }} transition={{ duration: 0.7, delay: 0.3 }} className="mb-24">
            <div className="flex items-center gap-4 mb-10">
              <div className="flex items-center gap-3 px-5 py-2 rounded-full bg-white shadow-lg border border-gray-100">
                <Video className="w-6 h-6 text-purple-600" />
                <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">{t('videos')}</h3>
              </div>
              <div className="flex-1 h-px bg-gradient-to-r from-purple-200 via-pink-200 to-transparent" />
            </div>
            {loading ? (
              <div className="grid md:grid-cols-2 gap-8">
                {[0, 1].map((i) => <div key={i} className="aspect-video rounded-3xl bg-gray-200 animate-pulse" />)}
              </div>
            ) : isMobile ? (
              <div className="md:hidden">
                <Swiper modules={[Navigation, Pagination, Autoplay]} spaceBetween={20} slidesPerView={1}
                  navigation pagination={{ clickable: true }} autoplay={{ delay: 4000, disableOnInteraction: false }} className="media-swiper pb-12">
                  {videos.map((video, index) => (
                    <SwiperSlide key={video.key}><VideoCard video={video} index={index} isInView={isInView} /></SwiperSlide>
                  ))}
                </Swiper>
              </div>
            ) : (
              <div className="hidden md:grid md:grid-cols-2 gap-8">
                {videos.map((video, index) => <VideoCard key={video.key} video={video} index={index} isInView={isInView} />)}
              </div>
            )}
          </motion.div>
        )}

        {/* Articles */}
        {(loading || articles.length > 0) && (
          <motion.div initial={{ opacity: 0, y: 40 }} animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }} transition={{ duration: 0.7, delay: 0.5 }}>
            <div className="flex items-center gap-4 mb-10">
              <div className="flex items-center gap-3 px-5 py-2 rounded-full bg-white shadow-lg border border-gray-100">
                <FileText className="w-6 h-6 text-pink-600" />
                <h3 className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">{t('featured')}</h3>
              </div>
              <div className="flex-1 h-px bg-gradient-to-r from-pink-200 via-purple-200 to-transparent" />
            </div>
            {loading ? (
              <div className="grid md:grid-cols-4 gap-6">
                {[0, 1, 2, 3].map((i) => <div key={i} className="h-64 rounded-2xl bg-gray-200 animate-pulse" />)}
              </div>
            ) : isMobile ? (
              <div className="md:hidden">
                <Swiper modules={[Navigation, Pagination, Autoplay]} spaceBetween={20} slidesPerView={1.2}
                  navigation pagination={{ clickable: true }} autoplay={{ delay: 3500, disableOnInteraction: false }}
                  className="media-swiper pb-12" breakpoints={{ 480: { slidesPerView: 1.5 }, 640: { slidesPerView: 2 } }}>
                  {articles.map((article, index) => (
                    <SwiperSlide key={article.key}><ArticleCard article={article} index={index} isInView={isInView} /></SwiperSlide>
                  ))}
                </Swiper>
              </div>
            ) : (
              <div className="hidden md:grid md:grid-cols-4 gap-6">
                {articles.map((article, index) => <ArticleCard key={article.key} article={article} index={index} isInView={isInView} />)}
              </div>
            )}
          </motion.div>
        )}
      </div>
    </section>
  );
}
