import React, { useEffect, useRef, useState } from 'react';
import { 
  MapPin, 
  Navigation, 
  Compass, 
  Search, 
  Star, 
  Sparkles, 
  Layers, 
  ArrowRight,
  ExternalLink,
  ChevronRight,
  Filter
} from 'lucide-react';

interface Place {
  id: string;
  name: string;
  region: string;
  lat: number;
  lng: number;
  category: 'Природа' | 'Горы' | 'Культура' | 'Архитектура';
  rating: number;
  description: string;
  image: string;
}

const places: Place[] = [
  {
    id: '1',
    name: 'Эльбрус и Кавказский хребет',
    region: 'Кавказ / КБР',
    lat: 43.3499,
    lng: 42.4453,
    category: 'Горы',
    rating: 4.9,
    description: 'Высочайшая вершина Европы (5642 м). Знаковые альпинистские маршруты и панорамы Кавказа.',
    image: 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: '2',
    name: 'Озеро Байкал',
    region: 'Иркутская область / Бурятия',
    lat: 53.5587,
    lng: 108.1650,
    category: 'Природа',
    rating: 5.0,
    description: 'Древнейшее и самое глубокое пресноводное озеро мира с кристально чистым льдом и скалами Ольхона.',
    image: 'https://images.unsplash.com/photo-1551845041-63e8e76836ea?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: '3',
    name: 'Казанский Кремль и Кул Шариф',
    region: 'Татарстан / Казань',
    lat: 55.7983,
    lng: 49.1051,
    category: 'Архитектура',
    rating: 4.8,
    description: 'Уникальный исторический ансамбль XVI-XXI веков на слиянии Волги и Казанки.',
    image: 'https://images.unsplash.com/photo-1513622470522-26c3c8a854bc?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: '4',
    name: 'Куртатинское ущелье (Фиагдон)',
    region: 'Северная Осетия — Алания',
    lat: 42.8450,
    lng: 44.3050,
    category: 'Горы',
    rating: 4.9,
    description: 'Древние сторожевые башни, Аланский монастырь и каньоны с высокогорными реками.',
    image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: '5',
    name: 'Петергоф и фонтаны',
    region: 'Санкт-Петербург',
    lat: 59.8837,
    lng: 29.9079,
    category: 'Культура',
    rating: 4.9,
    description: 'Всемирно известный дворцово-парковый ансамбль на берегу Финского залива.',
    image: 'https://images.unsplash.com/photo-1584448141569-69f342da535c?auto=format&fit=crop&w=600&q=80'
  }
];

export function App() {
  const mapRef = useRef<any>(null);
  const [selectedPlace, setSelectedPlace] = useState<Place>(places[0]);
  const [activeCategory, setActiveCategory] = useState<string>('Все');
  const [search, setSearch] = useState('');

  useEffect(() => {
    // Leaflet global initialization
    if (typeof window !== 'undefined' && (window as any).L && !mapRef.current) {
      const L = (window as any).L;
      const map = L.map('map', {
        center: [55.0, 55.0],
        zoom: 4,
        zoomControl: false
      });

      L.control.zoom({ position: 'bottomright' }).addTo(map);

      // Dark style tile layer from CartoDB
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap &copy; CARTO',
        subdomains: 'abcd',
        maxZoom: 19
      }).addTo(map);

      places.forEach(p => {
        const marker = L.circleMarker([p.lat, p.lng], {
          radius: 8,
          fillColor: '#3b82f6',
          color: '#ffffff',
          weight: 2,
          opacity: 1,
          fillOpacity: 0.9
        }).addTo(map);

        marker.bindPopup(`<b>${p.name}</b><br>${p.region}`);
        marker.on('click', () => {
          setSelectedPlace(p);
          map.flyTo([p.lat, p.lng], 7, { duration: 1.2 });
        });
      });

      mapRef.current = map;
    }
  }, []);

  const handleSelectPlace = (place: Place) => {
    setSelectedPlace(place);
    if (mapRef.current) {
      mapRef.current.flyTo([place.lat, place.lng], 8, { duration: 1.2 });
    }
  };

  const filtered = places.filter(p => {
    const matchesCat = activeCategory === 'Все' || p.category === activeCategory;
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.region.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="h-screen w-screen flex flex-col bg-zinc-950 text-zinc-100 font-sans overflow-hidden">
      {/* Header */}
      <header className="h-16 border-b border-zinc-800 bg-zinc-950/90 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between shrink-0 z-20">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-600/30">
            <Compass className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h1 className="font-extrabold text-base tracking-wider uppercase font-mono leading-tight">
              GEOGID<span className="text-blue-500">.</span>
            </h1>
            <p className="text-[10px] text-zinc-400 font-mono tracking-widest uppercase">
              Интерактивный навигатор по России
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 hidden sm:inline-block">
            Карта РФ онлайн
          </span>
          <a
            href="https://github.com/phaxdev/geogid"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-1.5 rounded-xl border border-zinc-700 bg-zinc-900 text-xs font-mono text-zinc-200 hover:text-white hover:border-zinc-500 transition-colors flex items-center gap-1.5"
          >
            <span>GitHub</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </header>

      {/* Main Workspace */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        {/* Left Sidebar */}
        <aside className="w-full md:w-96 border-r border-zinc-800 bg-zinc-950/95 flex flex-col shrink-0 z-10 md:h-full max-h-[45vh] md:max-h-full">
          {/* Search & Categories */}
          <div className="p-4 border-b border-zinc-800/80 space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Поиск локаций и регионов..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-200 outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 hide-scrollbar">
              {['Все', 'Горы', 'Природа', 'Культура', 'Архитектура'].map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-3 py-1 rounded-lg text-[11px] font-medium whitespace-nowrap transition-all ${
                    activeCategory === cat
                      ? 'bg-blue-600 text-white'
                      : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Places List */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
            {filtered.map(p => {
              const isSelected = selectedPlace.id === p.id;
              return (
                <div
                  key={p.id}
                  onClick={() => handleSelectPlace(p)}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between gap-3 ${
                    isSelected
                      ? 'bg-blue-600/15 border-blue-500 shadow-md shadow-blue-500/10'
                      : 'bg-zinc-900/40 border-zinc-800/60 hover:border-zinc-700'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-zinc-100">{p.name}</span>
                    </div>
                    <div className="text-[11px] text-zinc-400 flex items-center gap-1 font-mono">
                      <MapPin className="w-3 h-3 text-blue-400" />
                      <span>{p.region}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] font-mono font-semibold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20 shrink-0">
                    <Star className="w-3 h-3 fill-amber-400" />
                    <span>{p.rating}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Selected Place Detail Footer */}
          {selectedPlace && (
            <div className="p-4 border-t border-zinc-800 bg-zinc-900/40">
              <div className="flex items-start justify-between gap-2 mb-2">
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-blue-500/15 text-blue-400 border border-blue-500/20">
                  {selectedPlace.category}
                </span>
                <span className="text-xs text-zinc-400 font-mono">
                  {selectedPlace.lat.toFixed(2)}° N, {selectedPlace.lng.toFixed(2)}° E
                </span>
              </div>
              <h4 className="text-sm font-bold text-white mb-1">{selectedPlace.name}</h4>
              <p className="text-xs text-zinc-400 leading-relaxed mb-3 line-clamp-2">
                {selectedPlace.description}
              </p>
              <button
                onClick={() => handleSelectPlace(selectedPlace)}
                className="w-full py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shadow-blue-600/20"
              >
                <Navigation className="w-3.5 h-3.5" />
                <span>Приблизить на карте</span>
              </button>
            </div>
          )}
        </aside>

        {/* Map Container */}
        <div className="flex-1 h-full w-full relative">
          <div id="map" className="w-full h-full" />
        </div>
      </div>
    </div>
  );
}

export default App;
