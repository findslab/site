import { ChevronLeft, ChevronRight } from 'lucide-react'
import { memo, ReactNode, useCallback, useEffect, useState } from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import Autoplay from 'embla-carousel-autoplay'

type SliderProps = {
  children?: ReactNode[];
  loop?: boolean;
  align?: 'start' | 'center' | 'end';
  slidesPerView?: number;
  gap?: number;
  autoplay?: boolean;
  autoplayDelay?: number;
  arrows?: boolean;
  dots?: boolean;
  draggable?: boolean;
  duration?: number;
}

const Slider = ({
  children,
  loop = false,
  align = 'start',
  slidesPerView = 1,
  gap = 0,
  autoplay = false,
  autoplayDelay = 3000,
  arrows = false,
  dots = false,
  draggable = true,
  duration = 25
}: SliderProps) => {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([])

  const plugins = autoplay
    ? [Autoplay({ delay: autoplayDelay, stopOnInteraction: false, stopOnMouseEnter: true })]
    : []

  const [emblaRef, emblaApi] = useEmblaCarousel({
      loop,
      align,
      containScroll: 'keepSnaps',
      dragFree: false,
      watchDrag: draggable,
      duration
    },
    plugins
  )

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi])
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi])
  const scrollTo = useCallback((index: number) => emblaApi?.scrollTo(index), [emblaApi])

  const onSelect = useCallback(() => {
    if (!emblaApi) return
    setSelectedIndex(emblaApi.selectedScrollSnap())
  }, [emblaApi])

  useEffect(() => {
    if (!emblaApi) return

    setScrollSnaps(emblaApi.scrollSnapList())
    onSelect()

    emblaApi.on('select', onSelect)
    emblaApi.on('reInit', onSelect)

    return () => {
      emblaApi.off('select', onSelect)
      emblaApi.off('reInit', onSelect)
    }
  }, [emblaApi, onSelect])

  if (!children || children.length === 0) return null

  const slideWidth = `${100 / slidesPerView}%`

  return (
    <div className="relative w-full">
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex select-none touch-pan-y">
          {children.map((child, index) => (
            <div
              key={index}
              className="shrink-0 min-w-0 [&_img]:pointer-events-none"
              style={{ flexBasis: slideWidth, marginRight: `${gap}px` }}
            >
              {child}
            </div>
          ))}
        </div>
      </div>

      {arrows && (
        <>
          <button
            type="button"
            className="absolute -left-20 max-lg:left-48 top-1/2 -translate-y-1/2 z-10 size-36 rounded-full bg-white border border-[#F0F0F0] flex items-center justify-center cursor-pointer transition-colors hover:bg-[#f5f5f5] max-md:hidden"
            onClick={scrollPrev}
            aria-label="이전"
          >
            <ChevronLeft size={24} strokeWidth={1}/>
          </button>
          <button
            type="button"
            className="absolute -right-20 max-lg:right-48 top-1/2 -translate-y-1/2 z-10 size-36 rounded-full bg-white border border-[#F0F0F0] flex items-center justify-center cursor-pointer transition-colors hover:bg-[#f5f5f5] max-md:hidden"
            onClick={scrollNext}
            aria-label="다음"
          >
            <ChevronRight size={24} strokeWidth={1}/>
          </button>
        </>
      )}

      {dots && scrollSnaps.length > 1 && (
        <div className="flex items-center justify-center gap-4 mt-24">
          {scrollSnaps.map((_, index) => (
            <button
              key={index}
              type="button"
              className={`rounded-full border-none p-0 cursor-pointer transition-all ${
                index === selectedIndex
                  ? 'w-55 h-6 bg-primary'
                  : 'w-6 h-6 bg-gray-300 hover:bg-gray-400'
              }`}
              onClick={() => scrollTo(index)}
              aria-label={`${index + 1}번 슬라이드`}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default memo(Slider)
