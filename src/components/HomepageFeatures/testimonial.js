import React, { useEffect } from 'react';
import './testimonial.css';

export default function ResearcherTestimonials() {
    const testimonials = [
        {
            name: "Patrick Clemins",
            initial: "PC",
            quote: "CIROH Hub allows us at the University of Vermont's NETWA (Northeast Evaluation Testbed for Water Resources Applications) to effectively engage with our community by providing a listing of our services, documentation for how to use them, and an introductory \"How to Get Started \" page.  It also allows us to share our progress and stay engaged with the broader CIROH community so that we can grow our impact as others discover and use our products and services.",
            date: "April 2025",
            image: "https://ca.slack-edge.com/T03UUB7CE83-U04PWK9SZ7V-g94d71bed9e2-192"
        },
        {
            name: "James Halgren",
            initial: "JH",
            quote: "Having a community editable common place for sharing code, data resources, and community guidance was one of the critical first steps to being able to gather a community for operational hydrological modeling. CIROH Hub has begun to fill that gap. I am excited to see it growing and hope it becomes a valuable resource for the CIROH researchers and broader community.",
            date: "April 2025",
            image: "https://ca.slack-edge.com/T03UUB7CE83-U03UDT3AMST-4a6c980b793d-512"
        },
        {
            name: "Supath Dhital",
            initial: "SD",
            quote: "CIROH Hub has transformed my research process. I discovered several hydrological frameworks I wasn't previously aware of when searching for specific tools. The platform not only helps me learn from others' work, but also provides a professional space to document and publish my own research findings. When colleagues ask for my work, sharing a CIROH Hub link adds credibility and enhances collaboration. It's become an essential tool in my research workflow. ",
            date: "April 2025",
            image: "https://ca.slack-edge.com/T03UUB7CE83-U075Y3PGA2X-0902e50fa8a3-192"
        },
        {
            name: "Gio",
            initial: "G",
            quote: "What I like the most about using CIROH Hub is that it is easy to contribute to the documentation when I update or want to add my research work. Also, I like the idea that I can contribute with blogs and tutorials depending on the needs of the community.",
            date: "April 2025",
            image: "https://ca.slack-edge.com/T03UUB7CE83-U057VCZQWRW-fe48d8f10837-192"
        },
        {
            name: "Dr. Shahab Alam",
            initial: "SA",
            quote: "CIROH Hub plays a vital role in supporting researchers by providing a centralized, accessible platform to share tools, documentation, and applications with the broader hydrologic science and forecasting community. Research tools such as the CSES and its Tethys-CSES web app reside on CIROH Hub, enhancing their visibility and usability. This platform bridges research and practice through transparency and open access, amplifying collaborative impact across the community.",
            date: "April 2025",
            image: "https://ca.slack-edge.com/T03UUB7CE83-U041R2KSVQC-07ff6e8ed717-512"
        },
        {
            name: "Quinn Lee",
            initial: "QL",
            quote: "I frequently use CIROH Hub to access documentation and best practices for the computing infrastructure I use for my research.",
            date: "April 2025",
            image: "https://ca.slack-edge.com/T03UUB7CE83-U072YTSNJFL-6bae7401aaac-192"
        },
        // Add more testimonials as needed
    ];


    return (
        <section className="researcher-testimonials-section" id="researcher-testimonials">
            <div className="researcher-testimonials-container">
                <h1 className="tw-text-4xl tw-font-extrabold tw-text-center tw-mb-6
                tw-text-blue-800 dark:tw-text-white">
                Loved by Researchers
            </h1>
                <hr className="researcher-divider tw-mb-18" />

                <div className="researcher-grid">
                    {testimonials.map((testimonial, index) => (
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