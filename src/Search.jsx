export const Search = ({ value, onInputChange = () => { } }) => {
    return (
        <div className="border text-lg px-4 py-2 rounded-full">
            <input
                type="text"
                className="w-full outline-none"
                value={value}
                placeholder="Search..."
                onChange={event => onInputChange(event.target.value)} />
        </div>
    )
}