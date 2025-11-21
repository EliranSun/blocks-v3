export const NavigationButtons = ({
    onNavigateUp,
    onNavigateDown,
    onNavigateLeft,
    onNavigateRight,
    scope
}) => {
    return (
        <div className="flex gap-2 text-xs justify-center">
            <button onClick={onNavigateRight}>
                Prev {scope.name}
            </button>
            <button onClick={onNavigateUp}>
                ↑
            </button>
            <button onClick={onNavigateDown}>
                ↓
            </button>
            <button onClick={onNavigateLeft}>
                Next {scope.name}
            </button>
        </div>
    )
}