'use client';

import { useTranslation } from '@/hooks/useTranslation';
import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import imgSprite from '../assets/images/icons/sprite-icons.png';

interface PanchangSlideProps {
  sunrise: string | undefined;
  sunset: string | undefined;
  moonrise: string | undefined;
  moonset: string | undefined;
  ayana?: string | undefined;
  ritu?: string | undefined;
}

const SliderContainer = styled.div`
  position: relative;
  overflow: hidden;
  width: 100%;
`;

const SliderTrack = styled.div<{ slideWidth: number; currentIndex: number }>`
  display: flex;
  transition: transform 0.5s ease-in-out;
  transform: translateX(-${props => props.currentIndex * props.slideWidth}%);
`;

const SlideItem = styled.div<{ itemsToShow: number }>`
  flex: 0 0 ${props => 100 / props.itemsToShow}%;
  padding: 0 2px;
`;

const NavButton = styled.div<{ position: 'left' | 'right' }>`
  opacity: 1;
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  height: 62px;
  width: 32px;
  border-radius: 2px;
  background-color: rgba(0, 0, 0, 0.25);
  background-position: 50% 50%;
  background-repeat: no-repeat;
  z-index: 1;
  transition: all 1s linear;
  cursor: pointer;
  text-align: center;
  ${props => (props.position === 'left' ? 'left: 0;' : 'right: 0;')}

  &:hover {
    background-color: rgba(0, 0, 0, 0.6);
  }

  .icon {
    color: #fff;
    font-size: 24px;
    top: 50%;
    position: relative;
    transform: translateY(-50%);
  }
`;

const PanchangSlide_V2: React.FC<PanchangSlideProps> = ({
  sunrise,
  sunset,
  moonrise,
  moonset,
  ayana,
  ritu,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsToShow, setItemsToShow] = useState(4);
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 1200
  );
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const { t } = useTranslation();

  // Helper function to format time strings with date indicators
  // Converts "Dec 2 3:21 AM" to "3:21 AM (+1)" only if it's the next day
  const formatTimeWithDayIndicator = (timeStr: string | undefined): string => {
    if (!timeStr) return '';

    // Check if the string contains a date (format: "MMM D h:mm A")
    // Example: "Dec 2 3:21 AM"
    const dateTimePattern = /^([A-Za-z]{3})\s+(\d{1,2})\s+(\d{1,2}:\d{2}\s+[AP]M)$/;
    const match = timeStr.match(dateTimePattern);

    if (match) {
      const monthStr = match[1]; // "Dec"
      const dayStr = match[2]; // "2"
      const timePart = match[3]; // "3:21 AM"

      // Parse the date from the string
      const currentYear = new Date().getFullYear();
      const dateInString = new Date(`${monthStr} ${dayStr}, ${currentYear}`);

      // Get today's date (without time)
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Get tomorrow's date
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      // Check if the date in the string is tomorrow
      const stringDate = new Date(dateInString);
      stringDate.setHours(0, 0, 0, 0);

      if (stringDate.getTime() === tomorrow.getTime()) {
        // It's the next day, show (+1)
        return `${timePart} (+1)`;
      } else {
        // It's not the next day, return the original string
        return timeStr;
      }
    }

    // If no date in the string, return as-is
    return timeStr;
  };

  // Calculate items to show based on window width
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setWindowWidth(width);

      if (width >= 1200) {
        setItemsToShow(4);
      } else if (width >= 768) {
        setItemsToShow(3);
      } else {
        setItemsToShow(2);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Prepare all slide items
  const slideItems = [
    {
      icon: 'icon-sprite-sunrise',
      label: t.panchangam.sunrise,
      value: formatTimeWithDayIndicator(sunrise),
    },
    {
      icon: 'icon-sprite-sunset',
      label: t.panchangam.sunset,
      value: formatTimeWithDayIndicator(sunset),
    },
    {
      icon: 'icon-sprite-moonrise',
      label: t.panchangam.moonrise,
      value: formatTimeWithDayIndicator(moonrise),
    },
    {
      icon: 'icon-sprite-moonset',
      label: t.panchangam.moonset,
      value: formatTimeWithDayIndicator(moonset),
    },
  ];

  // Add ayana and ritu if they exist
  if (ayana) {
    slideItems.push({
      icon: 'icon-sprite-ayana dakshina',
      label: t.panchangam.ayana,
      value: ayana,
    });
  }

  if (ritu) {
    slideItems.push({
      icon: 'icon-sprite-ritu',
      label: t.panchangam.ruthu,
      value: ritu,
    });
  }

  const totalItems = slideItems.length;
  const maxIndex = Math.max(0, totalItems - itemsToShow);

  const handlePrev = () => {
    setCurrentIndex(prev => {
      if (prev === 0) {
        return maxIndex; // Jump to the last slide
      }
      return prev - 1;
    });
  };

  const handleNext = () => {
    setCurrentIndex(prev => {
      if (prev === maxIndex) {
        return 0; // Jump to the first slide
      }
      return prev + 1;
    });
  };

  // Auto-play functionality
  useEffect(() => {
    if (!isPaused && totalItems > itemsToShow) {
      intervalRef.current = setInterval(() => {
        handleNext();
      }, 3000); // Change slide every 3 seconds
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPaused, currentIndex, totalItems, itemsToShow]);

  // Reset current index when itemsToShow changes
  useEffect(() => {
    if (currentIndex > maxIndex) {
      setCurrentIndex(maxIndex);
    }
  }, [currentIndex, maxIndex, itemsToShow]);

  return (
    <>
      <SliderContainer
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <div className="slider-items mx-3 pt-1">
          <SliderTrack slideWidth={100 / itemsToShow} currentIndex={currentIndex}>
            {slideItems.map((item, index) => (
              <SlideItem key={index} itemsToShow={itemsToShow}>
                <div className="list-item-outer py-2">
                  <div className="d-flex w-100 align-items-center">
                    <span className={`icon-sprite ${item.icon}`}></span>
                    <div className="flex-grow-1 ps-3 text-white">
                      <span className="d-block t-sm gr-text-11">{item.label}</span>
                      <span className="d-block b" style={{ fontSize: '0.85rem' }}>
                        {item.value}
                      </span>
                    </div>
                  </div>
                </div>
              </SlideItem>
            ))}
          </SliderTrack>
        </div>

        {totalItems > itemsToShow && (
          <>
            <NavButton position="left" onClick={handlePrev}>
              <i className="icon fa fa-angle-left"></i>
            </NavButton>
            <NavButton position="right" onClick={handleNext}>
              <i className="icon fa fa-angle-right"></i>
            </NavButton>
          </>
        )}
      </SliderContainer>

      <style jsx>{`
        .icon-sprite {
          background-image: url(${imgSprite.src});
          background-repeat: no-repeat;
          width: 48px;
          min-width: 40px;
          height: 40px;
          display: inline-block;
        }
      `}</style>
    </>
  );
};

export default PanchangSlide_V2;
