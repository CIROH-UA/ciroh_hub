// Adds a dedicated details page for each working group at /working-groups/<id>,
// generated from src/data/workingGroups.json.
const groups = require('../src/data/workingGroups.json');

module.exports = function pluginWorkingGroups(context) {
  const { baseUrl } = context.siteConfig;
  return {
    name: 'plugin-working-groups',
    async contentLoaded({ actions }) {
      const { addRoute, createData } = actions;
      for (const group of groups) {
        const dataPath = await createData(`working-group-${group.id}.json`, JSON.stringify(group));
        addRoute({
          path: `${baseUrl}working-groups/${group.id}`,
          component: '@site/src/components/WorkingGroupDetails',
          exact: true,
          modules: { group: dataPath },
        });
      }
    },
  };
};
