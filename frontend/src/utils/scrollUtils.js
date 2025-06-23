// src/utils/scrollUtils.js
export const scrollUtils = {
  handleScroll: (direction, scrollRef, scrollAmount = 320) => {
    if (scrollRef.current) {
      const currentScroll = scrollRef.current.scrollLeft;
      const targetScroll = direction === 'left' 
        ? currentScroll - scrollAmount 
        : currentScroll + scrollAmount;
      
      scrollRef.current.scrollTo({
        left: targetScroll,
        behavior: 'smooth'
      });
    }
  },

  // Helper untuk smooth scroll ke element tertentu
  scrollToElement: (elementRef, offset = 0) => {
    if (elementRef.current) {
      elementRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
        inline: 'nearest'
      });
    }
  },

  // Helper untuk check apakah bisa scroll ke kiri/kanan
  canScrollLeft: (scrollRef) => {
    return scrollRef.current && scrollRef.current.scrollLeft > 0;
  },

  canScrollRight: (scrollRef) => {
    if (!scrollRef.current) return false;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    return scrollLeft < scrollWidth - clientWidth - 1;
  }
};