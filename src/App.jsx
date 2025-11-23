import { useEffect, useState, useMemo, useCallback } from 'react';
import Data from "./data.json";
import { format, isSameYear, isSameMonth, isSameWeek, isSameDay, addDays, addWeeks, addMonths, addYears } from 'date-fns';
import { Search } from './Search';
import { CategoryColors, CategoryNames, MonthNotes, Scopes } from './constants';
// import { useSwipeable } from 'react-swipeable';
import { BlocksList } from "./BlocksList";
import { CategoryButtons } from './CategoryButtons';
import { NavigationButtons } from './NavigationButtons';
import { DailyQuotes } from './DailyQuotes';

function App() {
  const [scopeIndex, setScopeIndex] = useState(2);
  const [dateOffset, setDateOffset] = useState(0);
  const [category, setCategory] = useState(CategoryNames.All.name);
  const [searchTerm, setSearchTerm] = useState("");

  const scope = useMemo(() => Scopes[scopeIndex], [scopeIndex]);

  const handleScopeChange = useCallback((direction) => {
    setScopeIndex(prevIndex => {
      const nextIndex = Math.max(0, Math.min(Scopes.length - 1, prevIndex + direction));
      if (nextIndex !== prevIndex) {
        setDateOffset(0);
      }
      return nextIndex;
    });
  }, []);

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
      .filter(item => category === CategoryNames.All.name || item.category === category)
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [scope, currentDate, category, searchTerm]);

  // Swipe handlers for touch support
  // const swipeHandlers = useSwipeable({
  //   preventDefaultTouchmoveEvent: true,
  //   trackMouse: false,
  //   onSwipedLeft: () => {
  //     if (!scope?.name) return;
  //     setDateOffset(prev => prev - 1);
  //   },
  //   onSwipedRight: () => {
  //     if (!scope?.name) return;
  //     setDateOffset(prev => prev + 1);
  //   },
  // });

  return (
    <section className="w-screen">
      <div className='p-4 space-y-4'>
        <h1 className='text-left font-bold text-lg merriweather-900'>
          {currentFrame} - {MonthNotes[format(currentDate, 'yyyy-MM')]}
        </h1>
        <div className="h-[60vh] overflow-y-auto space-y-8">
          <BlocksList data={filteredData} />
          <DailyQuotes />
        </div>
      </div>
      <div className='m-2 p-4 space-y-4 border border-gray-200 shadow-xl rounded-3xl'>
        <CategoryButtons
          selectedCategory={category}
          onCategoryClick={setCategory} />
        <Search value={searchTerm} onInputChange={setSearchTerm} />
        <NavigationButtons
          scope={scope}
          onNavigateUp={() => handleScopeChange(-1)}
          onNavigateDown={() => handleScopeChange(1)}
          onNavigateLeft={() => setDateOffset(prev => prev + 1)}
          onNavigateRight={() => setDateOffset(prev => prev - 1)} />
      </div>
    </section>
  )
}

export default App
