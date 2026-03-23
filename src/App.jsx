import { useState, useMemo } from 'react';
import { format, isSameYear, isSameMonth, isSameWeek, isSameDay, addWeeks, addYears, addMonths, startOfDay } from 'date-fns';
import { BlocksList } from "./BlocksList";
import { useLogsData } from "./useLogsData";
import { LogDialog } from "./LogDialog";
import { BlocksDataView } from './BlocksDataView';
import { BlockDetailView } from './BlockDetailView';
import { CategoryDetailView } from './CategoryDetailView';
import classNames from 'classnames';
import { motion, AnimatePresence } from 'framer-motion';

const Views = ["week", "list", "year"];

const HomeIcon = ({ active }) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        {!active && <polyline points="9 22 9 12 15 12 15 22" />}
    </svg>
);

const StatsIcon = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
);

const PlusIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
        <line x1="12" y1="5" x2="12" y2="19" />
        <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
);

const CalendarIcon = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
);

const ProfileIcon = () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
    </svg>
);

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
        if (!logs) return [];

        const dateComparators = {
            year: (itemDate) => isSameYear(itemDate, currentDate),
            month: (itemDate) => isSameMonth(itemDate, currentDate),
            week: (itemDate) => isSameWeek(itemDate, currentDate, { weekStartsOn: 1 }),
            day: (itemDate) => isSameDay(itemDate, currentDate),
            list: (itemDate) => {
                if (listScope === 'year') return isSameYear(itemDate, currentDate);
                if (listScope === 'month') return isSameMonth(itemDate, currentDate);
                if (listScope === 'week') return isSameWeek(itemDate, currentDate, { weekStartsOn: 1 });
                return true;
            }
        };

        const comparator = dateComparators[viewName];
        if (!comparator) return [];

        return logs.filter(item => comparator(new Date(item.date)))
            .filter(item =>
                !category ||
                item.category?.toLowerCase() === category?.toLowerCase()
            )
            .sort((a, b) => new Date(b.date) - new Date(a.date));
    }, [logs, viewName, currentDate, category, listScope]);

    const activeNav = page === "" ? "home" : page === "blocksData" || page === "blockDetail" || page === "categoryDetail" ? "stats" : "home";

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

                    {/* FAB */}
                    <motion.button
                        className="fixed bottom-24 right-5 w-14 h-14 rounded-full bg-blue-600 text-white shadow-lg dark:shadow-lg flex items-center justify-center z-50"
                        whileTap={{ scale: 0.9 }}
                        whileHover={{ scale: 1.05 }}
                        onClick={handleOpenAddDialog}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: "spring", damping: 15, stiffness: 300, delay: 0.3 }}
                    >
                        <PlusIcon />
                    </motion.button>

                    {/* Bottom navbar */}
                    <motion.div
                        className={classNames(
                            "fixed bottom-5 inset-x-0 flex justify-around items-center",
                            "bg-white dark:bg-neutral-800 rounded-full",
                            "shadow-lg px-2 py-3 max-w-sm mx-auto",
                        )}
                        initial={{ y: 80, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ type: "spring", damping: 20, stiffness: 200, delay: 0.2 }}
                    >
                        <motion.button
                            whileTap={{ scale: 0.88 }}
                            className={classNames(
                                "p-2 rounded-full transition-colors",
                                activeNav === "home" ? "text-neutral-900 dark:text-white" : "text-neutral-400 dark:text-neutral-500"
                            )}
                            onClick={() => {
                                setPage("");
                                setViewName("week");
                                setSelectedBlock(null);
                            }}
                        >
                            <HomeIcon active={activeNav === "home"} />
                        </motion.button>
                        <motion.button
                            whileTap={{ scale: 0.88 }}
                            className={classNames(
                                "p-2 rounded-full transition-colors",
                                activeNav === "stats" ? "text-neutral-900 dark:text-white" : "text-neutral-400 dark:text-neutral-500"
                            )}
                            onClick={() => {
                                setPage("blocksData");
                                setSelectedBlock(null);
                                setSelectedCategory(null);
                            }}
                        >
                            <StatsIcon />
                        </motion.button>
                        <motion.button
                            whileTap={{ scale: 0.88 }}
                            className="p-2 text-neutral-400 dark:text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors"
                            onClick={handleOpenAddDialog}
                        >
                            <PlusIcon />
                        </motion.button>
                        <motion.button
                            whileTap={{ scale: 0.88 }}
                            className={classNames(
                                "p-2 rounded-full transition-colors",
                                viewName === "year" && page === "" ? "text-neutral-900 dark:text-white" : "text-neutral-400 dark:text-neutral-500"
                            )}
                            onClick={() => {
                                setPage("");
                                setViewName("year");
                                setDateOffset(0);
                            }}
                        >
                            <CalendarIcon />
                        </motion.button>
                        <motion.button
                            whileTap={{ scale: 0.88 }}
                            className="p-2 text-neutral-400 dark:text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors"
                        >
                            <ProfileIcon />
                        </motion.button>
                    </motion.div>

                    <div className="w-full md:w-2/3 mx-auto h-full overflow-y-auto overflow-x-hidden pb-32">
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
                                        allLogs={logs || []}
                                        category={category}
                                        onCategoryChange={setCategory}
                                        onBlockClick={handleBlockClick}
                                        onAddBlock={handleOpenAddDialogForDay}
                                        listScope={listScope}
                                        onListScopeChange={(scope) => {
                                            setListScope(scope);
                                            setDateOffset(0);
                                        }}
                                    />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </section>
        </>
    );
}

export default App;
