import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
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
  ZoomIn,
  ZoomOut
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
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const [selectedPlace, setSelectedPlace] = useState<Place>(places[0]);
  const [activeCategory, setActiveCategory] = useState<string>('Все');
  const [search, setSearch] = useState('');
  const [mapStyle, setMapStyle] = useState<'carto' | 'satellite' | 'osm'>('carto');

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Create Map
    const map = L.map(mapContainerRef.current, {
      center: [55.0, 60.0],
      zoom: 4,
      zoomControl: false,
    });

    // Default Tile Layer
    const tileUrl = 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png';
    const tileLayer = L.tileLayer(tileUrl, {
      subdomains: 'abcd',
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap &copy; CARTO'
    }).addTo(map);

    tileLayerRef.current = tileLayer;

    // Markers
    places.forEach((p) => {
      const pinIcon = L.divIcon({
        className: 'custom-geo-pin',
        html: `
          <div style="
            width: 32px;
            height: 32px;
            background: #f59e0b;
            border: 2px solid #ffffff;
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 12px rgba(245, 158, 11, 0.5);
            cursor: pointer;
          ">
            <div style="
              width: 10px;
              height: 10px;
              background: #0f172a;
              border-radius: 50%;
            "></div>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32]
      });

      const marker = L.marker([p.lat, p.lng], { icon: pinIcon }).addTo(map);
      marker.bindPopup(`
        <div style="color: #0f172a; font-family: sans-serif; padding: 4px;">
          <b style="font-size: 13px;">${p.name}</b><br/>
          <span style="font-size: 11px; color: #64748b;">${p.region}</span>
        </div>
      `);

      marker.on('click', () => {
        setSelectedPlace(p);
        map.flyTo([p.lat, p.lng], 8, { duration: 1.2 });
      });
    });

    mapInstanceRef.current = map;

    // Force map to recalculate container size
    setTimeout(() => {
      map.invalidateSize();
    }, 250);

    const handleResize = () => map.invalidateSize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update map layer on toggle
  useEffect(() => {
    if (!mapInstanceRef.current || !tileLayerRef.current) return;

    mapInstanceRef.current.removeLayer(tileLayerRef.current);

    let url = 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png';
    let subdomains = 'abcd';

    if (mapStyle === 'satellite') {
      url = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
      subdomains = 'abc';
    } else if (mapStyle === 'osm') {
      url = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
      subdomains = 'abc';
    }

    const newLayer = L.tileLayer(url, {
      subdomains,
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap'
    }).addTo(mapInstanceRef.current);

    tileLayerRef.current = newLayer;
  }, [mapStyle]);

  const handleSelectPlace = (place: Place) => {
    setSelectedPlace(place);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([place.lat, place.lng], 8, { duration: 1.2 });
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
                Экспедиции РФ
              </span>
            </div>
            <p className="text-[10px] text-zinc-400 font-mono tracking-wider">
              Цифровой путеводитель & гео-навигатор природных чудес
            </p>
          </div>
        </div>

        {/* Map Layer Switcher & Link */}
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center p-1 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-mono">
            <button
              onClick={() => setMapStyle('carto')}
              className={`px-2.5 py-1 rounded-lg transition-all ${mapStyle === 'carto' ? 'bg-amber-500 text-zinc-950 font-bold' : 'text-zinc-400 hover:text-white'}`}
            >
              Схема
            </button>
            <button
              onClick={() => setMapStyle('satellite')}
              className={`px-2.5 py-1 rounded-lg transition-all ${mapStyle === 'satellite' ? 'bg-amber-500 text-zinc-950 font-bold' : 'text-zinc-400 hover:text-white'}`}
            >
              Спутник
            </button>
            <button
              onClick={() => setMapStyle('osm')}
              className={`px-2.5 py-1 rounded-lg transition-all ${mapStyle === 'osm' ? 'bg-amber-500 text-zinc-950 font-bold' : 'text-zinc-400 hover:text-white'}`}
            >
              OSM
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

      {/* Main Workspace */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        {/* Left Sidebar */}
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
                <span>Приблизить на карте</span>
              </button>
            </div>
          )}
        </aside>

        {/* Map Area */}
        <div className="flex-1 h-full w-full relative min-h-[300px]">
          <div ref={mapContainerRef} className="absolute inset-0 w-full h-full" />

          {/* Floating Topo HUD Overlay */}
          <div className="absolute top-4 left-4 z-[400] hidden sm:flex items-center gap-3 p-3 rounded-2xl bg-[#0c1015]/90 border border-[#1e293b] backdrop-blur-md shadow-2xl">
            <div className="flex items-center gap-2 font-mono text-xs">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-zinc-300">GPS Карта активна</span>
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
