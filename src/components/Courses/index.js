import React from "react";
import LMLightIcon from '@site/static/img/cards/modules_light.png';
import LMDarkIcon from '@site/static/img/cards/modules_dark.png';
import { useColorMode } from "@docusaurus/theme-common";
import HydroShareResourcesSelector from "@site/src/components/HydroShareResourcesSelector";

export default function Courses({ keyword = "nwm_portal_course" }) {
    const { colorMode } = useColorMode();
    const lm_icon = colorMode === 'dark' ? LMDarkIcon : LMLightIcon;
  
    return(
        <HydroShareResourcesSelector keyword={keyword} defaultImage={lm_icon} />
    )
}


// Some useful code

// import React, { useEffect, useState } from "react";
// import clsx from "clsx";
// import { FaThLarge, FaBars } from "react-icons/fa";
// import styles from "./styles.module.css";
// import HydroShareResourcesTiles from "@site/src/components/HydroShareResourcesTiles";
// import HydroShareResourcesRows from "@site/src/components/HydroShareResourcesRows";
// import { getHydrolearnModules } from "./utils";

// export default function LearningModules({ keyword = "nwm_portal_module" }) {
//   const PLACEHOLDER_ITEMS = 10;

//   // Initialize with placeholder objects so that the component renders immediately.
//   const initialPlaceholders = Array.from({ length: PLACEHOLDER_ITEMS }).map((_, index) => ({
//     resource_id: `placeholder-${index}`,
//     title: "",
//     resource_type: "",
//     resource_url: "",
//     description: "",
//     app_icon: "",
//     home_page_url: "",
//     source_code_url: "",
//     help_page_url: "",
//   }));

//   const [courses, setCourses] = useState(initialPlaceholders);
//   const [error, setError] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [view, setView] = useState("row");
//   useEffect(() => {
//     (async () => {
//       try {
//         // Start data fetching (while placeholders are already rendered)
//         const CourseList = await getHydrolearnModules(keyword);
//         console.log(CourseList);
//         const mappedList = CourseList.map((cs) => ({
//           title: cs.course_title,
//           resource_url: cs.course_url,
//           description: cs.course_description_content || "No description available.",
//           app_icon: cs.course_image_url,
//           home_page_url: cs.course_organization,
//           source_code_url: cs.course_code,
//           help_page_url: cs.course_weekly_effort,
//         }));

//         // Replace placeholders with fetched data
//         setCourses(mappedList);
//         setLoading(false);

//       } catch (err) {
//         console.error(`Error fetching courses: ${err.message}`);
//         setError(err.message);
//         setLoading(false);
//       }
//     })();
//   }, [keyword]);

//   if (error) {
//     return <p style={{ color: "red" }}>Error: {error}</p>;
//   }

//   return (
//     <div className={clsx(styles.wrapper)}>
//       <div className={clsx("container", "margin-bottom--lg")}>
//         <div className={styles.header}>
//           <div className={styles.viewToggle}>
//             <button
//               className={clsx(styles.toggleButton, { [styles.active]: view === "grid" })}
//               onClick={() => setView("grid")}
//               title="Grid View"
//             >
//               <FaThLarge size={18} />
//             </button>
//             <button
//               className={clsx(styles.toggleButton, { [styles.active]: view === "row" })}
//               onClick={() => setView("row")}
//               title="List View"
//             >
//               <FaBars size={18} />
//             </button>
//           </div>
//         </div>

//         {view === "grid" ? (
//           <HydroShareResourcesTiles resources={courses}/>
//         ) : (
//           <HydroShareResourcesRows resources={courses}/>
//         )}
//       </div>
//     </div>
//   );
// }
