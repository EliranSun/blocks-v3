import { useState, useMemo } from 'react';
import { format, isSameYear, isSameMonth, isSameWeek, isSameDay, addDays, addWeeks, addMonths, addYears } from 'date-fns';
import { Search } from './Search';
import { CategoryNames, MonthNotes, Scopes } from './constants';
import { BlocksList } from "./BlocksList";
import { CategoryButtons } from './CategoryButtons';
import { NavigationButtons } from './NavigationButtons';
import { DailyQuotes } from './DailyQuotes';
import { Button, RectangleButton } from "./Button";
import { useLogsData } from "./useLogsData";
import { AddLogDialog } from "./AddLog";

const Views = ["list", "week", "year"];

function App() {
  const [scopeIndex, setScopeIndex] = useState(2);
  const [dateOffset, setDateOffset] = useState(0);
  const [category, setCategory] = useState(CategoryNames.All.name);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentViewIndex, setCurrentViewIndex] = useState(0);
  const [showDate, setShowDate] = useState(false);
  const [showColorOnly, setShowColorOnly] = useState(false);
  
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

  const changeScope = (scopeName) => {
    setScopeIndex(Scopes.findIndex(({ name }) => name.toLocaleLowerCase() === scopeName.toLocaleLowerCase()))
    setDateOffset(0);
  };

  return (
    <section className="p-4 flex flex-col justify-between h-dvh max-w-3xl mx-auto">
      <div className="h-full overflow-y-auto space-y-4 pb-16">
        <div className='flex gap-2 items-start'>
          <div className='spacy-y-4 w-full'>
            <h1 className='text-2xl merriweather-900'>
              {currentFrame}
            </h1>
            <h2 className='text-gray-400'>
              {MonthNotes[format(currentDate, 'yyyy-MM')]}
            </h2>
          </div>
          {/* <DailyQuotes /> */}
          <RectangleButton
            onClick={() => {
              setCurrentViewIndex(prev => {
                const nextIndex = (prev + 1) % Views.length;
                const nextView = Views[nextIndex];
                nextView !== "list" && changeScope(nextView);
                return nextIndex;
              });
            }}
          >
            📃
          </RectangleButton>
          <RectangleButton onClick={() => setShowDate(!showDate)}>
            📆
          </RectangleButton>
          <RectangleButton onClick={() => setShowColorOnly(!showColorOnly)}>
            🦄
          </RectangleButton>
        </div>
        <Search
          value={searchTerm}
          autoHide={false}
          onInputChange={setSearchTerm} />
        <BlocksList
          currentDate={currentDate}
          data={filteredData}
          showDate={showDate}
          colorOnly={showColorOnly}
          view={Views[currentViewIndex]} />
      </div>
      <div className='flex items-center justify-center gap-2 p-4 mb-2
      dark:bg-neutral-700 bg-neutral-200 rounded-full shadow-xl'>
        <CategoryButtons
          selectedCategory={category}
          onCategoryClick={setCategory} />
        <NavigationButtons
          scope={scope.name}
          onScopeChange={scopeName => {
            setScopeIndex(Scopes.findIndex(({ name }) => name === scopeName))
            setDateOffset(0);
          }} />
        <AddLogDialog
          onSubmit={formData => {
            const data = {};
            for (let [key, value] of formData.entries()) {
              if (value) data[key] = value;
            }
            // HTML5 validation ensures name and date are present
            addLog(data);
          }} />
        <Button onClick={() => setDateOffset(prev => prev - 1)}>
          ←
        </Button>
        <Button onClick={() => setDateOffset(prev => prev + 1)}>
          →
        </Button>
      </div>
    </section>
  )
}

export default App
