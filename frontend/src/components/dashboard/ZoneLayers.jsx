import { motion } from 'motion/react';
import PropTypes from 'prop-types';

const serif = { fontFamily: "'Playfair Display', Georgia, serif" };
const mono  = { fontFamily: "'Source Code Pro', monospace" };
const IC    = 'w-7 h-7';

/* ── Crop icon SVGs ────────────────────────────────────────────────────── */
const TomatoIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={IC}>
    <path d="M12 10V7M12 7C11 4 8 5 8 7M12 7C13 4 16 5 16 7" />
    <circle cx="12" cy="15" r="7" />
  </svg>
);

const CucumberIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={IC}>
    <ellipse cx="12" cy="13" rx="5" ry="9" />
    <path d="M9 10Q12 11 15 10M9 13Q12 14 15 13M9 16Q12 17 15 16" />
    <path d="M12 4Q13 2 12 1" />
  </svg>
);

const PepperIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={IC}>
    <path d="M12 5V3M12 3C14.5 2 16 4 15 5" />
    <path d="M9 5Q7 8 7 13Q8 20 12 21Q16 20 17 13Q17 8 15 5Q13 4 12 5Q11 4 9 5Z" />
    <path d="M12 10V17" />
  </svg>
);

const LettuceIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={IC}>
    <path d="M12 19Q8 15 8 11Q8 7 12 6Q16 7 16 11Q16 15 12 19Z" />
    <path d="M12 19Q5 16 5 11Q5 6 9 5" />
    <path d="M12 19Q19 16 19 11Q19 6 15 5" />
  </svg>
);

const StrawberryIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={IC}>
    <path d="M12 20Q7 15 7 10A5 5 0 0 1 17 10Q17 15 12 20Z" />
    <path d="M9 6Q10 4 12 5Q14 4 15 6Q13 8 12 7Q11 8 9 6Z" />
    <circle cx="10" cy="12" r="0.7" fill="currentColor" />
    <circle cx="14" cy="12" r="0.7" fill="currentColor" />
    <circle cx="12" cy="15" r="0.7" fill="currentColor" />
  </svg>
);

const CarrotIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={IC}>
    <path d="M12 4Q9 10 9 16Q10 20 12 21Q14 20 15 16Q15 10 12 4Z" />
    <path d="M12 4L10 1M12 4L12 1M12 4L14 1" />
  </svg>
);

const HerbIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={IC}>
    <path d="M12 21V12" />
    <ellipse cx="12" cy="8" rx="4" ry="6" />
    <path d="M12 15Q7 13 6 8M12 14Q17 12 18 7" />
  </svg>
);

const PotatoIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={IC}>
    <path d="M8 8Q5 10 5 14Q6 19 12 20Q18 19 19 14Q19 10 16 8Q14 6 12 6Q10 6 8 8Z" />
    <circle cx="9"  cy="12" r="1"   />
    <circle cx="15" cy="15" r="0.8" />
  </svg>
);

const CornIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={IC}>
    <path d="M10 20Q9 14 9 10Q10 5 12 4Q14 5 15 10Q15 14 14 20Q13 22 12 22Q11 22 10 20Z" />
    <path d="M9 7Q6 6 5 9M15 7Q18 6 19 9" />
    <path d="M9 12Q6 12 5 15M15 12Q18 12 19 15" />
    <path d="M10 4Q10 1 12 1Q14 1 14 4" />
  </svg>
);

const OnionIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={IC}>
    <path d="M12 8Q7 9 7 14Q8 20 12 21Q16 20 17 14Q17 9 12 8Z" />
    <path d="M12 8V3" />
    <path d="M10 5Q10 3 12 3Q14 3 14 5" />
  </svg>
);

const BeanIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={IC}>
    <path d="M8 5Q6 8 7 13Q9 19 13 20Q17 19 17 14Q16 9 13 7Q10 5 8 5Z" />
    <path d="M8 5Q12 3 15 5" />
    <path d="M10 10Q12 9 14 11M10 15Q12 14 14 16" />
  </svg>
);

const ZucchiniIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={IC}>
    <path d="M6 7Q4 10 6 14Q9 20 14 20Q18 19 19 15Q19 11 16 8Q12 4 8 5Q6 5 6 7Z" />
    <path d="M6 7Q8 4 10 5" />
    <path d="M9 9Q12 8 14 10M10 14Q13 13 15 15" />
  </svg>
);

const EggplantIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={IC}>
    <path d="M12 7Q8 8 7 13Q7 19 12 21Q17 19 17 13Q16 8 12 7Z" />
    <path d="M12 7V3" />
    <path d="M10 5Q10 3 12 3Q14 3 14 5" />
  </svg>
);

const SpinachIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={IC}>
    <path d="M12 21V12" />
    <path d="M12 16Q7 14 6 9Q9 8 12 11" />
    <path d="M12 13Q17 11 18 6Q15 5 12 8" />
    <path d="M12 10Q7 8 6 3Q9 2 12 5" />
  </svg>
);

const GrapeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={IC}>
    <path d="M12 6V3M12 3Q15 2 16 4" />
    <circle cx="10" cy="9"  r="2.5" />
    <circle cx="14" cy="9"  r="2.5" />
    <circle cx="8"  cy="14" r="2.5" />
    <circle cx="12" cy="14" r="2.5" />
    <circle cx="16" cy="14" r="2.5" />
    <circle cx="10" cy="19" r="2.5" />
    <circle cx="14" cy="19" r="2.5" />
  </svg>
);

const PlantIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={IC}>
    <path d="M12 21V10" />
    <path d="M12 16Q7 14 6 9Q9 8 12 11" />
    <path d="M12 12Q17 10 18 5Q15 4 12 7" />
  </svg>
);

const ICON_MAP = {
  tomato: TomatoIcon, cucumber: CucumberIcon, pepper: PepperIcon,
  lettuce: LettuceIcon, strawberry: StrawberryIcon, carrot: CarrotIcon,
  herb: HerbIcon, potato: PotatoIcon, corn: CornIcon, onion: OnionIcon,
  bean: BeanIcon, zucchini: ZucchiniIcon, eggplant: EggplantIcon,
  spinach: SpinachIcon, grape: GrapeIcon, plant: PlantIcon,
};

const CROP_RULES = [
  { match: ['tomato','tomatoes','rosii','roșii','tomate','pomidor'],             icon: 'tomato' },
  { match: ['cucumber','cucumbers','castravete','castraveti','castraveți'],       icon: 'cucumber' },
  { match: ['pepper','peppers','ardei','capsicum','bell pepper'],                 icon: 'pepper' },
  { match: ['lettuce','salata','salată'],                                         icon: 'lettuce' },
  { match: ['strawberry','strawberries','capsuna','căpșună','capsuni','căpșuni'], icon: 'strawberry' },
  { match: ['carrot','carrots','morcov','morcovi'],                               icon: 'carrot' },
  { match: ['basil','busuioc'],                                                   icon: 'herb' },
  { match: ['potato','potatoes','cartof','cartofi'],                              icon: 'potato' },
  { match: ['corn','porumb','maize','mais'],                                      icon: 'corn' },
  { match: ['onion','onions','ceapa','ceapă'],                                    icon: 'onion' },
  { match: ['bean','beans','fasole'],                                             icon: 'bean' },
  { match: ['zucchini','courgette','dovlecel'],                                   icon: 'zucchini' },
  { match: ['eggplant','aubergine','vanata','vânătă'],                            icon: 'eggplant' },
  { match: ['spinach','spanac'],                                                  icon: 'spinach' },
  { match: ['grape','grapes','strugure','struguri'],                              icon: 'grape' },
];

function detectCrop(name) {
  if (!name) return 'plant';
  const lower = name.toLowerCase();
  for (const { match, icon } of CROP_RULES) {
    if (match.some(k => lower.includes(k))) return icon;
  }
  return 'plant';
}

const LIVE_MS = 45_000;
function isLive(lastSeenAt) {
  return !!lastSeenAt && Date.now() - new Date(lastSeenAt).getTime() < LIVE_MS;
}

const OVERLAP = 24; // px each card slides under the one above
const CARD_H  = 80; // px

export default function ZoneLayers({ zones, onSelectZone }) {
  if (zones.length === 0) return null;

  return (
    <div className="flex flex-col items-center px-5 sm:px-7 pt-10">
      <div className="w-full max-w-lg">
        <h2 className="text-2xl text-ink mb-1.5" style={serif}>Your Zones</h2>
        <p className="text-sm text-muted mb-8">Select a zone to view its sensor readings.</p>

        {/* Stacked layer cards */}
        <div className="relative" style={{ paddingBottom: 32 }}>
          {zones.map((zone, i) => {
            const Icon = ICON_MAP[detectCrop(zone.zone_name)] ?? PlantIcon;
            const live = isLive(zone.last_seen_at);

            return (
              <motion.button
                key={zone.zone_id}
                type="button"
                onClick={() => onSelectZone(zone.zone_id)}
                className="relative w-full flex items-center gap-4 px-5 text-left rounded-2xl border border-border bg-surface2 cursor-pointer shadow-sm hover:shadow-lg transition-shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                style={{
                  height: CARD_H,
                  marginTop: i === 0 ? 0 : -OVERLAP,
                  zIndex: zones.length - i,
                  borderBottomWidth: 3,
                  borderBottomColor: 'rgba(44,56,32,0.15)',
                }}
                whileHover={{ y: -8 }}
                transition={{ duration: 0.18, ease: 'easeOut' }}
              >
                {/* Crop icon */}
                <div className="w-11 h-11 shrink-0 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
                  <Icon />
                </div>

                {/* Zone name + device */}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-ink text-base leading-snug truncate">
                    {zone.zone_name || zone.zone_id}
                  </p>
                  {zone.device_id && (
                    <p className="text-[11px] text-muted truncate mt-0.5" style={mono}>
                      {zone.device_id}
                    </p>
                  )}
                </div>

                {/* Status dot + chevron */}
                <div className="flex items-center gap-2.5 shrink-0">
                  <span
                    className={`w-2 h-2 rounded-full ${live ? 'bg-accent' : 'bg-border'}`}
                    title={live ? 'Live' : 'Offline'}
                  />
                  <svg className="w-4 h-4 text-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

ZoneLayers.propTypes = {
  zones: PropTypes.arrayOf(PropTypes.shape({
    zone_id:      PropTypes.string.isRequired,
    zone_name:    PropTypes.string,
    device_id:    PropTypes.string,
    last_seen_at: PropTypes.string,
  })).isRequired,
  onSelectZone: PropTypes.func.isRequired,
};
