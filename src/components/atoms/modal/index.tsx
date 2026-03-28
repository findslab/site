import {ReactNode, useEffect, useLayoutEffect, useRef, MouseEvent, memo, WheelEvent, useCallback} from "react";
import {useStoreModal, useStoreModalValue} from "@/store/modal";
import {X} from "lucide-react";

const Modal = ({title, children}: { title?: string, children?: ReactNode }) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const mouseDownTargetRef = useRef<EventTarget | null>(null);
  const scrollYRef = useRef<number>(0);
  const {modals} = useStoreModalValue();
  const {closeModal} = useStoreModal();

  useEffect(() => {
    window.addEventListener('popstate', closeModal);

    return () => {
      window.removeEventListener('popstate', closeModal);
    };
  }, []);

  // Use useLayoutEffect to capture scroll position before browser paint
  useLayoutEffect(() => {
    const body = document.body;
    const html = document.documentElement;
    
    if (modals.length > 0) {
      // Save current scroll position before locking (only if not already locked)
      if (body.style.position !== 'fixed') {
        scrollYRef.current = window.scrollY;
      }
      
      // Compensate for scrollbar width to prevent layout shift
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      body.style.paddingRight = `${scrollbarWidth}px`;
      
      // Apply scroll lock
      body.style.overflow = 'hidden';
      body.style.position = 'fixed';
      body.style.top = `-${scrollYRef.current}px`;
      body.style.left = '0';
      body.style.right = '0';
      body.style.width = '100%';
      html.style.overflow = 'hidden';
    } else {
      // Get saved scroll position before clearing styles
      const savedScrollY = scrollYRef.current;
      
      // Remove scroll lock
      body.style.overflow = '';
      body.style.position = '';
      body.style.top = '';
      body.style.left = '';
      body.style.right = '';
      body.style.width = '';
      body.style.paddingRight = '';
      html.style.overflow = '';
      
      // Restore scroll position
      window.scrollTo({
        top: savedScrollY,
        left: 0,
        behavior: 'instant'
      });
    }
  }, [modals.length]);

  const onMouseDown = (e: MouseEvent<HTMLDivElement>) => {
    mouseDownTargetRef.current = e.target;
  };

  const onModalClose = (e: MouseEvent<HTMLDivElement>) => {
    // mousedown과 mouseup이 모두 backdrop에서 발생했을 때만 모달 닫기
    if (modalRef.current === e.target && mouseDownTargetRef.current === e.target) closeModal();
    mouseDownTargetRef.current = null;
  };

  // Prevent wheel events from propagating to background
  const onWheel = (e: WheelEvent<HTMLDivElement>) => {
    e.stopPropagation();
  };
  
  // Prevent touch scroll on backdrop
  const handleTouchMove = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    // Only prevent if touching the backdrop directly
    if (e.target === e.currentTarget) {
      e.preventDefault();
    }
  }, []);

  if (modals.length === 0) return (<></>);

  return (
    <>
      {
        modals.map((modal, index) => {
          const isTopModal = index === modals.length - 1;
          const zIndex = 50 + index;

          return (
            <div
              key={index}
              className="fixed w-full h-full top-0 left-0 flex items-center justify-center bg-black/30 px-40 max-md:px-16 animate-fadeIn overscroll-contain"
              style={{zIndex: 10000 + index, touchAction: 'none'}}
              onMouseDown={(e) => onMouseDown(e)}
              onClick={(e) => isTopModal ? onModalClose(e) : undefined}
              onWheel={onWheel}
              onTouchMove={handleTouchMove}
              ref={isTopModal ? modalRef : undefined}
            >
              <div
                className="w-full max-h-[85vh] bg-white rounded-xl shadow-[rgb(0_0_0_/_15%)_0_0_6px_0] p-20 flex flex-col items-center justify-between gap-20 relative m-[7.5vh_auto_auto_auto] animate-fadeIn"
                style={{maxWidth: modal.maxWidth || '900px', touchAction: 'auto', overscrollBehavior: 'contain'}}
              >
                {/* X button inside modal for mobile visibility */}
                <button 
                  onClick={closeModal} 
                  className="absolute right-12 top-12 z-10 w-32 h-32 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                  aria-label="Close modal"
                >
                  <X size={18} className="text-gray-600"/>
                </button>

                {
                  (title || modal.title) &&
                  <div className="flex justify-center">
                    <h2 className="text-md font-semibold">
                      {modal.title}
                      {title}
                    </h2>
                  </div>
                }

                <div className="w-full overflow-auto">
                  {modal.children && modal.children}
                  {index === modals.length - 1 && children && children}
                </div>
              </div>
            </div>
          );
        })
      }
    </>
  );
}

export default memo(Modal);
