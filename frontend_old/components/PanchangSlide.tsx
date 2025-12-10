'use client';

import { useTranslation } from '@/hooks/useTranslation';
import React, { useRef } from 'react';
import Slider from 'react-slick';
import styled from 'styled-components';
import imgSprite from '../assets/images/icons/sprite-icons.png';
import { formatMoonTime, formatTimeWithRounding } from '../utils/timeUtils';

interface PanchangSlideProps {
  sunrise: string | undefined;
  sunset: string | undefined;
  moonrise: string | undefined;
  moonset: string | undefined;
  ayana?: string | undefined;
  ritu?: string | undefined;
}

const SliderStyled = styled(Slider)`
  .slick-slide div {
    &:focus {
      outline: none !important;
    }
  }
`;

const PanchangSlide: React.FC<PanchangSlideProps> = ({
  sunrise,
  sunset,
  moonrise,
  moonset,
  ayana,
  ritu,
}) => {
  const elSlider = useRef<Slider>(null);

  const { t } = useTranslation();

  // Format the display values with proper time formatting and next day indicators
  const formatSunriseTime = (timeStr: string | undefined): string => {
    if (!timeStr) return '';
    return formatTimeWithRounding(timeStr);
  };

  const formatSunsetTime = (timeStr: string | undefined): string => {
    if (!timeStr) return '';
    return formatTimeWithRounding(timeStr);
  };

  const formatMoonriseTime = (timeStr: string | undefined): string => {
    if (!timeStr) return '';
    // If it's from API (contains date), extract just the time
    if (timeStr.includes(' ')) {
      const match = timeStr.match(/(\d{1,2}:\d{2} [AP]M)/);
      return match ? match[1] : timeStr;
    }
    return formatTimeWithRounding(timeStr);
  };

  const formatMoonsetTime = (timeStr: string | undefined): string => {
    if (!timeStr) return '';
    // If it's from API (contains date), check for next day and extract time
    if (timeStr.includes(' ')) {
      const currentDate = new Date().toISOString().split('T')[0]; // Get current date
      const { time, nextDay } = formatMoonTime(timeStr, currentDate);
      return nextDay ? `${time} (+1)` : time;
    }
    return formatTimeWithRounding(timeStr);
  };

  const slickSettings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToScroll: 1,
    arrows: false,
    className: 'single-slide',
    responsive: [
      {
        breakpoint: 2400,
        settings: {
          slidesToShow: 4,
        },
      },
      {
        breakpoint: 1200,
        settings: {
          slidesToShow: 4,
        },
      },
      {
        breakpoint: 992,
        settings: {
          slidesToShow: 4,
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 3,
        },
      },
    ],
  };

  return (
    <>
      <SliderStyled ref={elSlider} {...slickSettings}>
        <div className="list-item-outer py-2">
          <div className="d-flex w-100 align-items-center">
            <span className="icon-sprite icon-sprite-sunrise"></span>
            <div className="flex-grow-1 ps-3">
              <span className="d-block t-sm gr-text-11">{t.panchangam.sunrise}</span>
              <span className="d-block b">{formatSunriseTime(sunrise)}</span>
            </div>
          </div>
        </div>
        <div className="list-item-outer py-2">
          <div className="d-flex w-100 align-items-center">
            <span className="icon-sprite icon-sprite-sunset"></span>
            <div className="flex-grow-1 ps-3">
              <span className="d-block t-sm gr-text-11">{t.panchangam.sunset}</span>
              <span className="d-block b">{formatSunsetTime(sunset)}</span>
            </div>
          </div>
        </div>
        <div className="list-item-outer py-2">
          <div className="d-flex w-100 align-items-center">
            <span className="icon-sprite icon-sprite-moonrise"></span>
            <div className="flex-grow-1 ps-3">
              <span className="d-block t-sm gr-text-11">{t.panchangam.moonrise}</span>
              <span className="d-block b">{formatMoonriseTime(moonrise)}</span>
            </div>
          </div>
        </div>
        <div className="list-item-outer py-2">
          <div className="d-flex w-100 align-items-center">
            <span className="icon-sprite icon-sprite-moonset"></span>
            <div className="flex-grow-1 ps-3">
              <span className="d-block t-sm gr-text-11">{t.panchangam.moonset}</span>
              <span className="d-block b">{formatMoonsetTime(moonset)}</span>
            </div>
          </div>
        </div>
        {ayana && (
          <div className="list-item-outer py-2">
            <div className="d-flex w-100 align-items-center">
              <span className="icon-sprite icon-sprite-ayana dakshina"></span>
              <div className="flex-grow-1 ps-3">
                <span className="d-block t-sm gr-text-11">{t.panchangam.ayana}</span>
                <span className="d-block b">{ayana}</span>
              </div>
            </div>
          </div>
        )}
        {ritu && (
          <div className="list-item-outer py-2">
            <div className="d-flex w-100 align-items-center">
              <span className="icon-sprite icon-sprite-ritu"></span>
              <div className="flex-grow-1 ps-3">
                <span className="d-block t-sm gr-text-11">Drik Ritu</span>
                <span className="d-block b">{ritu}</span>
              </div>
            </div>
          </div>
        )}
      </SliderStyled>

      <div
        className="list-style-nav-btn list-style-nav-btn-prev"
        onClick={() => elSlider.current?.slickPrev()}
      >
        <i className="icon fa fa-angle-left text-white"></i>
      </div>
      <div
        className="list-style-nav-btn list-style-nav-btn-next"
        onClick={() => elSlider.current?.slickNext()}
      >
        <i className="icon fa fa-angle-right text-white"></i>
      </div>

      <style jsx>{`
        .icon-sprite {
          background-image: url(${imgSprite.src});
          background-repeat: no-repeat;
          width: 56px;
          height: 40px;
          display: inline-block;
        }
      `}</style>
    </>
  );
};

export default PanchangSlide;
