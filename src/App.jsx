import { useEffect, useState, useMemo } from 'react';
import Data from "./data.json";
import { format, isSameYear, formatDistanceToNow, isSameMonth, isSameWeek, isSameDay, addDays, addWeeks, addMonths, addYears } from 'date-fns';
import { useSwipeable } from 'react-swipeable';
import { Search } from './Search';
import './App.css';

const Scopes = [
  { name: "year", maxValue: 0, minValue: 3 },
  { name: "month", maxValue: 4, minValue: 6 },
  { name: "week", maxValue: 7, minValue: 9 },
  { name: "day", maxValue: 10, minValue: 12 },
];

const CategoryNames = {
  ALL: "all",
  CREATIVE: "creative",
  HEALTH: "health",
  HOUSEHOLD: "household",
  FAMILY: "family",
  FRIENDS: "friends",
  WIFE: "wife",
  AVOID: "avoid",
}

const CategoryColors = {
  creative: "text-orange-500",
  health: "text-green-500",
  household: "text-yellow-500",
  family: "text-red-500",
  friends: "text-blue-500",
  wife: "text-pink-500",
  avoid: "text-gray-500",
}

const MonthNotes = {
  "2025-11": "Ramat Gan + Unemployed",
  "2025-10": "Bus Bakerem + Move to Ramat Gan",
  "2025-09": "Wife Birthday Plan",
  "2025-08": "Portugal",
  "2025-07": "War + Bar Zakai",
  "2025-06": "Birthday + Villa + Midbara",
  "2025-05": "Lokit",
  "2025-04": "Passover + Sick",
  "2025-03": "20% CSS week",
  "2025-02": "First Baby Attempts",
  "2025-01": "Thailand",
}


const MIN_SCROLL_AMOUNT = 0;
const MAX_SCROLL_AMOUNT = 12;

function App() {
  const [scrollAmount, setScrollAmount] = useState(MIN_SCROLL_AMOUNT);
  const [dateOffset, setDateOffset] = useState(0);
  const [category, setCategory] = useState(CategoryNames.ALL);
  const [searchTerm, setSearchTerm] = useState("");

  const scope = useMemo(() =>
    Scopes.find(scope =>
      scope.maxValue <= scrollAmount &&
      scope.minValue >= scrollAmount),
    [scrollAmount]
  );

  // Function to handle scroll amount changes (used by both wheel and swipe)
  const handleScrollChange = useMemo(() => {
    return (direction, isSwipe = false) => {
      const currentScope = Scopes.find(scope =>
        scope.maxValue <= scrollAmount &&
        scope.minValue >= scrollAmount);
      const currentScopeName = currentScope?.name;

      setScrollAmount(prevScroll => {
        const nextScroll = prevScroll + (isSwipe ? 4 : 1) * Math.sign(direction);
        const clampedScroll = Math.max(MIN_SCROLL_AMOUNT, Math.min(MAX_SCROLL_AMOUNT, nextScroll));
        const nextScope = Scopes.find(scope =>
          scope.maxValue <= clampedScroll &&
          scope.minValue >= clampedScroll);
        const nextScopeName = nextScope?.name;

        if (currentScopeName !== nextScopeName) {
          setDateOffset(0);
        }
        return clampedScroll;
      });
    };
  }, [scrollAmount]);

  useEffect(() => {
    const handleKeyDown = event => {
      if (!scope?.name) return;

      if (event.key === 'ArrowLeft') {
        setDateOffset(prev => prev - 1);
      } else if (event.key === 'ArrowRight') {
        setDateOffset(prev => prev + 1);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [scope]);

  const currentDate = useMemo(() => {
    if (!scope?.name) return new Date();
    const now = new Date();
    switch (scope.name) {
      case 'year':
        return addYears(now, dateOffset);
      case 'month':
        return addMonths(now, dateOffset);
      case 'week':
        return addWeeks(now, dateOffset);
      case 'day':
        return addDays(now, dateOffset);
      default:
        return now;
    }
  }, [scope, dateOffset]);

  const currentFrame = useMemo(() => {
    if (!scope?.name) return '';
    switch (scope.name) {
      case 'year':
        return format(currentDate, 'yyyy');
      case 'month':
        return format(currentDate, 'MMM');
      case 'week':
        return format(currentDate, 'w');
      case 'day':
        return format(currentDate, 'EEE, MMM d');
      default:
        return '';
    }
  }, [scope, currentDate]);

  const filteredData = useMemo(() => {
    if (!scope?.name) return [];

    const dateComparators = {
      year: (itemDate) => isSameYear(itemDate, currentDate),
      month: (itemDate) => isSameMonth(itemDate, currentDate),
      week: (itemDate) => isSameWeek(itemDate, currentDate),
      day: (itemDate) => isSameDay(itemDate, currentDate),
    };

    const comparator = dateComparators[scope.name];
    if (!comparator) return [];

    return Data.filter(item => {
      const itemDate = new Date(item.date);
      return comparator(itemDate);
    })
      .filter(item => {
        if (searchTerm) {
          const search = searchTerm.trim();
          const regex = new RegExp(search, 'i');
          return (
            regex.test(item.name) ||
            regex.test(item.category) ||
            regex.test(item.subcategory) ||
            regex.test(item.location)
          );
        } else {
          return true;
        }
      })
      .filter(item => category === CategoryNames.ALL || item.category === category)
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [scope, currentDate, category, searchTerm]);

  // Swipe handlers for touch support
  const swipeHandlers = useSwipeable({
    preventDefaultTouchmoveEvent: true,
    trackMouse: false,
    onSwipedLeft: () => {
      if (!scope?.name) return;
      setDateOffset(prev => prev - 1);
    },
    onSwipedRight: () => {
      if (!scope?.name) return;
      setDateOffset(prev => prev + 1);
    },
  });

  return (
    <section className="space-y-4 p-4 w-screen overflow-hidden flex flex-col justify-between">
      <div className='space-y-4'>
        <ul className='flex items-start flex-wrap 
      gap-2 overflow-y-auto space-grotesk-400'>
          {filteredData.map(item =>
            <li
              key={item.date + item.name}
              className={`px-2 py-1 text-center font-bold text-sm grow-0
               border-b-2 ${CategoryColors[item.category.toLowerCase()]}`}>
              {item.name}, {formatDistanceToNow(item.date, { addSuffix: false })}
            </li>)}
        </ul>
      </div>
      <div className='space-y-4 border-4 rounded-md shadow-xl'>
        <h2 className='text-left font-bold merriweather-900'>
          {scope?.name.toUpperCase()} - {currentFrame} - {MonthNotes[format(currentDate, 'yyyy-MM')]}
        </h2>
        <Search value={searchTerm} onInputChange={setSearchTerm} />
        <div className='flex border w-full flex-wrap items-center gap-4'>
          {Object
          .values(CategoryNames)
          .map(categoryName => 
            <button
              className=""
              onClick={() => setCategory(categoryName)}
            >
              {categoryName.toUpperCase()}
            </button>
          )}
        </div>
        <div className="flex gap-4">
            <button onClick={() => {
            handleScrollChange(-1, true);
          }}>
            ⬆️
          </button>
          <button onClick={() => {
            handleScrollChange(1, true);
          }}>
            ⬇️
          </button>
             <button onClick={() => {
            if (!scope?.name) return;
      setDateOffset(prev => prev + 1);
          }}>
            ➡️
          </button>
          <button onClick={() => {
if (!scope?.name) return;
      setDateOffset(prev => prev - 1);
          }}>
            ⬅️
          </button>
          </div>
      </div>
    </section>
  )
}

export default App
