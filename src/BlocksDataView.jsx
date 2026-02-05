import classNames from "classnames";
import { Categories } from "./constants";
import { formatDistanceToNow } from 'date-fns';

const timeAgo = date => {
    if (!date) return "-";

    try {
        return formatDistanceToNow(new Date(date.slice(0, 10)))
    } catch (error) {
        debugger;
        console.error(error);
    }

    return date;
};

export const BlocksDataView = ({ data = [] }) => {
    console.log({ data });

    return (
        <div className="space-y-2">
            {Object.values(Categories).map(category => {
                return (
                    <div key={category.name} className="border-4 rounded">
                        <h1 className="text-lg uppercase p-2">{category.name}</h1>
                        <div className="grid grid-cols-4">
                            <h3>Block</h3>
                            <h3>Last</h3>
                            <h3>Note</h3>
                            <h3>Count</h3>
                        </div>
                        <div className="">
                            {category.blocks.map(block => {
                                const blocks = data.filter(item => item.name.toLowerCase().trim() === block);

                                return (
                                    <div className={classNames("grid grid-cols-4")}>
                                        <h2 key={block} className={category.bgColor}>{block}</h2>
                                        <span>{timeAgo(blocks.at(0)?.date)}</span>
                                        <span>{blocks.at(0)?.note}</span>
                                        <span>0</span>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                );
            })}
        </div>
    )
}