const Stars = ({ value = 0, max = 5 }) => {
    return (
        <div className="card-stars">
            {new Array(max).fill(null).map((_, index) => {
                if (index >= value) return "☆";
                return "★";
            })}
        </div>
    )
};

export const Card = () => {
    return (
        <div className="card-profile open-sans-400">
            <div className="card-profile-image">
                <img src="https://placedog.net/640/480?random" />
            </div>
            <div className="card-title">
                <h1>Cute Little Dog</h1>
                <h2>Dog Description</h2>
            </div>
            <Stars value={1} />
            <p className="card-description">Lorem ipsum dolor sit amet, consectetur adipiscing.<br />Sed do eiusmod tempor incididunt ut labore.</p>
            <div className="card-stats">
                <div>
                    <h3>5345</h3>
                    <span>Title</span>
                </div>
                <div>
                    <h3>434</h3>
                    <span>Likes</span>
                </div>
                <div>
                    <h3>666</h3>
                    <span>Position</span>
                </div>
            </div>
        </div>
    )
}