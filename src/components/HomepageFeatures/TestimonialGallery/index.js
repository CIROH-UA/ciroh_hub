import './testimonial.css';
import testimonialList from './testimonialList';

export default function ResearcherTestimonials() {
    return (
        <section className="researcher-testimonials-section" id="researcher-testimonials">
            <div className="researcher-testimonials-container">
                <h1 className="tw-text-4xl tw-font-extrabold tw-text-center tw-mb-6
                tw-text-black dark:tw-text-white">
                    User Comments
                </h1>
                <div style={{"textAlign": "center"}}>
                    <i>Note: CIROH Hub combines the content of CIROH DocuHub and CIROH Portal, two former CIROH resources.</i>
                    { /* FIXME: We should probably just get newer testimonials. (Or explicit permission from the people we quote to update them) */ }
                </div>
                <hr className="researcher-divider tw-mb-18" />

                <div className="researcher-grid">
                    {testimonialList.map((testimonial, index) => (
                        <div key={index} className="researcher-card">
                            <div className="researcher-img-container">
                                {testimonial.image ? (

                                    <img
                                        src={testimonial.image}
                                        alt={`${testimonial.name}`}
                                        className="researcher-image"
                                    />
                                ) : (

                                    <div className="researcher-initials">
                                        {testimonial.initial}
                                    </div>
                                )}
                            </div>
                            <h3 className="researcher-name">{testimonial.name}</h3>
                            <p className="researcher-date">{testimonial.date}</p>
                            <blockquote className="researcher-quote">
                                "{testimonial.quote}"
                            </blockquote>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}