import React, { useState } from 'react';
import {
  ShoppingBasket,
  Users,
  Smartphone,
  Wrench,
  Check,
  ArrowRight,
  ArrowLeft,
  Calendar,
  Clock,
  Euro,
  MapPin,
  UserCheck,
  Home,
  MessageSquare,
  CheckCircle2,
  AlertCircle,
  Wifi,
  BatteryFull,
  Signal,
} from 'lucide-react';

type ViewMode = 'anziano' | 'giovane';
type PageNumber = 1 | 2;

type MansioneId = 'spesa' | 'compagnia' | 'tech' | 'lavori';
type PreferenzaId = 'Indifferente' | 'Ragazzo' | 'Ragazza' | 'Con auto';
type DayId = 'Lun' | 'Mar' | 'Mer' | 'Gio' | 'Ven' | 'Sab' | 'Dom';
type TimeSlotId = 'Mattina (9-12)' | 'Pomeriggio (15-18)' | 'Sera (18-20)';
type RetribuzioneId =
  | 'Gratuito (Volontariato)'
  | '10€ / ora'
  | '15€ / ora'
  | 'Rimborso spese';

interface Announcement {
  id: string;
  seniorName: string;
  neighborhood: string;
  mansione: MansioneId;
  preferenza: PreferenzaId;
  days: DayId[];
  timeSlots: TimeSlotId[];
  retribuzione: RetribuzioneId;
  isNew?: boolean;
  response?: {
    day: DayId;
    timeSlot: TimeSlotId;
    exactHour: string;
    message: string;
  };
}

interface MansioneOption {
  id: MansioneId;
  label: string;
  shortLabel: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
}

const MANSIONI: MansioneOption[] = [
  {
    id: 'spesa',
    label: 'Fare la spesa',
    shortLabel: 'Fare la spesa',
    icon: ShoppingBasket,
  },
  {
    id: 'compagnia',
    label: 'Compagnia / Passeggiata',
    shortLabel: 'Compagnia / Passeggiata',
    icon: Users,
  },
  {
    id: 'tech',
    label: 'Aiuto cellulare / PC',
    shortLabel: 'Aiuto cellulare / PC',
    icon: Smartphone,
  },
  {
    id: 'lavori',
    label: 'Piccoli lavori / Auto',
    shortLabel: 'Piccoli lavori / Auto',
    icon: Wrench,
  },
];

const PREFERENZE: PreferenzaId[] = [
  'Indifferente',
  'Ragazzo',
  'Ragazza',
  'Con auto',
];

const DAYS: DayId[] = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'];
const WEEKDAYS: DayId[] = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven'];
const WEEKEND: DayId[] = ['Sab', 'Dom'];

const TIME_SLOTS: TimeSlotId[] = [
  'Mattina (9-12)',
  'Pomeriggio (15-18)',
  'Sera (18-20)',
];

const EXACT_HOURS_BY_SLOT: Record<TimeSlotId, string[]> = {
  'Mattina (9-12)': ['09:30', '10:30', '11:30'],
  'Pomeriggio (15-18)': ['15:00', '16:00', '17:00'],
  'Sera (18-20)': ['18:00', '18:45', '19:30'],
};

const RETRIBUZIONI: RetribuzioneId[] = [
  'Gratuito (Volontariato)',
  '10€ / ora',
  '15€ / ora',
  'Rimborso spese',
];

const INITIAL_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'ann-1',
    seniorName: 'Signora Rosa',
    neighborhood: 'Quartiere Centro',
    mansione: 'spesa',
    preferenza: 'Con auto',
    days: ['Lun', 'Gio'],
    timeSlots: ['Mattina (9-12)'],
    retribuzione: '10€ / ora',
  },
  {
    id: 'ann-2',
    seniorName: 'Signor Franco',
    neighborhood: 'Quartiere Stazione',
    mansione: 'tech',
    preferenza: 'Indifferente',
    days: ['Mar', 'Mer', 'Ven'],
    timeSlots: ['Pomeriggio (15-18)', 'Sera (18-20)'],
    retribuzione: 'Gratuito (Volontariato)',
  },
];

function getMansioneInfo(id: MansioneId): MansioneOption {
  return MANSIONI.find((m) => m.id === id) || MANSIONI[0];
}

export default function App() {
  // Global prototype view state
  const [viewMode, setViewMode] = useState<ViewMode>('anziano');

  // Anziano (Senior) 2-page flow state (preserved seamlessly between pages)
  const [anzianoPage, setAnzianoPage] = useState<PageNumber>(1);
  const [selectedMansione, setSelectedMansione] = useState<MansioneId | null>('spesa');
  const [selectedPreferenza, setSelectedPreferenza] = useState<PreferenzaId>('Indifferente');
  const [selectedDays, setSelectedDays] = useState<DayId[]>(['Lun', 'Mer', 'Ven']);
  const [selectedTimeSlots, setSelectedTimeSlots] = useState<TimeSlotId[]>(['Mattina (9-12)']);
  const [selectedRetribuzione, setSelectedRetribuzione] = useState<RetribuzioneId>('10€ / ora');
  const [seniorName, setSeniorName] = useState<string>('Signor Giuseppe');
  const [seniorNeighborhood, setSeniorNeighborhood] = useState<string>('Quartiere San Marco');
  const [anzianoError, setAnzianoError] = useState<string | null>(null);
  const [showPublishedModal, setShowPublishedModal] = useState<boolean>(false);

  // Giovane (Youth) 2-page flow state
  const [announcements, setAnnouncements] = useState<Announcement[]>(INITIAL_ANNOUNCEMENTS);
  const [giovanePage, setGiovanePage] = useState<PageNumber>(1);
  const [activeAnnouncementId, setActiveAnnouncementId] = useState<string | null>(null);
  const [replyDay, setReplyDay] = useState<DayId | null>(null);
  const [replyTimeSlot, setReplyTimeSlot] = useState<TimeSlotId | null>(null);
  const [replyExactHour, setReplyExactHour] = useState<string>('');
  const [replyMessage, setReplyMessage] = useState<string>('');
  const [giovaneError, setGiovaneError] = useState<string | null>(null);
  const [showReplyConfirmedModal, setShowReplyConfirmedModal] = useState<boolean>(false);

  // Toggle single day
  const handleToggleDay = (day: DayId) => {
    setAnzianoError(null);
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  // Toggle group of days (e.g. Weekdays or Weekend)
  const handleToggleDayGroup = (group: DayId[]) => {
    setAnzianoError(null);
    const allIncluded = group.every((d) => selectedDays.includes(d));
    if (allIncluded) {
      setSelectedDays((prev) => prev.filter((d) => !group.includes(d)));
    } else {
      setSelectedDays((prev) => {
        const merged = new Set([...prev, ...group]);
        return DAYS.filter((d) => merged.has(d));
      });
    }
  };

  // Toggle time slot
  const handleToggleTimeSlot = (slot: TimeSlotId) => {
    setAnzianoError(null);
    setSelectedTimeSlots((prev) =>
      prev.includes(slot) ? prev.filter((s) => s !== slot) : [...prev, slot]
    );
  };

  // Publish Senior announcement
  const handlePublishAnnouncement = () => {
    if (!selectedMansione) {
      setAnzianoError('Torna alla Pagina 1 per scegliere una mansione.');
      return;
    }
    if (selectedDays.length === 0) {
      setAnzianoError('Seleziona almeno un giorno disponibile.');
      return;
    }
    if (selectedTimeSlots.length === 0) {
      setAnzianoError('Seleziona almeno una fascia oraria.');
      return;
    }

    const newAnnouncement: Announcement = {
      id: `ann-${Date.now()}`,
      seniorName: seniorName.trim() || 'Signor Giuseppe',
      neighborhood: seniorNeighborhood.trim() || 'Quartiere San Marco',
      mansione: selectedMansione,
      preferenza: selectedPreferenza,
      days: DAYS.filter((d) => selectedDays.includes(d)),
      timeSlots: TIME_SLOTS.filter((t) => selectedTimeSlots.includes(t)),
      retribuzione: selectedRetribuzione,
      isNew: true,
    };

    setAnnouncements((prev) => [newAnnouncement, ...prev]);
    setAnzianoError(null);
    setShowPublishedModal(true);
  };

  const handleResetSeniorForm = () => {
    setShowPublishedModal(false);
    setAnzianoPage(1);
    setSelectedMansione(null);
    setSelectedPreferenza('Indifferente');
    setSelectedDays([]);
    setSelectedTimeSlots([]);
    setSelectedRetribuzione('Gratuito (Volontariato)');
    setAnzianoError(null);
  };

  const handleOpenReplyPage = (ann: Announcement) => {
    setActiveAnnouncementId(ann.id);
    setGiovaneError(null);
    if (ann.response) {
      setReplyDay(ann.response.day);
      setReplyTimeSlot(ann.response.timeSlot);
      setReplyExactHour(ann.response.exactHour);
      setReplyMessage(ann.response.message);
    } else {
      const firstDay = ann.days[0] || null;
      const firstSlot = ann.timeSlots[0] || null;
      setReplyDay(firstDay);
      setReplyTimeSlot(firstSlot);
      setReplyExactHour(firstSlot ? EXACT_HOURS_BY_SLOT[firstSlot][0] : '');
      setReplyMessage('');
    }
    setGiovanePage(2);
  };

  const handleSelectReplySlot = (slot: TimeSlotId) => {
    setReplyTimeSlot(slot);
    setReplyExactHour(EXACT_HOURS_BY_SLOT[slot][0]);
    setGiovaneError(null);
  };

  const handleConfirmReply = () => {
    if (!activeAnnouncementId) return;
    if (!replyDay) {
      setGiovaneError('Seleziona un giorno disponibile.');
      return;
    }
    if (!replyTimeSlot) {
      setGiovaneError('Seleziona una fascia oraria.');
      return;
    }

    setAnnouncements((prev) =>
      prev.map((item) =>
        item.id === activeAnnouncementId
          ? {
              ...item,
              response: {
                day: replyDay,
                timeSlot: replyTimeSlot,
                exactHour: replyExactHour || EXACT_HOURS_BY_SLOT[replyTimeSlot][0],
                message:
                  replyMessage.trim() ||
                  'Buongiorno! Sono disponibile nel giorno e orario indicati.',
              },
            }
          : item
      )
    );
    setGiovaneError(null);
    setShowReplyConfirmedModal(true);
  };

  const activeAnnouncement =
    announcements.find((a) => a.id === activeAnnouncementId) || null;

  const isWeekdaysSelected = WEEKDAYS.every((d) => selectedDays.includes(d));
  const isWeekendSelected = WEEKEND.every((d) => selectedDays.includes(d));

  return (
    <div className="min-h-screen w-full bg-[#E3E5E8] flex flex-col items-center justify-center p-2 sm:p-6">
      {/* iPhone 17 Pro Hardware Mockup */}
      <div
        className="relative flex flex-col items-center justify-center rounded-[60px] p-[9px] shadow-[0_28px_70px_-15px_rgba(0,0,0,0.45)] select-none"
        style={{
          background:
            'linear-gradient(145deg, #D2CFC8 0%, #8E8B84 25%, #B9B6AF 55%, #75726B 85%, #C8C5BE 100%)',
        }}
        aria-label="Mockup hardware iPhone 17 Pro"
      >
        {/* Side Hardware Buttons - Left */}
        <div
          aria-hidden="true"
          className="absolute -left-[4px] top-[132px] w-[4px] h-[34px] rounded-l-sm bg-[#8D8A83] border-r border-[#55524D]"
        />
        <div
          aria-hidden="true"
          className="absolute -left-[4px] top-[190px] w-[4px] h-[62px] rounded-l-sm bg-[#8D8A83] border-r border-[#55524D]"
        />
        <div
          aria-hidden="true"
          className="absolute -left-[4px] top-[266px] w-[4px] h-[62px] rounded-l-sm bg-[#8D8A83] border-r border-[#55524D]"
        />
        {/* Side Hardware Button - Right (Power) */}
        <div
          aria-hidden="true"
          className="absolute -right-[4px] top-[210px] w-[4px] h-[94px] rounded-r-sm bg-[#8D8A83] border-l border-[#55524D]"
        />

        {/* Inner Black Glass Bezel */}
        <div className="bg-[#121214] rounded-[52px] p-[7px] shadow-inner">
          {/* iPhone 17 Pro Display Viewport: 402 x 874 px */}
          <div className="relative w-[370px] sm:w-[402px] h-[820px] sm:h-[874px] bg-[#FAFAFA] rounded-[45px] overflow-hidden flex flex-col text-[#1A1A1A] select-text">
            {/* iOS Top Safe Area + Dynamic Island */}
            <div className="shrink-0 bg-[#FAFAFA] pt-3 pb-2 px-6 flex items-center justify-between">
              <span className="text-[15px] font-bold tracking-tight tabular-nums text-[#1A1A1A] w-14">
                09:41
              </span>

              {/* Dynamic Island */}
              <div
                aria-hidden="true"
                className="w-[120px] h-[34px] bg-[#0B0B0D] rounded-full flex items-center justify-end pr-3 shadow-sm"
              >
                <div className="w-3 h-3 rounded-full bg-[#1C1D24] border border-[#2C2E38] flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#243B6B]" />
                </div>
              </div>

              <div
                aria-hidden="true"
                className="flex items-center gap-1.5 text-[#1A1A1A] w-14 justify-end"
              >
                <Signal className="w-4 h-4" strokeWidth={2.5} />
                <Wifi className="w-4 h-4" strokeWidth={2.5} />
                <BatteryFull className="w-5 h-5" strokeWidth={2.3} />
              </div>
            </div>

            {/* App Brand Strip & Role Selector right below Dynamic Island */}
            <header className="shrink-0 px-4 pt-1 pb-3 bg-[#FAFAFA] border-b-2 border-[#1A1A1A]">
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 border-2 border-[#1A1A1A] bg-[#FFFFFF] rounded-lg flex items-center justify-center">
                    <Home className="w-5 h-5 text-[#1A1A1A]" strokeWidth={2.5} />
                  </div>
                  <span className="text-[20px] font-extrabold tracking-tight text-[#1A1A1A]">
                    Vicini di Casa
                  </span>
                </div>
              </div>

              {/* Quick Prototype View Switcher */}
              <div
                role="tablist"
                aria-label="Selettore vista prototipo"
                className="grid grid-cols-2 gap-2"
              >
                <button
                  type="button"
                  role="tab"
                  aria-selected={viewMode === 'anziano'}
                  onClick={() => {
                    setViewMode('anziano');
                    setShowReplyConfirmedModal(false);
                  }}
                  className={`min-h-[52px] px-2.5 py-2 rounded-xl border-2 border-[#1A1A1A] text-center transition-colors focus-visible:outline-4 focus-visible:outline-[#003E9C] focus-visible:outline-offset-2 cursor-pointer flex flex-col items-center justify-center ${
                    viewMode === 'anziano'
                      ? 'bg-[#003E9C] text-[#FFFFFF]'
                      : 'bg-[#FFFFFF] text-[#1A1A1A] hover:bg-[#EFEFEF]'
                  }`}
                >
                  <span className="text-[14px] font-extrabold leading-tight">
                    Vista Anziano
                  </span>
                  <span
                    className={`text-[12px] font-semibold leading-tight mt-0.5 ${
                      viewMode === 'anziano' ? 'text-[#E5EEFF]' : 'text-[#333333]'
                    }`}
                  >
                    (Crea Annuncio)
                  </span>
                </button>

                <button
                  type="button"
                  role="tab"
                  aria-selected={viewMode === 'giovane'}
                  onClick={() => {
                    setViewMode('giovane');
                    setShowPublishedModal(false);
                  }}
                  className={`min-h-[52px] px-2.5 py-2 rounded-xl border-2 border-[#1A1A1A] text-center transition-colors focus-visible:outline-4 focus-visible:outline-[#003E9C] focus-visible:outline-offset-2 cursor-pointer flex flex-col items-center justify-center ${
                    viewMode === 'giovane'
                      ? 'bg-[#003E9C] text-[#FFFFFF]'
                      : 'bg-[#FFFFFF] text-[#1A1A1A] hover:bg-[#EFEFEF]'
                  }`}
                >
                  <span className="text-[14px] font-extrabold leading-tight">
                    Vista Giovane
                  </span>
                  <span
                    className={`text-[12px] font-semibold leading-tight mt-0.5 ${
                      viewMode === 'giovane' ? 'text-[#E5EEFF]' : 'text-[#333333]'
                    }`}
                  >
                    (Rispondi · {announcements.length})
                  </span>
                </button>
              </div>
            </header>

            {/* MAIN SCROLLABLE APP SCREEN */}
            <main className="flex-1 overflow-y-auto wireframe-scroll px-4 py-4 space-y-6">
              {/* ============================================================
                  FLUSSO ANZIANO — PAGINA 1: Cosa ti serve e Chi cerchi
              ============================================================ */}
              {viewMode === 'anziano' && anzianoPage === 1 && (
                <div className="space-y-6 pb-2">
                  {/* Page Header */}
                  <div className="border-b-2 border-[#1A1A1A] pb-3">
                    <div className="flex items-baseline justify-between gap-2">
                      <h1 className="text-[26px] font-extrabold tracking-tight text-[#1A1A1A] leading-tight">
                        Chiedi un aiuto
                      </h1>
                      <span className="text-[15px] font-bold text-[#003E9C] tabular-nums whitespace-nowrap shrink-0">
                        Pagina 1 di 2
                      </span>
                    </div>
                    {/* Wireframe Step Progress Bar */}
                    <div
                      aria-hidden="true"
                      className="grid grid-cols-2 gap-2 mt-2.5"
                    >
                      <div className="h-2.5 rounded-sm bg-[#003E9C] border border-[#1A1A1A]" />
                      <div className="h-2.5 rounded-sm bg-[#FFFFFF] border-2 border-[#1A1A1A]" />
                    </div>
                  </div>

                  {/* Sezione 1: Seleziona la mansione (Griglia 2x2) */}
                  <section aria-labelledby="sec-mansione">
                    <h2
                      id="sec-mansione"
                      className="text-[20px] font-extrabold text-[#1A1A1A] mb-3"
                    >
                      1. Seleziona la mansione
                    </h2>
                    <div className="grid grid-cols-2 gap-3">
                      {MANSIONI.map((item) => {
                        const Icon = item.icon;
                        const isSelected = selectedMansione === item.id;
                        return (
                          <button
                            key={item.id}
                            type="button"
                            aria-pressed={isSelected}
                            onClick={() => {
                              setSelectedMansione(item.id);
                              setAnzianoError(null);
                            }}
                            className={`relative min-h-[124px] p-3.5 rounded-xl border-2 text-left flex flex-col justify-between transition-colors cursor-pointer focus-visible:outline-4 focus-visible:outline-[#003E9C] focus-visible:outline-offset-2 ${
                              isSelected
                                ? 'bg-[#003E9C] border-[#1A1A1A] text-[#FFFFFF]'
                                : 'bg-[#FFFFFF] border-[#1A1A1A] text-[#1A1A1A] hover:bg-[#EFEFEF]'
                            }`}
                          >
                            <div className="flex items-start justify-between w-full">
                              <div
                                className={`w-12 h-12 rounded-lg border-2 flex items-center justify-center ${
                                  isSelected
                                    ? 'bg-[#FFFFFF] border-[#FFFFFF] text-[#003E9C]'
                                    : 'bg-[#EFEFEF] border-[#1A1A1A] text-[#1A1A1A]'
                                }`}
                              >
                                <Icon className="w-7 h-7" strokeWidth={2.3} />
                              </div>

                              {/* Explicit Wireframe Checkbox Indicator */}
                              <div
                                aria-hidden="true"
                                className={`w-7 h-7 rounded-md border-2 flex items-center justify-center ${
                                  isSelected
                                    ? 'bg-[#FFFFFF] border-[#FFFFFF] text-[#003E9C]'
                                    : 'bg-[#FFFFFF] border-[#1A1A1A]'
                                }`}
                              >
                                {isSelected && (
                                  <Check className="w-5 h-5" strokeWidth={3} />
                                )}
                              </div>
                            </div>

                            <span className="text-[18px] font-extrabold leading-snug mt-3 block">
                              {item.label}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </section>

                  {/* Sezione 2: Chi preferisci? (Bottoni grandi a selezione singola) */}
                  <section aria-labelledby="sec-preferenza">
                    <h2
                      id="sec-preferenza"
                      className="text-[20px] font-extrabold text-[#1A1A1A] mb-3"
                    >
                      2. Chi preferisci?
                    </h2>
                    <div className="grid grid-cols-2 gap-3">
                      {PREFERENZE.map((pref) => {
                        const isSelected = selectedPreferenza === pref;
                        return (
                          <button
                            key={pref}
                            type="button"
                            aria-pressed={isSelected}
                            onClick={() => setSelectedPreferenza(pref)}
                            className={`min-h-[60px] px-3 py-3 rounded-xl border-2 border-[#1A1A1A] flex items-center justify-between gap-2 text-[18px] font-extrabold transition-colors cursor-pointer focus-visible:outline-4 focus-visible:outline-[#003E9C] focus-visible:outline-offset-2 ${
                              isSelected
                                ? 'bg-[#003E9C] text-[#FFFFFF]'
                                : 'bg-[#FFFFFF] text-[#1A1A1A] hover:bg-[#EFEFEF]'
                            }`}
                          >
                            <span className="text-left leading-tight">{pref}</span>
                            <span
                              aria-hidden="true"
                              className={`w-6 h-6 shrink-0 rounded-full border-2 flex items-center justify-center ${
                                isSelected
                                  ? 'bg-[#FFFFFF] border-[#FFFFFF] text-[#003E9C]'
                                  : 'bg-[#FFFFFF] border-[#1A1A1A]'
                              }`}
                            >
                              {isSelected && (
                                <Check className="w-4 h-4" strokeWidth={3} />
                              )}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </section>
                </div>
              )}

              {/* ============================================================
                  FLUSSO ANZIANO — PAGINA 2: Quando, Retribuzione e Pubblicazione
              ============================================================ */}
              {viewMode === 'anziano' && anzianoPage === 2 && (
                <div className="space-y-6 pb-2">
                  {/* Page Header */}
                  <div className="border-b-2 border-[#1A1A1A] pb-3">
                    <div className="flex items-baseline justify-between gap-2">
                      <h1 className="text-[26px] font-extrabold tracking-tight text-[#1A1A1A] leading-tight">
                        Orari e Dettagli
                      </h1>
                      <span className="text-[15px] font-bold text-[#003E9C] tabular-nums whitespace-nowrap shrink-0">
                        Pagina 2 di 2
                      </span>
                    </div>
                    <div
                      aria-hidden="true"
                      className="grid grid-cols-2 gap-2 mt-2.5"
                    >
                      <div className="h-2.5 rounded-sm bg-[#003E9C] border border-[#1A1A1A]" />
                      <div className="h-2.5 rounded-sm bg-[#003E9C] border border-[#1A1A1A]" />
                    </div>
                  </div>

                  {/* Error Banner if missing required selections */}
                  {anzianoError && (
                    <div
                      role="alert"
                      className="p-4 rounded-xl border-2 border-[#1A1A1A] bg-[#FFEAEA] text-[#1A1A1A] flex items-start gap-3"
                    >
                      <AlertCircle
                        className="w-6 h-6 shrink-0 text-[#990000] mt-0.5"
                        strokeWidth={2.5}
                      />
                      <div className="space-y-2">
                        <p className="text-[17px] font-extrabold leading-snug">
                          {anzianoError}
                        </p>
                        {!selectedMansione && (
                          <button
                            type="button"
                            onClick={() => {
                              setAnzianoError(null);
                              setAnzianoPage(1);
                            }}
                            className="min-h-[44px] px-4 py-2 rounded-lg border-2 border-[#1A1A1A] bg-[#FFFFFF] text-[16px] font-extrabold cursor-pointer"
                          >
                            Vai a Pagina 1
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Sezione 1: Giorni disponibili */}
                  <section aria-labelledby="sec-giorni">
                    <h2
                      id="sec-giorni"
                      className="text-[20px] font-extrabold text-[#1A1A1A] mb-2.5"
                    >
                      1. Giorni disponibili
                    </h2>

                    {/* Quick Group Selectors */}
                    <div className="grid grid-cols-2 gap-2.5 mb-3">
                      <button
                        type="button"
                        aria-pressed={isWeekdaysSelected}
                        onClick={() => handleToggleDayGroup(WEEKDAYS)}
                        className={`min-h-[48px] px-3 py-2 rounded-xl border-2 border-[#1A1A1A] text-[15px] font-bold transition-colors cursor-pointer focus-visible:outline-4 focus-visible:outline-[#003E9C] ${
                          isWeekdaysSelected
                            ? 'bg-[#1A1A1A] text-[#FFFFFF]'
                            : 'bg-[#EFEFEF] text-[#1A1A1A] hover:bg-[#E0E0E0]'
                        }`}
                      >
                        {isWeekdaysSelected ? '✓ ' : ''}Tutti i feriali (Lun-Ven)
                      </button>
                      <button
                        type="button"
                        aria-pressed={isWeekendSelected}
                        onClick={() => handleToggleDayGroup(WEEKEND)}
                        className={`min-h-[48px] px-3 py-2 rounded-xl border-2 border-[#1A1A1A] text-[15px] font-bold transition-colors cursor-pointer focus-visible:outline-4 focus-visible:outline-[#003E9C] ${
                          isWeekendSelected
                            ? 'bg-[#1A1A1A] text-[#FFFFFF]'
                            : 'bg-[#EFEFEF] text-[#1A1A1A] hover:bg-[#E0E0E0]'
                        }`}
                      >
                        {isWeekendSelected ? '✓ ' : ''}Fine settimana
                      </button>
                    </div>

                    {/* Large Individual Day Buttons */}
                    <div className="grid grid-cols-4 gap-2.5">
                      {DAYS.map((day) => {
                        const isSelected = selectedDays.includes(day);
                        return (
                          <button
                            key={day}
                            type="button"
                            aria-pressed={isSelected}
                            onClick={() => handleToggleDay(day)}
                            className={`min-h-[60px] rounded-xl border-2 border-[#1A1A1A] flex flex-col items-center justify-center text-[19px] font-extrabold transition-colors cursor-pointer focus-visible:outline-4 focus-visible:outline-[#003E9C] focus-visible:outline-offset-2 ${
                              isSelected
                                ? 'bg-[#003E9C] text-[#FFFFFF]'
                                : 'bg-[#FFFFFF] text-[#1A1A1A] hover:bg-[#EFEFEF]'
                            }`}
                          >
                            <span>{day}</span>
                            {isSelected && (
                              <Check className="w-4 h-4 mt-0.5" strokeWidth={3} />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </section>

                  {/* Sezione 2: Fascia oraria */}
                  <section aria-labelledby="sec-orari">
                    <h2
                      id="sec-orari"
                      className="text-[20px] font-extrabold text-[#1A1A1A] mb-3"
                    >
                      2. Fascia oraria
                    </h2>
                    <div className="space-y-3">
                      {TIME_SLOTS.map((slot) => {
                        const isSelected = selectedTimeSlots.includes(slot);
                        return (
                          <button
                            key={slot}
                            type="button"
                            aria-pressed={isSelected}
                            onClick={() => handleToggleTimeSlot(slot)}
                            className={`w-full min-h-[60px] px-4 py-3 rounded-xl border-2 border-[#1A1A1A] flex items-center justify-between text-[19px] font-extrabold transition-colors cursor-pointer focus-visible:outline-4 focus-visible:outline-[#003E9C] focus-visible:outline-offset-2 ${
                              isSelected
                                ? 'bg-[#003E9C] text-[#FFFFFF]'
                                : 'bg-[#FFFFFF] text-[#1A1A1A] hover:bg-[#EFEFEF]'
                            }`}
                          >
                            <span className="flex items-center gap-3">
                              <Clock className="w-6 h-6 shrink-0" strokeWidth={2.5} />
                              <span>{slot}</span>
                            </span>
                            <span
                              aria-hidden="true"
                              className={`w-7 h-7 rounded-md border-2 flex items-center justify-center ${
                                isSelected
                                  ? 'bg-[#FFFFFF] border-[#FFFFFF] text-[#003E9C]'
                                  : 'bg-[#FFFFFF] border-[#1A1A1A]'
                              }`}
                            >
                              {isSelected && (
                                <Check className="w-5 h-5" strokeWidth={3} />
                              )}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </section>

                  {/* Sezione 3: Eventuale retribuzione */}
                  <section aria-labelledby="sec-retribuzione">
                    <h2
                      id="sec-retribuzione"
                      className="text-[20px] font-extrabold text-[#1A1A1A] mb-3"
                    >
                      3. Eventuale retribuzione
                    </h2>
                    <div className="grid grid-cols-2 gap-3">
                      {RETRIBUZIONI.map((ret) => {
                        const isSelected = selectedRetribuzione === ret;
                        return (
                          <button
                            key={ret}
                            type="button"
                            aria-pressed={isSelected}
                            onClick={() => setSelectedRetribuzione(ret)}
                            className={`min-h-[64px] px-3 py-3 rounded-xl border-2 border-[#1A1A1A] flex items-center justify-between gap-2 text-left text-[17px] font-extrabold leading-tight transition-colors cursor-pointer focus-visible:outline-4 focus-visible:outline-[#003E9C] focus-visible:outline-offset-2 ${
                              isSelected
                                ? 'bg-[#003E9C] text-[#FFFFFF]'
                                : 'bg-[#FFFFFF] text-[#1A1A1A] hover:bg-[#EFEFEF]'
                            }`}
                          >
                            <span>{ret}</span>
                            <span
                              aria-hidden="true"
                              className={`w-6 h-6 shrink-0 rounded-full border-2 flex items-center justify-center ${
                                isSelected
                                  ? 'bg-[#FFFFFF] border-[#FFFFFF] text-[#003E9C]'
                                  : 'bg-[#FFFFFF] border-[#1A1A1A]'
                              }`}
                            >
                              {isSelected && (
                                <Check className="w-4 h-4" strokeWidth={3} />
                              )}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </section>

                  {/* Dati identificativi brevi per la bacheca */}
                  <section aria-labelledby="sec-contatto">
                    <h2
                      id="sec-contatto"
                      className="text-[20px] font-extrabold text-[#1A1A1A] mb-3"
                    >
                      4. Il tuo nome e quartiere
                    </h2>
                    <div className="grid grid-cols-1 gap-3">
                      <div>
                        <label
                          htmlFor="senior-name"
                          className="block text-[16px] font-bold text-[#1A1A1A] mb-1"
                        >
                          Nome
                        </label>
                        <input
                          id="senior-name"
                          type="text"
                          value={seniorName}
                          onChange={(e) => setSeniorName(e.target.value)}
                          className="w-full min-h-[56px] px-3.5 py-2 rounded-xl border-2 border-[#1A1A1A] bg-[#FFFFFF] text-[18px] font-semibold text-[#1A1A1A] focus-visible:outline-4 focus-visible:outline-[#003E9C]"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="senior-neighborhood"
                          className="block text-[16px] font-bold text-[#1A1A1A] mb-1"
                        >
                          Quartiere
                        </label>
                        <input
                          id="senior-neighborhood"
                          type="text"
                          value={seniorNeighborhood}
                          onChange={(e) => setSeniorNeighborhood(e.target.value)}
                          className="w-full min-h-[56px] px-3.5 py-2 rounded-xl border-2 border-[#1A1A1A] bg-[#FFFFFF] text-[18px] font-semibold text-[#1A1A1A] focus-visible:outline-4 focus-visible:outline-[#003E9C]"
                        />
                      </div>
                    </div>
                  </section>

                  {/* Box Riepilogo Wireframe */}
                  <section
                    aria-labelledby="sec-riepilogo"
                    className="p-4 rounded-xl border-2 border-dashed border-[#1A1A1A] bg-[#FFFFFF]"
                  >
                    <h2
                      id="sec-riepilogo"
                      className="text-[19px] font-extrabold text-[#1A1A1A] mb-3 pb-2 border-b-2 border-[#1A1A1A]"
                    >
                      Riepilogo del tuo annuncio
                    </h2>
                    <dl className="space-y-2.5 text-[17px]">
                      <div className="flex flex-col">
                        <dt className="font-bold text-[#333333] text-[15px]">
                          Mansione richiesta:
                        </dt>
                        <dd className="font-extrabold text-[#1A1A1A]">
                          {selectedMansione
                            ? getMansioneInfo(selectedMansione).label
                            : 'Da selezionare (Pagina 1)'}
                        </dd>
                      </div>
                      <div className="flex flex-col">
                        <dt className="font-bold text-[#333333] text-[15px]">
                          Preferenza persona:
                        </dt>
                        <dd className="font-extrabold text-[#1A1A1A]">
                          {selectedPreferenza}
                        </dd>
                      </div>
                      <div className="flex flex-col">
                        <dt className="font-bold text-[#333333] text-[15px]">
                          Giorni disponibili:
                        </dt>
                        <dd className="font-extrabold text-[#1A1A1A]">
                          {selectedDays.length > 0
                            ? DAYS.filter((d) => selectedDays.includes(d)).join(', ')
                            : 'Nessun giorno selezionato'}
                        </dd>
                      </div>
                      <div className="flex flex-col">
                        <dt className="font-bold text-[#333333] text-[15px]">
                          Fascia oraria:
                        </dt>
                        <dd className="font-extrabold text-[#1A1A1A]">
                          {selectedTimeSlots.length > 0
                            ? TIME_SLOTS.filter((t) =>
                                selectedTimeSlots.includes(t)
                              ).join(' · ')
                            : 'Nessun orario selezionato'}
                        </dd>
                      </div>
                      <div className="flex flex-col">
                        <dt className="font-bold text-[#333333] text-[15px]">
                          Retribuzione:
                        </dt>
                        <dd className="font-extrabold text-[#003E9C]">
                          {selectedRetribuzione}
                        </dd>
                      </div>
                    </dl>
                  </section>
                </div>
              )}

              {/* ============================================================
                  FLUSSO GIOVANE — PAGINA 1: Bacheca Annunci
              ============================================================ */}
              {viewMode === 'giovane' && giovanePage === 1 && (
                <div className="space-y-5 pb-2">
                  <div className="border-b-2 border-[#1A1A1A] pb-3">
                    <div className="flex items-baseline justify-between gap-2">
                      <h1 className="text-[26px] font-extrabold tracking-tight text-[#1A1A1A] leading-tight">
                        Bacheca Annunci
                      </h1>
                      <span className="text-[15px] font-bold text-[#003E9C] tabular-nums whitespace-nowrap shrink-0">
                        Pagina 1 di 2
                      </span>
                    </div>
                    <p className="text-[16px] font-semibold text-[#333333] mt-1">
                      {announcements.length} richieste di aiuto nel tuo quartiere
                    </p>
                  </div>

                  <div className="space-y-4">
                    {announcements.map((ann) => {
                      const mansioneInfo = getMansioneInfo(ann.mansione);
                      const MansioneIcon = mansioneInfo.icon;

                      return (
                        <article
                          key={ann.id}
                          className="p-4 rounded-xl border-2 border-[#1A1A1A] bg-[#FFFFFF] space-y-3.5"
                        >
                          {/* Top Wireframe Card Row: Icon Placeholder + Title + Name */}
                          <div className="flex items-start gap-3">
                            <div className="w-14 h-14 shrink-0 rounded-xl border-2 border-[#1A1A1A] bg-[#EFEFEF] flex items-center justify-center">
                              <MansioneIcon
                                className="w-8 h-8 text-[#1A1A1A]"
                                strokeWidth={2.3}
                              />
                            </div>
                            <div className="min-w-0 flex-1">
                              {ann.isNew && (
                                <p className="text-[13px] font-extrabold text-[#003E9C] mb-0.5">
                                  Nuovo annuncio pubblicato ora
                                </p>
                              )}
                              <h2 className="text-[20px] font-extrabold text-[#1A1A1A] leading-snug">
                                {mansioneInfo.label}
                              </h2>
                              <p className="text-[17px] font-bold text-[#333333] flex items-center gap-1.5 mt-0.5">
                                <MapPin className="w-4 h-4 shrink-0" strokeWidth={2.5} />
                                <span>
                                  {ann.seniorName} · {ann.neighborhood}
                                </span>
                              </p>
                            </div>
                          </div>

                          {/* Structured Wireframe Details */}
                          <div className="border-t-2 border-[#1A1A1A] pt-3 space-y-2 text-[17px]">
                            <div className="flex items-start gap-2.5">
                              <UserCheck
                                className="w-5 h-5 shrink-0 mt-0.5 text-[#1A1A1A]"
                                strokeWidth={2.3}
                              />
                              <span>
                                <strong className="font-extrabold">Preferenza:</strong>{' '}
                                {ann.preferenza}
                              </span>
                            </div>
                            <div className="flex items-start gap-2.5">
                              <Calendar
                                className="w-5 h-5 shrink-0 mt-0.5 text-[#1A1A1A]"
                                strokeWidth={2.3}
                              />
                              <span>
                                <strong className="font-extrabold">Giorni:</strong>{' '}
                                {ann.days.join(', ')}
                              </span>
                            </div>
                            <div className="flex items-start gap-2.5">
                              <Clock
                                className="w-5 h-5 shrink-0 mt-0.5 text-[#1A1A1A]"
                                strokeWidth={2.3}
                              />
                              <span>
                                <strong className="font-extrabold">Orari:</strong>{' '}
                                {ann.timeSlots.join(' · ')}
                              </span>
                            </div>
                            <div className="flex items-start gap-2.5">
                              <Euro
                                className="w-5 h-5 shrink-0 mt-0.5 text-[#1A1A1A]"
                                strokeWidth={2.3}
                              />
                              <span>
                                <strong className="font-extrabold">Compenso:</strong>{' '}
                                <span className="font-extrabold text-[#003E9C]">
                                  {ann.retribuzione}
                                </span>
                              </span>
                            </div>
                          </div>

                          {/* Confirmed Response Summary if already replied */}
                          {ann.response && (
                            <div className="p-3 rounded-lg border-2 border-[#003E9C] bg-[#EBF2FF] text-[#1A1A1A]">
                              <p className="text-[16px] font-extrabold text-[#003E9C] flex items-center gap-2">
                                <CheckCircle2 className="w-5 h-5 shrink-0" strokeWidth={2.5} />
                                <span>Disponibilità confermata</span>
                              </p>
                              <p className="text-[16px] font-bold mt-1">
                                {ann.response.day} · {ann.response.timeSlot} (ore{' '}
                                {ann.response.exactHour})
                              </p>
                            </div>
                          )}

                          {/* Primary Card Action */}
                          <button
                            type="button"
                            onClick={() => handleOpenReplyPage(ann)}
                            className={`w-full min-h-[56px] px-4 py-3 rounded-xl border-2 border-[#1A1A1A] flex items-center justify-center gap-2 text-[18px] font-extrabold transition-colors cursor-pointer focus-visible:outline-4 focus-visible:outline-[#003E9C] focus-visible:outline-offset-2 ${
                              ann.response
                                ? 'bg-[#FFFFFF] text-[#1A1A1A] hover:bg-[#EFEFEF]'
                                : 'bg-[#003E9C] text-[#FFFFFF] hover:bg-[#002D73]'
                            }`}
                          >
                            <span>
                              {ann.response
                                ? 'MODIFICA DISPONIBILITÀ'
                                : "RISPONDI ALL'ANNUNCIO"}
                            </span>
                            <ArrowRight className="w-5 h-5 shrink-0" strokeWidth={2.8} />
                          </button>
                        </article>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ============================================================
                  FLUSSO GIOVANE — PAGINA 2: Concorda Giorno e Orario
              ============================================================ */}
              {viewMode === 'giovane' && giovanePage === 2 && activeAnnouncement && (
                <div className="space-y-6 pb-2">
                  {/* Page Header */}
                  <div className="border-b-2 border-[#1A1A1A] pb-3">
                    <div className="flex items-baseline justify-between gap-2">
                      <h1 className="text-[26px] font-extrabold tracking-tight text-[#1A1A1A] leading-tight">
                        Concorda Orario
                      </h1>
                      <span className="text-[15px] font-bold text-[#003E9C] tabular-nums whitespace-nowrap shrink-0">
                        Pagina 2 di 2
                      </span>
                    </div>
                    <div
                      aria-hidden="true"
                      className="grid grid-cols-2 gap-2 mt-2.5"
                    >
                      <div className="h-2.5 rounded-sm bg-[#003E9C] border border-[#1A1A1A]" />
                      <div className="h-2.5 rounded-sm bg-[#003E9C] border border-[#1A1A1A]" />
                    </div>
                  </div>

                  {/* Selected Announcement Summary Box */}
                  <div className="p-4 rounded-xl border-2 border-dashed border-[#1A1A1A] bg-[#FFFFFF]">
                    <p className="text-[14px] font-bold text-[#333333]">
                      Stai rispondendo a:
                    </p>
                    <p className="text-[20px] font-extrabold text-[#1A1A1A] mt-0.5">
                      {getMansioneInfo(activeAnnouncement.mansione).label}
                    </p>
                    <p className="text-[17px] font-bold text-[#333333] mt-1">
                      {activeAnnouncement.seniorName} · {activeAnnouncement.neighborhood}
                    </p>
                    <p className="text-[16px] font-extrabold text-[#003E9C] mt-1">
                      Compenso: {activeAnnouncement.retribuzione}
                    </p>
                  </div>

                  {giovaneError && (
                    <div
                      role="alert"
                      className="p-4 rounded-xl border-2 border-[#1A1A1A] bg-[#FFEAEA] text-[#1A1A1A] flex items-center gap-3"
                    >
                      <AlertCircle
                        className="w-6 h-6 shrink-0 text-[#990000]"
                        strokeWidth={2.5}
                      />
                      <p className="text-[17px] font-extrabold">{giovaneError}</p>
                    </div>
                  )}

                  {/* Step 1: Pick Available Day */}
                  <section aria-labelledby="sec-reply-day">
                    <h2
                      id="sec-reply-day"
                      className="text-[20px] font-extrabold text-[#1A1A1A] mb-3"
                    >
                      1. Scegli il giorno tra quelli disponibili
                    </h2>
                    <div className="grid grid-cols-3 gap-2.5">
                      {activeAnnouncement.days.map((day) => {
                        const isSelected = replyDay === day;
                        return (
                          <button
                            key={day}
                            type="button"
                            aria-pressed={isSelected}
                            onClick={() => {
                              setReplyDay(day);
                              setGiovaneError(null);
                            }}
                            className={`min-h-[60px] rounded-xl border-2 border-[#1A1A1A] flex flex-col items-center justify-center text-[19px] font-extrabold transition-colors cursor-pointer focus-visible:outline-4 focus-visible:outline-[#003E9C] focus-visible:outline-offset-2 ${
                              isSelected
                                ? 'bg-[#003E9C] text-[#FFFFFF]'
                                : 'bg-[#FFFFFF] text-[#1A1A1A] hover:bg-[#EFEFEF]'
                            }`}
                          >
                            <span>{day}</span>
                            {isSelected && (
                              <Check className="w-4 h-4 mt-0.5" strokeWidth={3} />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </section>

                  {/* Step 2: Pick Available Time Slot & Exact Hour */}
                  <section aria-labelledby="sec-reply-slot">
                    <h2
                      id="sec-reply-slot"
                      className="text-[20px] font-extrabold text-[#1A1A1A] mb-3"
                    >
                      2. Scegli la fascia e l&apos;ora esatta
                    </h2>
                    <div className="space-y-3">
                      {activeAnnouncement.timeSlots.map((slot) => {
                        const isSelected = replyTimeSlot === slot;
                        return (
                          <div
                            key={slot}
                            className={`rounded-xl border-2 border-[#1A1A1A] overflow-hidden ${
                              isSelected ? 'bg-[#EBF2FF]' : 'bg-[#FFFFFF]'
                            }`}
                          >
                            <button
                              type="button"
                              aria-pressed={isSelected}
                              onClick={() => handleSelectReplySlot(slot)}
                              className={`w-full min-h-[58px] px-4 py-3 flex items-center justify-between text-[18px] font-extrabold transition-colors cursor-pointer focus-visible:outline-4 focus-visible:outline-[#003E9C] ${
                                isSelected
                                  ? 'bg-[#003E9C] text-[#FFFFFF]'
                                  : 'bg-[#FFFFFF] text-[#1A1A1A] hover:bg-[#EFEFEF]'
                              }`}
                            >
                              <span className="flex items-center gap-2.5">
                                <Clock className="w-5 h-5 shrink-0" strokeWidth={2.5} />
                                <span>{slot}</span>
                              </span>
                              {isSelected && (
                                <Check className="w-5 h-5 shrink-0" strokeWidth={3} />
                              )}
                            </button>

                            {isSelected && (
                              <div className="p-3 border-t-2 border-[#1A1A1A]">
                                <p className="text-[15px] font-bold text-[#1A1A1A] mb-2">
                                  Proponi orario di arrivo:
                                </p>
                                <div className="grid grid-cols-3 gap-2">
                                  {EXACT_HOURS_BY_SLOT[slot].map((hour) => {
                                    const isHourSelected = replyExactHour === hour;
                                    return (
                                      <button
                                        key={hour}
                                        type="button"
                                        aria-pressed={isHourSelected}
                                        onClick={() => setReplyExactHour(hour)}
                                        className={`min-h-[48px] rounded-lg border-2 border-[#1A1A1A] text-[17px] font-extrabold tabular-nums transition-colors cursor-pointer ${
                                          isHourSelected
                                            ? 'bg-[#1A1A1A] text-[#FFFFFF]'
                                            : 'bg-[#FFFFFF] text-[#1A1A1A] hover:bg-[#EFEFEF]'
                                        }`}
                                      >
                                        {hour}
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </section>

                  {/* Step 3: Short Message */}
                  <section aria-labelledby="sec-reply-msg">
                    <label
                      id="sec-reply-msg"
                      htmlFor="reply-message-input"
                      className="block text-[20px] font-extrabold text-[#1A1A1A] mb-2"
                    >
                      3. Scrivi un breve messaggio
                    </label>
                    <div className="relative">
                      <textarea
                        id="reply-message-input"
                        rows={3}
                        value={replyMessage}
                        onChange={(e) => setReplyMessage(e.target.value)}
                        placeholder="Es. Ciao, abito nella via accanto! Passo volentieri alle 10:30."
                        className="w-full min-h-[112px] p-3.5 rounded-xl border-2 border-[#1A1A1A] bg-[#FFFFFF] text-[18px] font-semibold text-[#1A1A1A] placeholder:text-[#595959] focus-visible:outline-4 focus-visible:outline-[#003E9C]"
                      />
                    </div>
                  </section>
                </div>
              )}
            </main>

            {/* ============================================================
                FIXED BOTTOM ACTION BAR (INSIDE IPHONE SAFE AREA)
            ============================================================ */}
            {viewMode === 'anziano' && anzianoPage === 1 && (
              <footer className="shrink-0 px-4 pt-3 pb-1 bg-[#FAFAFA] border-t-2 border-[#1A1A1A]">
                <button
                  type="button"
                  onClick={() => {
                    setAnzianoError(null);
                    setAnzianoPage(2);
                  }}
                  className="w-full min-h-[60px] px-5 py-3 rounded-xl border-2 border-[#1A1A1A] bg-[#003E9C] hover:bg-[#002D73] text-[#FFFFFF] text-[20px] font-extrabold flex items-center justify-center gap-3 transition-colors cursor-pointer focus-visible:outline-4 focus-visible:outline-[#003E9C] focus-visible:outline-offset-2"
                >
                  <span>AVANTI</span>
                  <ArrowRight className="w-6 h-6 shrink-0" strokeWidth={3} />
                </button>
              </footer>
            )}

            {viewMode === 'anziano' && anzianoPage === 2 && (
              <footer className="shrink-0 px-4 pt-3 pb-1 bg-[#FAFAFA] border-t-2 border-[#1A1A1A]">
                <div className="flex items-stretch gap-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      setAnzianoError(null);
                      setAnzianoPage(1);
                    }}
                    className="w-[40%] min-h-[60px] px-2.5 py-3 rounded-xl border-2 border-[#1A1A1A] bg-[#FFFFFF] hover:bg-[#EFEFEF] text-[#1A1A1A] text-[17px] font-extrabold flex items-center justify-center gap-1.5 transition-colors cursor-pointer focus-visible:outline-4 focus-visible:outline-[#003E9C] focus-visible:outline-offset-2"
                  >
                    <ArrowLeft className="w-5 h-5 shrink-0" strokeWidth={2.8} />
                    <span>INDIETRO</span>
                  </button>

                  <button
                    type="button"
                    onClick={handlePublishAnnouncement}
                    className="w-[60%] min-h-[60px] px-3 py-3 rounded-xl border-2 border-[#1A1A1A] bg-[#003E9C] hover:bg-[#002D73] text-[#FFFFFF] text-[17px] font-extrabold flex items-center justify-center text-center leading-tight transition-colors cursor-pointer focus-visible:outline-4 focus-visible:outline-[#003E9C] focus-visible:outline-offset-2"
                  >
                    PUBBLICA ANNUNCIO
                  </button>
                </div>
              </footer>
            )}

            {viewMode === 'giovane' && giovanePage === 2 && (
              <footer className="shrink-0 px-4 pt-3 pb-1 bg-[#FAFAFA] border-t-2 border-[#1A1A1A]">
                <div className="flex items-stretch gap-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      setGiovaneError(null);
                      setGiovanePage(1);
                    }}
                    className="w-[40%] min-h-[60px] px-2.5 py-3 rounded-xl border-2 border-[#1A1A1A] bg-[#FFFFFF] hover:bg-[#EFEFEF] text-[#1A1A1A] text-[17px] font-extrabold flex items-center justify-center gap-1.5 transition-colors cursor-pointer focus-visible:outline-4 focus-visible:outline-[#003E9C] focus-visible:outline-offset-2"
                  >
                    <ArrowLeft className="w-5 h-5 shrink-0" strokeWidth={2.8} />
                    <span>INDIETRO</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleConfirmReply}
                    className="w-[60%] min-h-[60px] px-3 py-3 rounded-xl border-2 border-[#1A1A1A] bg-[#003E9C] hover:bg-[#002D73] text-[#FFFFFF] text-[16px] font-extrabold flex items-center justify-center text-center leading-tight transition-colors cursor-pointer focus-visible:outline-4 focus-visible:outline-[#003E9C] focus-visible:outline-offset-2"
                  >
                    CONFERMA DISPONIBILITÀ
                  </button>
                </div>
              </footer>
            )}

            {/* iOS Home Indicator Bar */}
            <div
              aria-hidden="true"
              className="shrink-0 bg-[#FAFAFA] py-2 flex items-center justify-center"
            >
              <div className="w-[136px] h-[5px] bg-[#1A1A1A] rounded-full" />
            </div>

            {/* ============================================================
                WIREFRAME CONFIRMATION MODAL: ANNUNCIO PUBBLICATO (ANZIANO)
            ============================================================ */}
            {showPublishedModal && (
              <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="modal-published-title"
                className="absolute inset-0 z-30 bg-[#1A1A1A]/75 flex items-center justify-center p-5"
              >
                <div className="w-full bg-[#FAFAFA] border-2 border-[#1A1A1A] rounded-2xl p-5 space-y-5 shadow-2xl">
                  <div className="flex flex-col items-center text-center space-y-3">
                    <div className="w-16 h-16 rounded-2xl border-2 border-[#1A1A1A] bg-[#003E9C] text-[#FFFFFF] flex items-center justify-center">
                      <CheckCircle2 className="w-10 h-10" strokeWidth={2.5} />
                    </div>
                    <h2
                      id="modal-published-title"
                      className="text-[24px] font-extrabold text-[#1A1A1A] leading-tight"
                    >
                      Annuncio Pubblicato!
                    </h2>
                    <p className="text-[18px] font-semibold text-[#333333] leading-snug">
                      La tua richiesta è ora visibile ai giovani volontari e vicini
                      del quartiere.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl border-2 border-dashed border-[#1A1A1A] bg-[#FFFFFF] text-[17px] space-y-1">
                    <p className="font-extrabold text-[#1A1A1A]">
                      {selectedMansione
                        ? getMansioneInfo(selectedMansione).label
                        : ''}
                    </p>
                    <p className="font-semibold text-[#333333]">
                      {selectedDays.join(', ')} · {selectedTimeSlots.join(', ')}
                    </p>
                    <p className="font-extrabold text-[#003E9C]">
                      {selectedRetribuzione}
                    </p>
                  </div>

                  <div className="space-y-3">
                    <button
                      type="button"
                      onClick={() => {
                        setShowPublishedModal(false);
                        setViewMode('giovane');
                        setGiovanePage(1);
                      }}
                      className="w-full min-h-[58px] px-4 py-3 rounded-xl border-2 border-[#1A1A1A] bg-[#003E9C] hover:bg-[#002D73] text-[#FFFFFF] text-[18px] font-extrabold flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <span>Vedi in Vista Giovane</span>
                      <ArrowRight className="w-5 h-5" strokeWidth={2.8} />
                    </button>

                    <button
                      type="button"
                      onClick={handleResetSeniorForm}
                      className="w-full min-h-[56px] px-4 py-3 rounded-xl border-2 border-[#1A1A1A] bg-[#FFFFFF] hover:bg-[#EFEFEF] text-[#1A1A1A] text-[18px] font-extrabold cursor-pointer"
                    >
                      Crea un altro annuncio
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ============================================================
                WIREFRAME CONFIRMATION MODAL: DISPONIBILITÀ CONFERMATA (GIOVANE)
            ============================================================ */}
            {showReplyConfirmedModal && activeAnnouncement && (
              <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="modal-reply-title"
                className="absolute inset-0 z-30 bg-[#1A1A1A]/75 flex items-center justify-center p-5"
              >
                <div className="w-full bg-[#FAFAFA] border-2 border-[#1A1A1A] rounded-2xl p-5 space-y-5 shadow-2xl">
                  <div className="flex flex-col items-center text-center space-y-3">
                    <div className="w-16 h-16 rounded-2xl border-2 border-[#1A1A1A] bg-[#003E9C] text-[#FFFFFF] flex items-center justify-center">
                      <MessageSquare className="w-9 h-9" strokeWidth={2.5} />
                    </div>
                    <h2
                      id="modal-reply-title"
                      className="text-[24px] font-extrabold text-[#1A1A1A] leading-tight"
                    >
                      Disponibilità Inviata!
                    </h2>
                    <p className="text-[18px] font-semibold text-[#333333] leading-snug">
                      {activeAnnouncement.seniorName} riceverà la tua proposta di
                      orario.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl border-2 border-dashed border-[#1A1A1A] bg-[#FFFFFF] text-[17px] space-y-1">
                    <p className="font-extrabold text-[#1A1A1A]">
                      {replyDay} · ore {replyExactHour}
                    </p>
                    <p className="font-semibold text-[#333333]">{replyTimeSlot}</p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setShowReplyConfirmedModal(false);
                      setGiovanePage(1);
                    }}
                    className="w-full min-h-[58px] px-4 py-3 rounded-xl border-2 border-[#1A1A1A] bg-[#003E9C] hover:bg-[#002D73] text-[#FFFFFF] text-[18px] font-extrabold flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <ArrowLeft className="w-5 h-5" strokeWidth={2.8} />
                    <span>Torna alla Bacheca</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
