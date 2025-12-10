'use client';

import { useLanguageConfig } from '@/hooks/useLanguageConfig';
import { device } from '@/utils/breakpoints';
import { useScrollPosition } from '@n8tb1t/use-scroll-position';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Container, Nav, Offcanvas } from 'react-bootstrap';
import styled from 'styled-components';
import MyAccount from './MyAccount';
import { menuItems } from './navItems';
import TopBar from './TopBar';

type NavItem = {
  name: string;
  href: string;
  te_name?: string;
  isExternal?: boolean;
  items?: NavItem[];
  showOnly?: string[];
};

const SiteHeader = styled.header`
  padding: 10px 0 10px 0;
  position: absolute !important;
  top: 0;
  right: 0;
  width: 100%;
  z-index: 999;
  background: #fe7102;
  box-shadow: 0 12px 34px -11px rgb(65 62 101 / 10%);
  @media ${device.lg} {
    position: fixed !important;
    transition: 0.6s;
    &.scrolling {
      transform: translateY(-100%);
      transition: 0.6s;
    }
    &.reveal-header {
      transform: translateY(0%);
      box-shadow: 0 12px 34px -11px rgba(65, 62, 101, 0.1);
      z-index: 9999;
      background: rgb(252, 253, 254);
    }
  }
`;

// Smart scroll dropdown menu component
const SmartScrollDropdownMenu = styled.ul<{ $needsScroll?: boolean }>`
  ${props =>
    props.$needsScroll &&
    `
    max-height: 300px;
    overflow-y: auto;
    scrollbar-width: thin;
    scrollbar-color: #fe7102 #f8f9fa;
    
    &::-webkit-scrollbar {
      width: 6px;
    }
    
    &::-webkit-scrollbar-track {
      background: #f8f9fa;
      border-radius: 3px;
    }
    
    &::-webkit-scrollbar-thumb {
      background: #fe7102;
      border-radius: 3px;
    }
    
    &::-webkit-scrollbar-thumb:hover {
      background: #e56102;
    }
  `}
`;

// Styled components for mobile navigation
const ToggleButton = styled.button`
  background: transparent;
  border: none;
  color: white;
  font-size: 24px;
  padding: 8px;
  margin-left: auto;
  display: none;

  @media (max-width: 991px) {
    display: block;
  }

  &:focus {
    outline: none;
    box-shadow: none;
  }
`;

const OffcanvasDrawer = styled(Offcanvas)`
  .offcanvas-body {
    padding: 0;
  }

  .nav-link {
    color: #333;
    padding: 12px 20px;
    border-bottom: 1px solid #eee;

    &:hover {
      background: #f8f9fa;
      color: #fe7102;
    }
  }

  .dropdown-menu {
    border: none;
    box-shadow: none;
    background: #f8f9fa;

    .dropdown-item {
      padding: 10px 30px;
      color: #555;

      &:hover {
        background: #e9ecef;
        color: #fe7102;
      }
    }
  }
`;

// Sub-dropdown component
const SubDropdown = ({ subItem, locale }: { subItem: NavItem; locale: string }) => {
  const hasSubSubItems = Array.isArray(subItem.items);
  const [isSubSubOpen, setIsSubSubOpen] = useState(false);

  // Calculate visible sub-sub-items count for smart scroll
  const visibleSubSubItems =
    hasSubSubItems && subItem.items
      ? subItem.items.filter(
          subSubItem => !(subSubItem.showOnly && !subSubItem.showOnly.includes(locale))
        ).length
      : 0;

  const needsSubScroll = visibleSubSubItems > 8;

  const handleSubSubClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsSubSubOpen(!isSubSubOpen);
  };

  return (
    <li className={`dropdown-item ${hasSubSubItems ? 'dropdown-submenu' : ''}`} key={subItem.name}>
      {hasSubSubItems ? (
        <>
          <a
            className="dropdown-link dropdown-toggle"
            href="#"
            role="button"
            aria-expanded={isSubSubOpen}
            onClick={handleSubSubClick}
          >
            {locale === 'te' && subItem.te_name ? subItem.te_name : subItem.name}
            <i className="fa-solid fa-angle-right"></i>
          </a>
          <SmartScrollDropdownMenu
            className={`dropdown-menu ${isSubSubOpen ? 'show' : ''}`}
            $needsScroll={needsSubScroll}
          >
            {Array.isArray(subItem.items) &&
              subItem.items.map((subSubItem: NavItem, subSubIndex: number) => {
                // Filter out sub-sub-items that should only show for specific languages
                if (subSubItem.showOnly && !subSubItem.showOnly.includes(locale)) {
                  return null;
                }

                return (
                  <li className="dropdown-item" key={subSubItem.name + subSubIndex}>
                    {subSubItem.isExternal ? (
                      <a
                        href={subSubItem.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="dropdown-link"
                      >
                        {locale === 'te' && subSubItem.te_name
                          ? subSubItem.te_name
                          : subSubItem.name}
                      </a>
                    ) : (
                      <Link href={subSubItem.href} className="dropdown-link">
                        {locale === 'te' && subSubItem.te_name
                          ? subSubItem.te_name
                          : subSubItem.name}
                      </Link>
                    )}
                  </li>
                );
              })}
          </SmartScrollDropdownMenu>
        </>
      ) : subItem.isExternal ? (
        <a href={subItem.href} target="_blank" rel="noopener noreferrer" className="dropdown-link">
          {locale === 'te' && subItem.te_name ? subItem.te_name : subItem.name}
        </a>
      ) : (
        <Link href={subItem.href} className="dropdown-link">
          {locale === 'te' && subItem.te_name ? subItem.te_name : subItem.name}
        </Link>
      )}
    </li>
  );
};

// Main dropdown component
const MainDropdown = ({ item, locale }: { item: NavItem; locale: string }) => {
  const hasSubItems = Array.isArray(item.items);
  const [isOpen, setIsOpen] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsOpen(!isOpen);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.nav-item.dropdown')) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('click', handleClickOutside);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <li className="nav-item dropdown" key={item.name}>
      <a
        className="nav-link dropdown-toggle gr-toggle-arrow"
        href="#"
        role="button"
        aria-expanded={isOpen}
        onClick={handleClick}
      >
        {locale === 'te' && item.te_name ? item.te_name : item.name}
        <i className="fa-solid fa-angle-down"></i>
      </a>
      <ul className={`gr-menu-dropdown dropdown-menu ${isOpen ? 'show' : ''}`}>
        {Array.isArray(item.items) &&
          item.items.map((subItem: NavItem, subIndex: number) => {
            // Filter out sub-items that should only show for specific languages
            if (subItem.showOnly && !subItem.showOnly.includes(locale)) {
              return null;
            }

            return <SubDropdown key={subItem.name + subIndex} subItem={subItem} locale={locale} />;
          })}
      </ul>
    </li>
  );
};

// Mobile dropdown item component
const MobileDropdownItem = ({
  item,
  locale,
  onCloseMobileMenu,
}: {
  item: NavItem;
  locale: string;
  onCloseMobileMenu: () => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [openSubSubs, setOpenSubSubs] = useState<{ [key: string]: boolean }>({});

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  const handleSubSubToggle = (e: React.MouseEvent, subItemName: string) => {
    e.preventDefault();
    e.stopPropagation();
    setOpenSubSubs(prev => ({
      ...prev,
      [subItemName]: !prev[subItemName],
    }));
  };

  const handleItemClick = (e: React.MouseEvent, href: string, isExternal?: boolean) => {
    e.preventDefault();
    e.stopPropagation();
    onCloseMobileMenu();

    if (isExternal) {
      window.open(href, '_blank', 'noopener,noreferrer');
    } else {
      window.location.href = href;
    }
  };

  return (
    <div key={item.name} className="mobile-dropdown-item">
      <Nav.Link href="#" onClick={handleToggle} className="dropdown-toggle" aria-expanded={isOpen}>
        {locale === 'te' && item.te_name ? item.te_name : item.name}
        <i className={`fa-solid fa-angle-${isOpen ? 'up' : 'down'}`}></i>
      </Nav.Link>
      <div className={`mobile-submenu ${isOpen ? 'show' : ''}`}>
        {Array.isArray(item.items) &&
          item.items.map((subItem: NavItem, subIndex: number) => {
            // Filter out sub-items that should only show for specific languages
            if (subItem.showOnly && !subItem.showOnly.includes(locale)) {
              return null;
            }

            const hasSubSubItems = Array.isArray(subItem.items) && subItem.items.length > 0;
            const isSubSubOpen = openSubSubs[subItem.name];

            if (hasSubSubItems) {
              return (
                <div key={subItem.name + subIndex} className="dropdown-submenu-mobile">
                  <Nav.Link
                    href="#"
                    onClick={e => handleSubSubToggle(e, subItem.name)}
                    className="dropdown-item dropdown-toggle"
                    aria-expanded={isSubSubOpen}
                  >
                    {locale === 'te' && subItem.te_name ? subItem.te_name : subItem.name}
                    <i className={`fa-solid fa-angle-${isSubSubOpen ? 'down' : 'right'}`}></i>
                  </Nav.Link>
                  <div className={`mobile-subsubmenu ${isSubSubOpen ? 'show' : ''}`}>
                    {subItem.items?.map((subSubItem: NavItem, subSubIndex: number) => {
                      if (subSubItem.showOnly && !subSubItem.showOnly.includes(locale)) {
                        return null;
                      }

                      return (
                        <Nav.Link
                          key={subSubItem.name + subSubIndex}
                          href={subSubItem.href}
                          onClick={e => handleItemClick(e, subSubItem.href, subSubItem.isExternal)}
                          className="dropdown-item"
                        >
                          {locale === 'te' && subSubItem.te_name
                            ? subSubItem.te_name
                            : subSubItem.name}
                        </Nav.Link>
                      );
                    })}
                  </div>
                </div>
              );
            }

            return (
              <Nav.Link
                key={subItem.name + subIndex}
                href={subItem.href}
                onClick={e => handleItemClick(e, subItem.href, subItem.isExternal)}
                className="dropdown-item"
              >
                {locale === 'te' && subItem.te_name ? subItem.te_name : subItem.name}
              </Nav.Link>
            );
          })}
      </div>
    </div>
  );
};

export default function Header() {
  const pathname = usePathname();
  const { locale } = useLanguageConfig();
  const [display, setDisplay] = useState(false);
  const [showScrolling, setShowScrolling] = useState(false);
  const [showReveal, setShowReveal] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  // Memoize class names to prevent unnecessary re-renders
  const classNames = useMemo(
    () => ({
      hideSearch: !display ? 'hide-div' : '',
      hideNav: display ? 'hide-div' : '',
    }),
    [display]
  );

  // Function to hide search bar after successful search
  const handleSearchSubmit = useCallback(() => {
    setDisplay(false);
  }, []);

  // Memoize scroll position handler
  useScrollPosition(({ prevPos, currPos }) => {
    if (currPos.y < 0) {
      setShowScrolling(true);
    } else {
      setShowScrolling(false);
    }
    if (currPos.y < -300) {
      setShowReveal(true);
    } else {
      setShowReveal(false);
    }
  });

  // Memoize menu items to prevent unnecessary re-renders
  const filteredMenuItems = useMemo(() => {
    return menuItems
      .map((item: NavItem) => {
        // Filter out items that should only show for specific languages
        if (item.showOnly && !item.showOnly.includes(locale)) {
          return null;
        }
        return item;
      })
      .filter(Boolean);
  }, [locale]);

  return (
    <SiteHeader
      className={`site-header site-header--absolute sticky-header site-header--menu-center py-0 ${showScrolling ? 'scrolling' : ''} ${showReveal ? 'reveal-header' : ''} `}
    >
      {!showReveal ? (
        <Container>
          <TopBar />
        </Container>
      ) : (
        ''
      )}
      <div className="navbar site-navbar navbar-expand-lg py-sm-6 py-lg-2 px-0">
        {/* Logo */}
        <Container>
          <div className="brand-logo">
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/logo.png"
                width="170"
                height="61"
                alt="SS Bhakthi"
                priority
                quality={90}
              />
            </Link>
          </div>

          {/* Mobile Toggle Button */}
          <ToggleButton
            className="navbar-toggler d-lg-none"
            type="button"
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            aria-controls="mobile-menu"
            aria-expanded={showMobileMenu}
            aria-label="Toggle navigation"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
            >
              <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
              <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g>
              <g id="SVGRepo_iconCarrier">
                <path d="M4 18L20 18" stroke="#fe7102" strokeWidth="2" strokeLinecap="round"></path>
                <path d="M4 12L20 12" stroke="#fe7102" strokeWidth="2" strokeLinecap="round"></path>
                <path d="M4 6L20 6" stroke="#fe7102" strokeWidth="2" strokeLinecap="round"></path>
              </g>
            </svg>
          </ToggleButton>

          {/* Desktop Menu */}
          <div className="navbar-collapse collapse">
            <div className="navbar-nav-wrapper">
              <ul
                className={`navbar-nav main-menu d-none d-lg-flex fa-pull-left ${classNames.hideNav}`}
              >
                {filteredMenuItems.map((item: NavItem | null, index: number) => {
                  if (!item) return null;

                  const hasSubItems = Array.isArray(item.items);

                  if (hasSubItems) {
                    return <MainDropdown key={item.name + index} item={item} locale={locale} />;
                  }

                  return (
                    <li className="nav-item" key={item.name + index}>
                      {item.isExternal ? (
                        <a
                          className="nav-link"
                          href={item.href}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {locale === 'te' && item.te_name ? item.te_name : item.name}
                        </a>
                      ) : (
                        <Link href={item.href} className="nav-link">
                          {locale === 'te' && item.te_name ? item.te_name : item.name}
                        </Link>
                      )}
                    </li>
                  );
                })}
              </ul>
              {/* Search Bar */}
              {/* <div className={`header-search fa-pull-left me-md-6 mx-2 my-2 ${classNames.hideSearch}`}>
                <SearchBarHeader mobile={false} onSearchSubmit={handleSearchSubmit} />
              </div> */}

              {/* Search Button */}
              <div className="search-btn fa-pull-right fa-border-left-primary my-4 mr-20 pb-1 ps-6 pt-1 text-white">
                <Link href={`/search`}>
                  <i className="gr-text-8 text-primary fa fa-search show-curser"></i>
                </Link>
              </div>
            </div>{' '}
          </div>
        </Container>
      </div>

      {/* Mobile Offcanvas Menu */}
      <OffcanvasDrawer
        show={showMobileMenu}
        onHide={() => setShowMobileMenu(false)}
        placement="end"
        id="mobile-menu"
      >
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>
            <Link
              href="/"
              className="flex items-center gap-2"
              onClick={() => setShowMobileMenu(false)}
            >
              <Image
                src="/logo.png"
                width="140"
                height="50"
                alt="SS Bhakthi"
                quality={90}
                loading="eager"
              />
            </Link>
          </Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <Nav className="flex-column">
            {filteredMenuItems.map((item: NavItem | null, index: number) => {
              if (!item) return null;

              const hasSubItems = Array.isArray(item.items);

              if (hasSubItems) {
                return (
                  <MobileDropdownItem
                    key={item.name + index}
                    item={item}
                    locale={locale}
                    onCloseMobileMenu={() => setShowMobileMenu(false)}
                  />
                );
              }

              return (
                <Nav.Link
                  key={item.name + index}
                  href={item.href}
                  onClick={() => setShowMobileMenu(false)}
                  target={item.isExternal ? '_blank' : undefined}
                  rel={item.isExternal ? 'noopener noreferrer' : undefined}
                >
                  {locale === 'te' && item.te_name ? item.te_name : item.name}
                </Nav.Link>
              );
            })}

            {/* Mobile Search Button */}
            <Nav.Link href="/search" onClick={() => setShowMobileMenu(false)}>
              <i className="fa fa-search me-2"></i>
              Search
            </Nav.Link>

            {/* Mobile Account Section */}
            <div className="border-top mt-3 pt-3">
              <MyAccount />
            </div>
          </Nav>
        </Offcanvas.Body>
      </OffcanvasDrawer>
    </SiteHeader>
  );
}
