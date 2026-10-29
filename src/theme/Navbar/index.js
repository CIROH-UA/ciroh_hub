import React from 'react';
import OriginalNavbar from '@theme-original/Navbar';
import FeedbackButton from '@site/src/components/FeedbackButton'

export default function Navbar(props) {
  return <>
    <OriginalNavbar {...props} />
    <FeedbackButton/>
  </>;
}
