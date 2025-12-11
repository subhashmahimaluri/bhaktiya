// dayRulerMessages.ts
import type { PlanetKey } from './dayRuler'; // your existing type

type RashiKeywords = Record<number, string>;

/**
 * Telugu rāśi display names (0..11)
 */
export const RASHI_NAMES_TE: string[] = [
  'మేష', // 0 Mesha
  'వృషభ', // 1 Vrishabha
  'మిథున', // 2 Mithuna
  'కర్క', // 3 Karka
  'సింహ', // 4 Simha
  'కన్య', // 5 Kanya
  'తులా', // 6 Tula
  'వృశ్చిక', // 7 Vrishchika
  'ధను', // 8 Dhanu
  'మకర', // 9 Makara
  'కుంభ', // 10 Kumbha
  'మీన', // 11 Meena
];

/**
 * A baseline keyword mapping for each planet. Each array must be length 12.
 * Index 0 → Mesha, 1 → Vrishabha, ... 11 → Meena.
 *
 * These Telugu strings are placeholders — replace/edit them with canonical
 * words you want to show (from books or Kannada calendar translations).
 */
const SUN_KEYWORDS: RashiKeywords = {
  0: 'ప్రతిరోధం',
  1: 'స్పర్థ',
  2: 'అనుకూలం',
  3: 'ఉత్తమం',
  4: 'ఆరోగ్యం',
  5: 'ప్రోత్సాహం',
  6: 'ప్రేమ',
  7: 'శుభం',
  8: 'భయతరనం',
  9: 'కొవ్వు',
  10: 'సువర్ధం',
  11: 'హాని',
};

const MOON_KEYWORDS: RashiKeywords = {
  0: 'స్నేహము',
  1: 'కుటుంబవిషయం',
  2: 'ఆనందం',
  3: 'వృద్ధి',
  4: 'ఆత్మవిశ్రాంతి',
  5: 'శాంతి',
  6: 'వృద్ది',
  7: 'ఆరోగ్య మెరుగుదల',
  8: 'ధనం',
  9: 'పరిమితి',
  10: 'ప్రయత్నం',
  11: 'విచారము',
};

const MARS_KEYWORDS: RashiKeywords = {
  0: 'సంక్షోభం',
  1: 'తీత్కార్యం',
  2: 'సాహసం',
  3: 'ధైర్యం',
  4: 'పొరపాటు',
  5: 'విజయశాలి',
  6: 'శక్తి',
  7: 'వేట',
  8: 'విజయం',
  9: 'శారీరక బాధ',
  10: 'కష్టాలు',
  11: 'రక్షణ',
};

const MERCURY_KEYWORDS: RashiKeywords = {
  0: 'వివాదం',
  1: 'వివాద నిర్మూలన',
  2: 'వివేచన',
  3: 'బుద్ధి',
  4: 'పాఠశాల',
  5: 'వ్యాపారం',
  6: 'సంప్రదాయము',
  7: 'కార్యదర్శి',
  8: 'చర్చలు',
  9: 'నష్టము',
  10: 'మెరుగుదలు',
  11: 'అన్వేషణ',
};

const JUPITER_KEYWORDS: RashiKeywords = {
  0: 'ధన లాభం',
  1: 'వృద్ధి',
  2: 'విర్చన',
  3: 'సంబంధాలు',
  4: 'శ్రేయస్సు',
  5: 'పాఠశాల',
  6: 'ప్రశాంతి',
  7: 'బలవంతము',
  8: 'ఆధాయం',
  9: 'న్యాయము',
  10: 'సుభిక్షము',
  11: 'తృప్తి',
};

const VENUS_KEYWORDS: RashiKeywords = {
  0: 'ఆనందం',
  1: 'సౌందర్యం',
  2: 'సుఖం',
  3: 'రుచులు',
  4: 'ఆనందభోగం',
  5: 'సంబంధాల వృద్ధి',
  6: 'ఆకర్షణ',
  7: 'ప్రేమ',
  8: 'సద్భావన',
  9: 'సంతాపం',
  10: 'రచన',
  11: 'స్నేహం',
};

const SATURN_KEYWORDS: RashiKeywords = {
  0: 'కష్టం',
  1: 'పరీక్ష',
  2: 'ధైర్యం',
  3: 'దుర్భరము',
  4: 'ఆరోగ్యం',
  5: 'ఘనత',
  6: 'ఘాటిత్వం',
  7: 'ప్రయత్నం',
  8: 'వికారము',
  9: 'విస్తరణ',
  10: 'విధి',
  11: 'విగా మనోభావం',
};

const RAHU_KEYWORDS: RashiKeywords = {
  0: 'అనిశ్చితి',
  1: 'సుప్రతిపత్తి',
  2: 'ప్రమాదం',
  3: 'అశాంతి',
  4: 'భయం',
  5: 'వింత',
  6: 'ఆలోచనలక్ష్యం',
  7: 'విజ్ఞానం',
  8: 'శత్రుభయము',
  9: 'ప్రయత్నం',
  10: 'పరిశోధన',
  11: 'విఘాతం',
};

const KETU_KEYWORDS: RashiKeywords = {
  0: 'విచ్చిన్నత',
  1: 'వేరొకత',
  2: 'బంధము',
  3: 'వియోగం',
  4: 'ప్రాణభయము',
  5: 'సంస్కారము',
  6: 'చింతన',
  7: 'దుఃఖం',
  8: 'విచక్షణత',
  9: 'వివేకము',
  10: 'ప్రత్యక్షం',
  11: 'మరణభయం',
};

export const DAY_RULER_MESSAGES: Record<PlanetKey, RashiKeywords> = {
  Sun: SUN_KEYWORDS,
  Moon: MOON_KEYWORDS,
  Mars: MARS_KEYWORDS,
  Mercury: MERCURY_KEYWORDS,
  Jupiter: JUPITER_KEYWORDS,
  Venus: VENUS_KEYWORDS,
  Saturn: SATURN_KEYWORDS,
  Rahu: RAHU_KEYWORDS,
  Ketu: KETU_KEYWORDS,
};

/**
 * If you want an English map (for scaling to other languages), supply
 * a similar object or wrap this file to return different language sets.
 */
export default DAY_RULER_MESSAGES;
