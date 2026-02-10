import classNames from "classnames";
import { Categories } from "./constants";
import { formatDistanceToNow, format } from 'date-fns';

const timeAgo = date => {
    if (!date) return "None";

    try {
        return formatDistanceToNow(new Date(date), { addSuffix: false })
    } catch (error) {
        console.error(error);
    }

    return date;
};

export const BlocksDataView = ({ data = [] }) => {
    console.log({ data });

    return (
        <div className="space-y-2 pb-40">
            <h1 className="text-xl merriweather-900">BLOCKS DATA</h1>
            {Object.values(Categories).map(category => {
                return (
                    <div key={category.name} className="">
                        <h2 className="text-lg uppercase py-2 font-bold underline merriweather-500">
                            {category.name}
                        </h2>
                        {/* <div className="grid grid-cols-4">
                            <h3>Block</h3>
                            <h3>Last</h3>
                            <h3>Note</h3>
                            <h3>Count</h3>
                        </div> */}
                        <div className="">
                            {category.blocks.map(block => {
                                const blocks = data
                                    .filter(item => {
                                        return (
                                            item.name.toLowerCase().trim().includes(block.toLowerCase().trim()) ||
                                            item.category.toLowerCase().trim() === block.toLowerCase().trim() ||
                                            item.subcategory?.toLowerCase().trim() === block.toLowerCase().trim()
                                        )
                                    })
                                // .sort((a, b) =>
                                //     new Date(b.date.slice(0, 10)).getTime() -
                                //     new Date(a.date.slice(0, 10)).getTime());

                                return (
                                    <div className={classNames("my-2 flex")}>
                                        <h3 key={block} className={classNames(category.color, "space-grotesk-600 w-28 font-bold uppercase")}>
                                            {block}
                                        </h3>
                                        <div className="flex gap-1 merriweather-400">
                                            {blocks.length ? (
                                                <span className="">
                                                    {[
                                                        // format(new Date(blocks.at(0)?.date), "MM-dd"),
                                                        timeAgo(blocks.at(0)?.date),
                                                        // blocks.at(0)?.note,
                                                        blocks.length + " times"
                                                    ].filter(Boolean).join(", ")}
                                                </span>
                                            ) : "None"}
                                            {/* <pre>
                                                {JSON.stringify(blocks, null, 2)}
                                            </pre> */}
                                        </div>
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