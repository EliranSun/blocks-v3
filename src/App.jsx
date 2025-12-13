import { useState, useMemo } from 'react';
import Data from "./data.json";
import { format, isSameYear, isSameMonth, isSameWeek, isSameDay, addDays, addWeeks, addMonths, addYears } from 'date-fns';
import { Search } from './Search';
import { CategoryNames, MonthNotes, Scopes } from './constants';
import { BlocksList } from "./BlocksList";
import { CategoryButtons } from './CategoryButtons';
import { NavigationButtons } from './NavigationButtons';
import { DailyQuotes } from './DailyQuotes';
import { Button } from "./Button";
import { useLogsData } from "./useLogsData";
import { AddLogDialog } from "./AddLog";

function App() {
  const [scopeIndex, setScopeIndex] = useState(2);
  const [dateOffset, setDateOffset] = useState(0);
  const [category, setCategory] = useState(CategoryNames.All.name);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [showDate, setShowDate] = useState(false);
  // const [selectedLog, setSelectedLog] = useState("");

  const { logs, addLog } = useLogsData();

  const scope = useMemo(() => Scopes[scopeIndex], [scopeIndex]);

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
        return format(currentDate, 'M yyyy');

      case 'week':
        return "Week " + format(currentDate, 'w') + "/52";

      case 'day':
        return format(currentDate, 'EEE, MMM d, yyyy');

      default:
        return '';
    }
  }, [scope, currentDate]);

  const filteredData = useMemo(() => {
    if (!scope?.name || !logs)
      return [];

    const dateComparators = {
      year: (itemDate) => isSameYear(itemDate, currentDate),
      month: (itemDate) => isSameMonth(itemDate, currentDate),
      week: (itemDate) => isSameWeek(itemDate, currentDate),
      day: (itemDate) => isSameDay(itemDate, currentDate),
    };

    const comparator = dateComparators[scope.name];

    if (!comparator)
      return [];

    if (searchTerm) {
      return logs.filter(item => {
        const search = searchTerm.trim();
        const regex = new RegExp(search, 'i');
        return (
          regex.test(item.name) ||
          regex.test(item.category) ||
          regex.test(item.subcategory) ||
          regex.test(item.location)
        );
      });
    }

    return logs.filter(item => {
      const itemDate = new Date(item.date);
      return comparator(itemDate);
    })
      .filter(item =>
        category === CategoryNames.All.name ||
        item.category?.toLowerCase() === category?.toLowerCase()
      )
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [logs, scope, currentDate, category, searchTerm]);

  return (
    <section className="p-4 flex flex-col justify-between h-dvh max-w-3xl mx-auto">
      <div className="h-full overflow-y-auto space-y-8">
        <div className='flex items-center justify-between'>
          <Button onClick={() => setDateOffset(prev => prev - 1)}>
            ←
          </Button>
          <h1 className='text-center text-lg merriweather-900'>
            {currentFrame}
          </h1>
          <Button onClick={() => setDateOffset(prev => prev + 1)}>
            →
          </Button>
        </div>
        <h2>{MonthNotes[format(currentDate, 'yyyy-MM')]}</h2>
        <DailyQuotes />
        <Search
          value={searchTerm}
          onOpen={() => setIsSearchOpen(true)}
          onClose={() => setIsSearchOpen(false)}
          onInputChange={setSearchTerm} />
        <BlocksList currentDate={currentDate} data={filteredData} showDate={showDate} />
      </div>
      <div className='flex items-center justify-center gap-2 pb-4'>
        {isSearchOpen ? null :
          <>
            <NavigationButtons
              scope={scope.name}
              onScopeChange={scopeName => {
                setScopeIndex(Scopes.findIndex(({ name }) => name === scopeName))
                setDateOffset(0);
              }} />
            <CategoryButtons
              selectedCategory={category}
              onCategoryClick={setCategory} />
            <AddLogDialog
              onSubmit={formData => {
                const data = {};
                for (let [key, value] of formData.entries()) {
                  if (value) data[key] = value;
                }
                console.log({ data });
                addLog(data);
              }} />
            <Button onClick={() => setShowDate(!showDate)} aria-label="Toggle date display">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 transition-transform duration-300"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="2" fill="none" />
                <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" strokeWidth="2" />
                <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" strokeWidth="2" />
                <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" strokeWidth="2" />
              </svg>
            </Button>

          </>}

      </div>
    </section>
  )
}

export default App
