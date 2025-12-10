import { te } from '../../../locales/te';

export const menuItems = [
  {
    href: '/',
    name: 'Home',
    te_name: te.nav.home,
  },
  {
    href: 'deva',
    name: 'Deva',
    te_name: te.deva.deva,
    items: [
      {
        href: '/deva/ganesha',
        name: 'Ganesha',
        te_name: te.deva.ganesha,
      },
      {
        href: '/deva/ayyappa',
        name: 'Ayyappa',
        te_name: te.deva.ayyappa,
      },
      {
        href: '/deva/shiva',
        name: 'Shiva',
        te_name: te.deva.shiva,
      },
      {
        href: '#',
        name: 'Devi',
        te_name: te.deva.devi,
        items: [
          {
            href: '/deva/durga',
            name: 'Durga',
            te_name: te.deva.durga,
          },
          {
            href: '/deva/parvati',
            name: 'Parvati',
            te_name: te.deva.parvati,
          },
          {
            href: '/deva/varahi',
            name: 'Varahi',
            te_name: te.deva.varahi,
          },
          {
            href: '/deva/prathyangira',
            name: 'Prathyangira',
            te_name: te.deva.prathyangira,
          },
          {
            href: '/deva/shyamala',
            name: 'Shyamala',
            te_name: te.deva.shyamala,
          },
          {
            href: '/deva/lakshmi',
            name: 'Lakshmi',
            te_name: te.deva.lakshmi,
          },
          {
            href: '/deva/sarasvati',
            name: 'Sarasvati',
            te_name: te.deva.saraswati,
          },
          {
            href: '/deva/lalita',
            name: 'Lalita',
            te_name: te.deva.lalita,
          },
          {
            href: '/deva/dashamahavidya',
            name: 'Dashamahavidya',
            te_name: te.deva.dashamahavidya,
          },
          {
            href: '/deva/kamakshi',
            name: 'Kamakshi',
            te_name: te.deva.kamakshi,
          },
          {
            href: '/deva/gayatri',
            name: 'Gayatri',
            te_name: te.deva.gayatri,
          },
          {
            href: '/deva/tulasi',
            name: 'Tulasi',
            te_name: te.deva.tulasi,
          },
          {
            href: '/deva/devi-other-forms',
            name: 'Other Devi Forms',
            te_name: te.deva.deviOtherForms,
          },
        ],
      },
      {
        href: '#',
        name: 'Vishnu',
        te_name: te.deva.vishnu,
        items: [
          {
            href: '/deva/krishna',
            name: 'Krishna',
            te_name: te.deva.krishna,
          },
          {
            href: '/deva/raama',
            name: 'Raama',
            te_name: te.deva.rama,
          },
          {
            href: '/deva/venkateshwara',
            name: 'Venkateshwara',
            te_name: te.deva.venkateswara,
          },
          {
            href: '/deva/varaha',
            name: 'Varaha',
            te_name: te.deva.varaha,
          },
          {
            href: '/deva/narashimha',
            name: 'Narashimha',
            te_name: te.deva.narashimha,
          },
          {
            href: '/deva/vishhnu',
            name: 'Vishhnu',
            te_name: te.deva.vishnu,
          },
          {
            href: '/deva/other-vishnu-avatara',
            name: 'Other Vishnu Avatar',
            te_name: te.deva.other_vishnu,
          },
        ],
      },
      {
        href: '/deva/subrahmanya',
        name: 'Subrahmanya',
        te_name: te.deva.subrahmanya,
      },
      {
        href: '/deva/hanuman',
        name: 'Hanuman',
        te_name: te.deva.hanuman,
      },
      {
        href: '/deva/navagraha',
        name: 'Navagraha',
        te_name: te.deva.navagraha,
      },
      {
        href: '/deva/dattatreya',
        name: 'Dattatreya',
        te_name: te.deva.dattatreya,
      },
      {
        href: '/deva/shirdi-sai',
        name: 'Shirdi Sai',
        te_name: te.deva.shirdiSai,
      },
      {
        href: '/deva/others',
        name: 'Others',
        te_name: te.deva.othes,
      },
      {
        href: '/deva/anyadevatha',
        name: 'Anyadevatha',
        te_name: te.deva.allOtherDeities,
      },
    ],
  },
  {
    href: '/category',
    name: 'Category',
    te_name: te.nav.categoty,
    items: [
      {
        href: '/all-stotras-namavali',
        name: 'All Stotras & Namavali',
        te_name: te.nav.stotras_namavali,
      },
      {
        href: '/stotras',
        name: 'All Stotras',
        te_name: te.nav.all_stotras,
      },
      {
        href: '/sahasranamam',
        name: 'Sahasranamam',
        te_name: te.nav.sahasranamam,
      },
      {
        href: '/ashtothram',
        name: 'Ashtottara Shatanamavali',
        te_name: te.nav.ashtottara_shatanamavali,
      },
      {
        href: '/sahasranamavali',
        name: 'Sahasranamavali',
        te_name: te.nav.sahasranamavali,
      },
      {
        href: '/bhajans',
        name: 'Bhajans',
        te_name: te.nav.bhajans,
        showOnly: ['te'],
      },
      {
        href: '/bhakthi-songs',
        name: 'Bhakthi Songs',
        te_name: te.nav.bhakthi_songs,
        showOnly: ['te'],
      },
    ],
  },
  {
    href: 'calendar',
    name: 'Calendar',
    te_name: te.nav.calendar,
    items: [
      {
        href: '/calendar',
        name: 'Calendar Home',
        te_name: te.nav.calendar_home,
      },
      {
        href: '/calendar/tithi-dates',
        name: 'Tithi Dates',
        te_name: te.nav.tithi_dates,
      },
      {
        href: '/calendar/festivals/top-festivals',
        name: 'Top Festivals',
        te_name: te.nav.top_festivals,
      },
      {
        href: '/calendar/festivals',
        name: 'Festivals',
        te_name: te.nav.festivals,
      },
      {
        href: '/calendar/vrathas',
        name: 'Vrathas & Upavas',
        te_name: te.nav.vrathas_upavas,
      },
      {
        href: '/calendar/navratri',
        name: 'Navratri Dates',
        te_name: te.nav.navratri_dates,
      },
      {
        href: '/calendar/eclipse',
        name: 'Solor and Lunar Eclipses',
        te_name: te.nav.eclipses,
      },
    ],
  },
  {
    href: '/panchangam',
    name: 'Panchangam',
    te_name: te.nav.panchang,
  },
  {
    href: '/articles',
    name: 'Articles',
    te_name: te.nav.articles,
  },
];
