// CIROH Working Groups data lives in workingGroups.json.
//
// Each group has:
//   id, title, description, leads            - stable info
//   reportsCollectionId                      - optional HydroShare collection of group reports
//   annual: { period, objectives, accomplishments, products }
//                                            - UPDATE EVERY YEAR (shown on the group's details page)
import data from './workingGroups.json';

export const workingGroups = data;
