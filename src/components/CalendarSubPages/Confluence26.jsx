export function submitApp(ev) {
  if (ev && ev.preventDefault) ev.preventDefault();
  var v=function(id){var e=document.getElementById(id);return (e&&e.value)||'—';};
  var d=document.querySelector('input[name="apply-date"]:checked');
  var subject=encodeURIComponent('Confluence — Operational Hydrology Advances Webinar Series · PI Engagement Session');
  var body=encodeURIComponent('Name: '+v('apply-name')+'\nAffiliation: '+v('apply-affiliation')+'\nPreferred session: '+((d&&d.value)||'—')+'\n\nProposed topic:\n'+v('apply-topic'));
  window.location.href='mailto:ciroh@ua.edu?bcc=spaul5%40ua.edu&subject='+subject+'&body='+body;
};