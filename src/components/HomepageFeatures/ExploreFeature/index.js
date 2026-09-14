import CardCarousel from "../CardCarousel";
import cardList from "./cardList";
import ExploreHeader from "./ExploreHeader";

export default function ExploreFeature() {
    return (
        <div className="container">
          <CardCarousel cards={cardList} header={ExploreHeader()} />
        </div>
    );
}