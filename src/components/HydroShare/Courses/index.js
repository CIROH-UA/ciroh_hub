import React from "react";
import LMLightIcon from '@site/static/img/cards/modules_light.png';
import LMDarkIcon from '@site/static/img/cards/modules_dark.png';
import { useColorMode } from "@docusaurus/theme-common";
import HydroShareResourcesSelector from "@site/src/components/HydroShare/HydroShareResourcesSelector";

export default function Courses({ keyword = "nwm_portal_module,ciroh_hub_module" }) {
    const { colorMode } = useColorMode();
    const lm_icon = colorMode === 'dark' ? LMDarkIcon : LMLightIcon;
  
    return(
        <HydroShareResourcesSelector keyword={keyword} defaultImage={lm_icon} />
    )
}