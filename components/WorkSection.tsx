'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { ExternalLink, Play, X } from 'lucide-react';
import Image from 'next/image';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

interface WorkData {
  key: string;
  title: string;
  description: string;
  icon: string;
  imageName: string;
  imageUrl: string;
  color: string;
  link: string;
  videoUrl: string;
}

function WorkCard({ work, index, isInView, onVideoClick }: { work: WorkData; index: number; isInView: boolean; onVideoClick: (w: WorkData) => void }) {
  const [imageError, setImageError] = useState(false);
  const initialSrc = work.imageUrl || `/images/projects/${work.imageName}.png`;
  const [imgSrc, setImgSrc] = useState(initialSrc);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const src = work.imageUrl || `/images/projects/${work.imageName}.png?t=${Date.now()}`;
    setImgSrc(src);
    setIsLoading(true);
    setImageError(false);
  }, [work.imageUrl, work.imageName]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, rotateX: -10 }}
      animate={isInView ? { opacity: 1, y: 0, rotateX: 0 } : { opacity: 0, y: 50, rotateX: -10 }}
      transition={{ duration: 0.6, delay: index * 0.15, ease: [0.23, 1, 0.32, 1] }}
      whileHover={{ scale: 1.05, y: -10, rotateY: 5, rotateX: 5, transition: { duration: 0.4 } }}
      className="group relative rounded-3xl bg-white shadow-lg overflow-hidden cursor-pointer w-full h-full border border-gray-100"
      style={{ transformStyle: 'preserve-3d' }}
    >
      <div className="relative h-48 sm:h-52 md:h-56 overflow-hidden bg-gray-100">
        {work.videoUrl && (
          <button
            onClick={(e) => { e.preventDefault(); onVideoClick(work); }}
            className="absolute top-4 right-4 z-20 bg-black/70 hover:bg-black/90 text-white rounded-full p-3 transition-all duration-300 hover:scale-110"
          >
            <Play className="w-5 h-5" />
          </button>
        )}
        {!imageError ? (
          <>
            {isLoading && <div className="absolute inset-0 bg-gray-200 animate-pulse z-10" />}
            <Image
              src={imgSrc} alt={work.title} fill
              className={`object-cover transition-all duration-500 group-hover:scale-110 ${isLoading ? 'scale-110 blur-xl grayscale' : 'scale-100 blur-0 grayscale-0'}`}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              onLoad={() => setIsLoading(false)}
              onError={() => {
                // If we loaded from imageUrl and it failed, fall back to local paths
                if (work.imageUrl && imgSrc === work.imageUrl) {
                  setImgSrc(`/images/projects/${work.imageName}.png?t=${Date.now()}`);
                  setIsLoading(true);
                  return;
                }
                const ts = Date.now();
                if (imgSrc.includes('.png')) { setImgSrc(`/images/projects/${work.imageName}.jpg?t=${ts}`); setIsLoading(true); }
                else if (imgSrc.includes('.jpg')) { setImgSrc(`/images/projects/${work.imageName}.jpeg?t=${ts}`); setIsLoading(true); }
                else if (imgSrc.includes('.jpeg')) { setImgSrc(`/images/projects/${work.imageName}.webp?t=${ts}`); setIsLoading(true); }
                else setImageError(true);
              }}
              unoptimized
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
          </>
        ) : (
          <div className={`w-full h-full flex items-center justify-center bg-gradient-to-br ${work.color || 'from-gray-400 to-slate-400'} relative`}>
            <motion.div className="text-8xl absolute" whileHover={{ scale: 1.2, rotate: [0, -10, 10, -10, 0], transition: { duration: 0.5 } }}>
              {work.icon || '✨'}
            </motion.div>
          </div>
        )}
      </div>

      <div className="relative p-4 sm:p-5 md:p-6 min-h-[140px] sm:min-h-[150px] md:min-h-[160px] flex flex-col justify-between">
        <div className="relative z-10">
          <h3 className="text-xl sm:text-2xl font-bold mb-2 flex items-center gap-2 text-gray-900">
            {work.title}
            <ExternalLink className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:translate-x-1 group-hover:-translate-y-1 text-purple-600" />
          </h3>
          <p className="text-sm sm:text-base text-gray-600 line-clamp-3">{work.description}</p>
        </div>
        <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${work.color || 'from-gray-400 to-slate-400'} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left`} />
      </div>

      {work.link && (
        <a href={work.link} target="_blank" rel="noopener noreferrer"
          className="absolute top-4 left-4 z-20 bg-white text-gray-900 rounded-full p-2 opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 shadow-lg">
          <ExternalLink className="w-4 h-4" />
        </a>
      )}
    </motion.div>
  );
}

export function WorkSection() {
  const t = useTranslations('work');
  const { locale } = useParams<{ locale: string }>();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const [selectedVideo, setSelectedVideo] = useState<WorkData | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [works, setWorks] = useState<WorkData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const currentLocale = locale || 'en';
    fetch(`/api/content/works?locale=${currentLocale}`)
      .then((r) => r.json())
      .then((json) => { setWorks(json.items || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [locale]);

  return (
    <section id="work" className="py-32 bg-white" ref={ref}>
      <div className="max-w-7xl mx-auto px-6">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6 }}
          className="text-5xl md:text-6xl font-bold mb-16 text-center text-gray-900"
        >
          {t('title')}
        </motion.h2>

        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-[400px] rounded-3xl bg-gray-100 animate-pulse" />
            ))}
          </div>
        ) : isMobile ? (
          <div className="md:hidden">
            <Swiper modules={[Navigation, Pagination, Autoplay]} spaceBetween={20} slidesPerView={1}
              navigation pagination={{ clickable: true }} autoplay={{ delay: 3500, disableOnInteraction: false }}
              className="work-swiper pb-12">
              {works.map((work, index) => (
                <SwiperSlide key={work.key} style={{ height: 'auto' }}>
                  <div className="min-h-[400px] sm:min-h-[420px]">
                    <WorkCard work={work} index={index} isInView={isInView} onVideoClick={setSelectedVideo} />
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        ) : (
          <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {works.map((work, index) => (
              <div key={work.key} className="h-full min-h-[440px]">
                <WorkCard work={work} index={index} isInView={isInView} onVideoClick={setSelectedVideo} />
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedVideo && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 p-4 sm:p-6 md:p-8"
          onClick={() => setSelectedVideo(null)}>
          <button onClick={() => setSelectedVideo(null)}
            className="absolute top-4 right-4 bg-white/20 hover:bg-white/30 text-white rounded-full p-3 transition-all hover:scale-110 z-10">
            <X className="w-6 h-6" />
          </button>
          <div className="relative w-full max-w-5xl aspect-video bg-black rounded-xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}>
            <iframe src={selectedVideo.videoUrl} title={selectedVideo.title} className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
          </div>
        </motion.div>
      )}
    </section>
  );
}
