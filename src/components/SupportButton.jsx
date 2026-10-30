import { useState } from 'react';
import useBaseUrl from '@docusaurus/useBaseUrl';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Link from '@docusaurus/Link';
import { useColorMode } from '@docusaurus/theme-common';
import ModalGeneric from '@site/src/components/Modal/ModalGeneric';

const SupportButton = () => {
    const [ modalOpen, setModalOpen ] = useState(false);

    function toggleModalOpen() {
        setModalOpen(!modalOpen);
        return false; // For the sake of <a> elements
    }

    const supportEmail = 'ciroh-it-support@ua.edu'

    return (
        <>
            <Link class="button button--active button--primary" style={{'margin-right':'1.3rem','margin-bottom':'1.3rem'}} href="#" onClick={toggleModalOpen}>Contact Support</Link>
            <ModalGeneric open={modalOpen} onClose={toggleModalOpen}>
                <h2>Contact Support</h2>
                <p>To get support for CIROH R2OHC, contact us at <a href={'mailto:'+supportEmail}>{supportEmail}</a>.</p>
                <Link class="button button--active button--primary" style={{'margin-right':'1.3rem','margin-bottom':'1.3rem'}} href={'mailto:'+supportEmail}>Open in Email Client</Link>
                <Link class="button button--active button--secondary" style={{'margin-right':'1.3rem','margin-bottom':'1.3rem'}} href='#' onClick={toggleModalOpen}>Close</Link>
            </ModalGeneric>
        </>
    );
}

export default SupportButton