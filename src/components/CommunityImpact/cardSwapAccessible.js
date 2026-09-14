import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

const TW_LG = 1024; // Tailwind responsive breakpoint, in px

const CardSwapAccessible = ({
    cards
}) => {

    return (
        <div class="tw-flex tw-h-full">
            <div className="tw-m-auto tw-rounded-xl tw-outline tw-border-2 tw-border-white tw-outline-white tw-bg-slate-900 tw-text-white tw-p-6 lg:tw-p-10 tw-text-base">
                <Tabs>
                    {cards.map(card => {
                        return (
                            <TabItem key={card.key} value={card.key} label={card.icon}>
                                <h3 className="tw-text-white"> {card.icon} {card.title} </h3>
                                <p> {card.body} </p>
                            </TabItem>
                        );
                    })}
                </Tabs>
            </div>
        </div>
    )
}

export default CardSwapAccessible;