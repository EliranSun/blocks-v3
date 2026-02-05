import { useState, useMemo } from 'react';
import { format, isSameYear, isSameMonth, isSameWeek, isSameDay, addDays, addWeeks, addMonths, addYears } from 'date-fns';
import { Search } from './Search';
import { Categories, MonthNotes, Scopes } from './constants';
import { BlocksList } from "./BlocksList";
import { CategoryButtons } from './CategoryButtons';
import { NavigationButtons } from './NavigationButtons';
import { DailyQuotes } from './DailyQuotes';
import { Button, RectangleButton } from "./Button";
import { useLogsData } from "./useLogsData";
import { LogDialog } from "./LogDialog";
import { BlocksDataView } from './BlocksDataView';

const Views = ["list", "week", "year"];

function App() {
  const [page, setPage] = useState("");
  const [scopeIndex, setScopeIndex] = useState(2);
  const [dateOffset, setDateOffset] = useState(0);
  const [category, setCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentViewIndex, setCurrentViewIndex] = useState(Views.indexOf("week") || 0);
  const [showDate, setShowDate] = useState(false);
  const [showColorOnly, setShowColorOnly] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);
  const [showNote, setShowNote] = useState(false);
  const { logs, addLog, editLog, deleteLog } = useLogsData();

  const handleBlockClick = (item) => {
    setSelectedLog(item);
    setIsDialogOpen(true);
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setSelectedLog(null);
  };

  const handleOpenAddDialog = () => {
    setSelectedLog(null);
    setIsDialogOpen(true);
  };

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
        !category ||
        item.category?.toLowerCase() === category?.toLowerCase()
      )
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [logs, scope, currentDate, category, searchTerm]);

  const changeScope = (scopeName) => {
    setScopeIndex(Scopes.findIndex(({ name }) => name.toLocaleLowerCase() === scopeName.toLocaleLowerCase()))
    setDateOffset(0);
  };

  return (
    <section className="p-4 flex flex-col justify-between h-dvh max-w-4xl mx-auto">
      <div className="h-full space-y-4 flex md:flex-row gap-4">
        <div className='flex md:flex-col gap-2 items-start md:w-1/3 bg-neutral-700 rounded shadow-lg p-4'>
          <div className='flex justify-between w-full'>
            <div className='spacy-y-4'>
              <h1 className='text-2xl merriweather-900'>
                {currentFrame}
              </h1>
              <h2 className='text-gray-400'>
                {MonthNotes[format(currentDate, 'yyyy-MM')]}
              </h2>
            </div>
            <div className='flex gap-2'>
              <Button onClick={() => setDateOffset(prev => prev - 1)}>
                ←
              </Button>
              <Button onClick={() => setDateOffset(prev => prev + 1)}>
                →
              </Button>
            </div>
          </div>
          <Search
            value={searchTerm}
            autoHide={false}
            onInputChange={setSearchTerm} />
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
            📅 {Views[currentViewIndex]} view
          </RectangleButton>
          <RectangleButton onClick={() => setShowDate(!showDate)}>
            📆 {showDate ? "Hide" : "Show"} dates
          </RectangleButton>
          <RectangleButton onClick={() => setShowNote(!showNote)}>
            📃 {showNote ? "Hide" : "Show"} note
          </RectangleButton>
          <RectangleButton onClick={() => setShowColorOnly(!showColorOnly)}>
            🦄 Hide text
          </RectangleButton>
          <RectangleButton onClick={() => { }}>
            🔃 Sort - new to old
          </RectangleButton>

          <div className='border w-full border-neutral-900 my-4' />
          <RectangleButton onClick={() => setPage("")}>
            Blocks
          </RectangleButton>
          <RectangleButton onClick={() => setPage("blocksData")}>
            Data
          </RectangleButton>
          <RectangleButton onClick={() => { }}>
            Well Being?
          </RectangleButton>
          <div className='border w-full border-neutral-900 my-4' />
          <LogDialog
            log={selectedLog}
            isOpen={isDialogOpen}
            onOpen={handleOpenAddDialog}
            onClose={handleDialogClose}
            onAdd={addLog}
            onEdit={editLog}
            onDelete={deleteLog}
          />
        </div>
        <div className='md:w-2/3 overflow-y-auto'>
          {page === "blocksData" ?
            <BlocksDataView data={filteredData} />
            : (
              <BlocksList
                currentDate={currentDate}
                data={filteredData}
                showDate={showDate}
                showNote={showNote}
                colorOnly={showColorOnly}
                view={Views[currentViewIndex]}
                onBlockClick={handleBlockClick} />
            )}
        </div>
      </div>
      {/* <div className='flex items-center justify-center gap-2 p-4 mb-2
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
      </div> */}
    </section>
  )
}

export default App
