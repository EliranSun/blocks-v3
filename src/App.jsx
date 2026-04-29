import { useState, useMemo } from 'react';
import { format, isSameYear, isSameMonth, isSameWeek, isSameDay, addWeeks, addYears, addMonths, startOfDay } from 'date-fns';
// import { MonthNotes, Scopes } from './constants';
import { BlocksList } from "./BlocksList";
// import { CategoryButtons } from './CategoryButtons';
// import { NavigationButtons } from './NavigationButtons';
// import { DailyQuotes } from './DailyQuotes';
import { useLogsData } from "./useLogsData";
import { LogDialog } from "./LogDialog";
import { BlocksDataView } from './BlocksDataView';
import { BlockDetailView } from './BlockDetailView';
import { CategoryDetailView } from './CategoryDetailView';
import { InsightsView } from './InsightsView';
import { NavMenu } from './NavMenu';
import classNames from 'classnames';
import { motion, AnimatePresence } from 'framer-motion';

const Views = ["week", "list", "year"];

function App() {
  const [page, setPage] = useState("");
  const [selectedBlock, setSelectedBlock] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [blockDetailPreviousPage, setBlockDetailPreviousPage] = useState("blocksData");
  const [dateOffset, setDateOffset] = useState(0);
  const [category, setCategory] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);
  const [defaultDialogDate, setDefaultDialogDate] = useState(null);
  const { logs, addLog, editLog, deleteLog } = useLogsData();
  const [viewName, setViewName] = useState(Views[0]);
  const [listScope, setListScope] = useState("all");
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleBlockClick = (item) => {
    setSelectedLog(item);
    setIsDialogOpen(true);
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setSelectedLog(null);
    setDefaultDialogDate(null);
  };

  const handleOpenAddDialog = () => {
    setSelectedLog(null);
    setDefaultDialogDate(null);
    setIsDialogOpen(true);
  };

  const handleOpenAddDialogForDay = (day) => {
    setSelectedLog(null);
    setDefaultDialogDate(format(startOfDay(day), "yyyy-MM-dd'T'HH:mm"));
    setIsDialogOpen(true);
  };

  const currentDate = useMemo(() => {
    const now = new Date();

    switch (viewName) {
      case 'year':
        return addYears(now, dateOffset);

      case 'week':
        return addWeeks(now, dateOffset);

      case 'list':
        if (listScope === 'year') return addYears(now, dateOffset);
        if (listScope === 'month') return addMonths(now, dateOffset);
        if (listScope === 'week') return addWeeks(now, dateOffset);
        return now;

      default:
        return now;
    }
  }, [viewName, dateOffset, listScope]);

  const title = useMemo(() => {
    switch (viewName) {
      case 'year':
        return format(currentDate, 'yyyy');

      case 'month':
        return format(currentDate, 'M yyyy');

      case 'week':
        return "Week " + format(currentDate, 'w') + "/52";

      case 'day':
        return format(currentDate, 'EEE, MMM d, yyyy');

      case 'list':
        if (listScope === 'year') return format(currentDate, 'yyyy');
        if (listScope === 'month') return format(currentDate, 'MMMM yyyy');
        if (listScope === 'week') return "Week " + format(currentDate, 'w') + ", " + format(currentDate, 'yyyy');
        return '';

      default:
        return '';
    }
  }, [viewName, currentDate, listScope]);

  const filteredData = useMemo(() => {
    if (!logs)
      return [];

    const dateComparators = {
      year: (itemDate) => isSameYear(itemDate, currentDate),
      month: (itemDate) => isSameMonth(itemDate, currentDate),
      week: (itemDate) => isSameWeek(itemDate, currentDate),
      day: (itemDate) => isSameDay(itemDate, currentDate),
      list: (itemDate) => {
        if (listScope === 'year') return isSameYear(itemDate, currentDate);
        if (listScope === 'month') return isSameMonth(itemDate, currentDate);
        if (listScope === 'week') return isSameWeek(itemDate, currentDate);
        return true;
      }
    };

    const comparator = dateComparators[viewName];

    if (!comparator)
      return [];

    return logs.filter(item => comparator(new Date(item.date)))
      .filter(item =>
        !category ||
        item.category?.toLowerCase() === category?.toLowerCase()
      )
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [logs, viewName, currentDate, category, listScope]);

  return (
    <>
      <section className="p-4 flex flex-col justify-between h-dvh max-w-4xl mx-auto">
        <div className="h-full space-y-4 flex-col md:flex-row gap-4">
          <LogDialog
            log={selectedLog}
            defaultDate={defaultDialogDate}
            isOpen={isDialogOpen}
            onOpen={handleOpenAddDialog}
            onClose={handleDialogClose}
            onAdd={addLog}
            onEdit={editLog}
            onDelete={deleteLog}
          />
          <motion.button
            type="button"
            aria-label="Open navigation menu"
            aria-expanded={isMenuOpen}
            onClick={() => setIsMenuOpen(true)}
            whileTap={{ scale: 0.92 }}
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: "spring", damping: 20, stiffness: 200, delay: 0.2 }}
            className={classNames(
              "fixed bottom-5 left-5 z-30 w-14 h-14 flex items-center justify-center rounded-sm",
              "border-[3px] border-black dark:border-white",
              "bg-white text-black dark:bg-neutral-900 dark:text-white",
              "shadow-[5px_5px_0_0_#000] dark:shadow-[5px_5px_0_0_#fff]",
              "active:shadow-[1px_1px_0_0_#000] dark:active:shadow-[1px_1px_0_0_#fff]",
              "active:translate-x-[4px] active:translate-y-[4px]",
              "transition-[transform,box-shadow] duration-75",
            )}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
              <line x1="4" y1="7" x2="20" y2="7" />
              <line x1="4" y1="12" x2="20" y2="12" />
              <line x1="4" y1="17" x2="20" y2="17" />
            </svg>
          </motion.button>
          <motion.button
            type="button"
            aria-label="Add block"
            onClick={handleOpenAddDialog}
            whileTap={{ scale: 0.92 }}
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: "spring", damping: 20, stiffness: 200, delay: 0.25 }}
            className={classNames(
              "fixed bottom-5 right-5 z-30 h-14 px-5 flex items-center gap-2 rounded-sm",
              "border-[3px] border-black dark:border-white",
              "bg-white text-black dark:bg-neutral-900 dark:text-white",
              "shadow-[5px_5px_0_0_#000] dark:shadow-[5px_5px_0_0_#fff]",
              "active:shadow-[1px_1px_0_0_#000] dark:active:shadow-[1px_1px_0_0_#fff]",
              "active:translate-x-[4px] active:translate-y-[4px]",
              "transition-[transform,box-shadow] duration-75",
              "font-black uppercase tracking-tight space-grotesk-600 text-sm",
            )}
          >
            <span className="text-xl leading-none">+</span>
            Add block
          </motion.button>
          <NavMenu
            isOpen={isMenuOpen}
            onClose={() => setIsMenuOpen(false)}
            currentPage={page}
            onNavigate={(key) => {
              setPage(key);
              setSelectedBlock(null);
              setSelectedCategory(null);
            }}
          />
          <div className='w-full md:w-2/3 mx-auto h-full overflow-y-auto overflow-x-hidden pb-24'>
            <AnimatePresence mode="wait">
              {page === "blockDetail" && selectedBlock ? (
                <motion.div
                  key="blockDetail"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ type: "spring", damping: 25, stiffness: 300 }}
                >
                  <BlockDetailView
                    block={selectedBlock}
                    data={logs}
                    onBack={() => {
                      setSelectedBlock(null);
                      setPage(blockDetailPreviousPage);
                    }}
                  />
                </motion.div>
              ) : page === "categoryDetail" && selectedCategory ? (
                <motion.div
                  key="categoryDetail"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ type: "spring", damping: 25, stiffness: 300 }}
                >
                  <CategoryDetailView
                    categoryName={selectedCategory}
                    data={logs}
                    onBack={() => {
                      setSelectedCategory(null);
                      setPage("blocksData");
                    }}
                    onBlockClick={(block) => {
                      setSelectedBlock(block);
                      setBlockDetailPreviousPage("categoryDetail");
                      setPage("blockDetail");
                    }}
                  />
                </motion.div>
              ) : page === "insights" ? (
                <motion.div
                  key="insights"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ type: "spring", damping: 25, stiffness: 300 }}
                >
                  <InsightsView
                    data={logs}
                    onBlockClick={(block) => {
                      setSelectedBlock(block);
                      setBlockDetailPreviousPage("insights");
                      setPage("blockDetail");
                    }}
                    onCategoryClick={(categoryName) => {
                      setSelectedCategory(categoryName);
                      setPage("categoryDetail");
                    }}
                  />
                </motion.div>
              ) : page === "blocksData" ? (
                <motion.div
                  key="blocksData"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ type: "spring", damping: 25, stiffness: 300 }}
                >
                  <BlocksDataView
                    data={logs}
                    onBlockClick={(block) => {
                      setSelectedBlock(block);
                      setBlockDetailPreviousPage("blocksData");
                      setPage("blockDetail");
                    }}
                    onCategoryClick={(categoryName) => {
                      setSelectedCategory(categoryName);
                      setPage("categoryDetail");
                    }}
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="blocks"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ type: "spring", damping: 25, stiffness: 300 }}
                >
                  <BlocksList
                    view={viewName}
                    title={title}
                    onViewChange={setViewName}
                    onNextDate={() => setDateOffset(prev => prev + 1)}
                    onPrevDate={() => setDateOffset(prev => prev - 1)}
                    currentDate={currentDate}
                    data={filteredData}
                    category={category}
                    onCategoryChange={setCategory}
                    onBlockClick={handleBlockClick}
                    onAddBlock={handleOpenAddDialogForDay}
                    listScope={listScope}
                    onListScopeChange={(scope) => {
                      setListScope(scope);
                      setDateOffset(0);
                    }} />
                </motion.div>
              )}
            </AnimatePresence>
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
    </>
  )
}

export default App
