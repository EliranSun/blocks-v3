import { useEffect, useState, useMemo } from 'react';
import Data from "./data.json";
import { format, isSameYear, isSameMonth, isSameWeek, isSameDay, addDays, addWeeks, addMonths, addYears } from 'date-fns';
import { useSwipeable } from 'react-swipeable';
import './App.css';

const Scopes = [
  { name: "year", maxValue: 0, minValue: 3 },
  { name: "month", maxValue: 4, minValue: 6 },
  { name: "week", maxValue: 7, minValue: 9 },
  { name: "day", maxValue: 10, minValue: 12 },
];

const CategoryColors = {
  creative: "text-orange-500",
  health: "text-green-500",
  household: "text-yellow-500",
  family: "text-red-500",
  friends: "text-blue-500",
  wife: "text-pink-500",
  avoid: "text-gray-500",
}


const MIN_SCROLL_AMOUNT = 0;
const MAX_SCROLL_AMOUNT = 12;

function App() {
  const [scrollAmount, setScrollAmount] = useState(MIN_SCROLL_AMOUNT);
  const [dateOffset, setDateOffset] = useState(0);

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
    const handleWheel = event => {
      const direction = event.deltaY;
      console.log(direction);
      handleScrollChange(direction);
    };

    window.addEventListener("wheel", handleWheel);
    return () => {
      window.removeEventListener("wheel", handleWheel);
    };
  }, [handleScrollChange]);

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
    }).sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [scope, currentDate]);

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
    onSwipedUp: () => {
      handleScrollChange(-1, true); // Negative for up (decrease scroll amount)
    },
    onSwipedDown: () => {
      handleScrollChange(1, true); // Positive for down (increase scroll amount)
    },
  });

  console.log({ scope })

  return (
    <section className="space-y-4 p-8 w-screen h-dvh overflow-hidden" {...swipeHandlers}>
      <h2>{scrollAmount} {scope?.name.toUpperCase()} - {currentFrame}</h2>
      <ul className='flex items-center justify-start flex-wrap gap-2'>
        {filteredData.map(item =>
          <li
            className={`px-4 py-2 text-center font-bold
               border-4 ${CategoryColors[item.category]}`}
            key={item.date + item.name}>
            {item.name}
          </li>)}
      </ul>
    </section>
  )
}

export default App
