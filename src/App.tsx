import React, { useEffect, useRef, useState } from 'react';
import { 
  MapPin, 
  Navigation, 
  Compass, 
  Search, 
  Star, 
  Mountain, 
  ExternalLink,
  Layers,
  Map as MapIcon,
  Globe2,
  TrendingUp,
  RefreshCw,
  Sparkles
} from 'lucide-react';

interface Place {
  id: string;
  name: string;
  region: string;
  lat: number;
  lng: number;
  category: 'Горы' | 'Озёра' | 'Каньоны' | 'Культура';
  elevation: string;
  difficulty: 'Легкий' | 'Средний' | 'Экспедиция';
  duration: string;
  bestSeason: string;
  rating: number;
  description: string;
  image: string;
  highlights: string[];
}

const places: Place[] = [
  {
    id: '1',
    name: 'Гора Эльбрус & Приэльбрусье',
    region: 'Кабардино-Балкария',
    lat: 43.3499,
    lng: 42.4453,
    category: 'Горы',
    elevation: '5 642 м',
    difficulty: 'Экспедиция',
    duration: '7-9 дней',
    bestSeason: 'Июль - Август',
    rating: 5.0,
    description: 'Двуглавый спящий вулкан и высшая точка России и Европы. Ледники, высокогорные приюты и марсианские вулканические ландшафты.',
    image: 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=800&q=80',
    highlights: ['Канатная дорога до Гарабаши', 'Ледник Малый Азау', 'Панорама Главного Кавказского хребта']
  },
  {
    id: '2',
    name: 'Озеро Байкал & Остров Ольхон',
    region: 'Иркутская область / Бурятия',
    lat: 53.1587,
    lng: 107.4650,
    category: 'Озёра',
    elevation: '456 м',
    difficulty: 'Легкий',
    duration: '3-5 дней',
    bestSeason: 'Февраль (лёд) / Июль',
    rating: 4.9,
    description: 'Глубочайшее озеро планеты с 20% мировых запасов пресной воды. Сакральная скала Шаманка, гроты и знаменитый байкальский прозрачный лёд.',
    image: 'https://images.unsplash.com/photo-1551845041-63e8e76836ea?auto=format&fit=crop&w=800&q=80',
    highlights: ['Скала Шаманка', 'Мыс Хобой', 'Ледяные торосы и гроты']
  },
  {
    id: '3',
    name: 'Сулакский Каньон',
    region: 'Республика Дагестан',
    lat: 43.0187,
    lng: 46.8283,
    category: 'Каньоны',
    elevation: '1 920 м (глубина)',
    difficulty: 'Средний',
    duration: '1-2 дня',
    bestSeason: 'Май - Октябрь',
    rating: 4.9,
    description: 'Один из глубочайших каньонов в мире (глубже Гранд-Каньона в США). Бирюзовые воды реки Сулак и головокружительные смотровые площадки Дубки.',
    image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
    highlights: ['Прогулка на катере по каньону', 'Смотровая площадка Дубки', 'Чиркейская ГЭС']
  },
  {
    id: '4',
    name: 'Куртатинское ущелье & Даргавс',
    region: 'Северная Осетия — Алания',
    lat: 42.8450,
    lng: 44.3050,
    category: 'Горы',
    elevation: '1 400 м',
    difficulty: 'Легкий',
    duration: '1-2 дня',
    bestSeason: 'Круглый год',
    rating: 5.0,
    description: 'Сердце горной Осетии. Средневековый некрополь Даргавс («Город мёртвых»), древние фамильные башни Курта и Тага, скальная крепость Дзивгис.',
    image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80',
    highlights: ['Некрополь Даргавс', 'Башня Курта и Тага', 'Кадаргаванский каньон']
  },
  {
    id: '5',
    name: 'Вулкан Ключевская Сопка',
    region: 'Камчатский край',
    lat: 56.0572,
    lng: 160.6417,
    category: 'Горы',
    elevation: '4 750 м',
    difficulty: 'Экспедиция',
    duration: '10-14 дней',
    bestSeason: 'Июль - Август',
    rating: 4.8,
    description: 'Самый высокий действующий вулкан Евразии. Дикая камчатская тайга, термальные источники и лавовые поля.',
    image: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=800&q=80',
    highlights: ['Лавовые поля Толбачика', 'Мёртвый лес', 'Долина гейзеров']
  }
];

export function App() {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const placemarksRef = useRef<{ [key: string]: any }>({});
  const [selectedPlace, setSelectedPlace] = useState<Place>(places[0]);
  const [activeCategory, setActiveCategory] = useState<string>('Все');
  const [search, setSearch] = useState('');
  const [mapType, setMapType] = useState<'map' | 'satellite' | 'hybrid'>('map');
  const [mapLoaded, setMapLoaded] = useState(false);

  // Initialize Yandex Maps
  useEffect(() => {
    let checkInterval: any = null;

    const initYmaps = () => {
      const ymaps = (window as any).ymaps;
      if (!ymaps) return;

      ymaps.ready(() => {
        if (!mapContainerRef.current || mapInstanceRef.current) return;

        try {
          const map = new ymaps.Map(
            mapContainerRef.current,
            {
              center: [places[0].lat, places[0].lng],
              zoom: 6,
              type: 'yandex#map',
              controls: ['zoomControl', 'fullscreenControl']
            },
            {
              suppressMapOpenBlock: true
            }
          );

          // Add Placemarks for each place
          places.forEach((p) => {
            const placemark = new ymaps.Placemark(
              [p.lat, p.lng],
              {
                balloonContentHeader: `<div style="font-size:14px;font-weight:bold;color:#0f172a;">${p.name}</div>`,
                balloonContentBody: `
                  <div style="font-size:12px;color:#334155;margin:4px 0;">
                    <b>Регион:</b> ${p.region}<br/>
                    <b>Высота:</b> ${p.elevation}<br/>
                    <p style="margin-top:6px;line-height:1.4;">${p.description}</p>
                  </div>
                `,
                balloonContentFooter: `<div style="font-size:11px;color:#64748b;font-weight:600;">GEOGID Экспедиция</div>`,
                hintContent: p.name
              },
              {
                preset: 'islands#darkOrangeDotIconWithCaption',
                iconColor: '#f59e0b'
              }
            );

            placemark.events.add('click', () => {
              setSelectedPlace(p);
              map.panTo([p.lat, p.lng], { flying: true, duration: 1200 });
            });

            map.geoObjects.add(placemark);
            placemarksRef.current[p.id] = placemark;
          });

          mapInstanceRef.current = map;
          setMapLoaded(true);

          // Auto-resize
          setTimeout(() => {
            map.container.fitToViewport();
          }, 300);
        } catch (err) {
          console.error('Yandex Maps init error:', err);
        }
      });
    };

    if ((window as any).ymaps) {
      initYmaps();
    } else {
      checkInterval = setInterval(() => {
        if ((window as any).ymaps) {
          clearInterval(checkInterval);
          initYmaps();
        }
      }, 300);
    }

    return () => {
      if (checkInterval) clearInterval(checkInterval);
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.destroy();
          mapInstanceRef.current = null;
        } catch (e) {}
      }
    };
  }, []);

  // Handle Map Type Change
  const changeMapType = (type: 'map' | 'satellite' | 'hybrid') => {
    setMapType(type);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setType(`yandex#${type}`);
    }
  };

  // Fly to selected place
  const handleSelectPlace = (place: Place) => {
    setSelectedPlace(place);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.panTo([place.lat, place.lng], { flying: true, duration: 1200 });
      mapInstanceRef.current.setZoom(8, { duration: 800 });

      const placemark = placemarksRef.current[place.id];
      if (placemark) {
        placemark.balloon.open();
      }
    }
  };

  const filtered = places.filter(p => {
    const matchesCat = activeCategory === 'Все' || p.category === activeCategory;
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.region.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="h-screen w-screen flex flex-col bg-[#0c1015] text-[#e2e8f0] font-sans overflow-hidden">
      {/* Top Bar */}
      <header className="h-16 border-b border-[#1e293b] bg-[#0c1015]/95 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between shrink-0 z-20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-lg shadow-amber-500/10">
            <Compass className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base tracking-widest uppercase font-mono text-white">
                GEOGID<span className="text-amber-500">.RU</span>
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-amber-500/10 text-amber-400 border border-amber-500/30">
                Яндекс Карты
              </span>
            </div>
            <p className="text-[10px] text-zinc-400 font-mono tracking-wider">
              Высокоточные карты и спутниковые снимки РФ
            </p>
          </div>
        </div>

        {/* Yandex Map Type Switcher */}
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center p-1 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-mono">
            <button
              onClick={() => changeMapType('map')}
              className={`px-3 py-1 rounded-lg transition-all ${mapType === 'map' ? 'bg-amber-500 text-zinc-950 font-bold' : 'text-zinc-400 hover:text-white'}`}
            >
              Схема
            </button>
            <button
              onClick={() => changeMapType('satellite')}
              className={`px-3 py-1 rounded-lg transition-all ${mapType === 'satellite' ? 'bg-amber-500 text-zinc-950 font-bold' : 'text-zinc-400 hover:text-white'}`}
            >
              Спутник
            </button>
            <button
              onClick={() => changeMapType('hybrid')}
              className={`px-3 py-1 rounded-lg transition-all ${mapType === 'hybrid' ? 'bg-amber-500 text-zinc-950 font-bold' : 'text-zinc-400 hover:text-white'}`}
            >
              Гибрид
            </button>
          </div>

          <a
            href="https://github.com/phaxdev/geogid"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-bold font-mono uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-md shadow-amber-500/20"
          >
            <span>GitHub</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        {/* Left Expedition Sidebar */}
        <aside className="w-full md:w-[420px] border-r border-[#1e293b] bg-[#0c1015]/95 flex flex-col shrink-0 z-10 md:h-full max-h-[48vh] md:max-h-full">
          {/* Search & Categories */}
          <div className="p-4 border-b border-zinc-800 space-y-3 bg-[#0f141c]">
            <div className="relative">
              <Search className="w-4 h-4 text-amber-500/70 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Поиск по горам, озерам, регионам..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-[#141b24] border border-[#243042] text-xs text-zinc-200 outline-none focus:border-amber-500 transition-colors"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 hide-scrollbar">
              {['Все', 'Горы', 'Озёра', 'Каньоны'].map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-3 py-1 rounded-lg text-xs font-mono tracking-wider uppercase transition-all ${
                    activeCategory === cat
                      ? 'bg-amber-500 text-zinc-950 font-bold shadow-sm'
                      : 'bg-[#141b24] text-zinc-400 hover:text-zinc-200 border border-[#243042]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Place Cards List */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {filtered.map(p => {
              const isSelected = selectedPlace.id === p.id;
              return (
                <div
                  key={p.id}
                  onClick={() => handleSelectPlace(p)}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-start gap-3.5 ${
                    isSelected
                      ? 'bg-amber-500/10 border-amber-500/80 shadow-lg shadow-amber-500/5'
                      : 'bg-[#101620] border-[#1e293b] hover:border-[#334155]'
                  }`}
                >
                  <img
                    src={p.image}
                    alt={p.name}
                    className="w-20 h-20 rounded-xl object-cover shrink-0 border border-zinc-700/60"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-amber-500/15 text-amber-400 border border-amber-500/30">
                        {p.category}
                      </span>
                      <div className="flex items-center gap-1 text-[11px] font-mono text-amber-400">
                        <Star className="w-3 h-3 fill-amber-400" />
                        <span>{p.rating}</span>
                      </div>
                    </div>

                    <h3 className="text-xs font-bold text-white truncate">{p.name}</h3>
                    <p className="text-[11px] text-zinc-400 flex items-center gap-1 font-mono mt-0.5 truncate">
                      <MapPin className="w-3 h-3 text-amber-400 shrink-0" />
                      <span>{p.region}</span>
                    </p>

                    <div className="flex items-center gap-3 mt-2 text-[10px] font-mono text-zinc-400">
                      <span>{p.elevation}</span>
                      <span>•</span>
                      <span className="text-emerald-400">{p.difficulty}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Selected Place Detail Explorer Card */}
          {selectedPlace && (
            <div className="p-4 border-t border-[#1e293b] bg-[#0f141c]">
              <div className="flex items-center justify-between text-xs font-mono text-amber-400 mb-2">
                <span className="flex items-center gap-1">
                  <Mountain className="w-3.5 h-3.5" />
                  {selectedPlace.elevation}
                </span>
                <span className="text-zinc-400">Сезон: {selectedPlace.bestSeason}</span>
              </div>
              <h4 className="text-sm font-bold text-white mb-1.5">{selectedPlace.name}</h4>
              <p className="text-xs text-zinc-400 leading-relaxed mb-3 line-clamp-2">
                {selectedPlace.description}
              </p>

              <button
                onClick={() => handleSelectPlace(selectedPlace)}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-zinc-950 font-bold font-mono text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg shadow-amber-500/20"
              >
                <Navigation className="w-4 h-4" />
                <span>Найти на Яндекс Картах</span>
              </button>
            </div>
          )}
        </aside>

        {/* Map Area */}
        <div className="flex-1 h-full w-full relative min-h-[300px] bg-[#1a1d24]">
          <div ref={mapContainerRef} className="absolute inset-0 w-full h-full" />

          {/* Floating HUD */}
          <div className="absolute top-4 left-4 z-[400] hidden sm:flex items-center gap-3 p-3 rounded-2xl bg-[#0c1015]/90 border border-[#1e293b] backdrop-blur-md shadow-2xl">
            <div className="flex items-center gap-2 font-mono text-xs">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-zinc-300">Яндекс Карты онлайн</span>
            </div>
            <div className="h-4 w-px bg-zinc-800" />
            <div className="text-xs font-mono text-amber-400">
              {selectedPlace.lat.toFixed(4)}°N, {selectedPlace.lng.toFixed(4)}°E
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
