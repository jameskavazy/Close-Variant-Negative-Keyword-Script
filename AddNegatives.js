/*
    Settings 

    For the script to function correctly, you must use consistent naming convention for all of your exact match campaigns so that it can differentiate them from the others.
*/
//----------------//
var dateRange = "LAST_14_DAYS"; // Choose from "YESTERDAY", "LAST_7_DAYS","LAST_14_DAYS", "LAST_30_DAYS"
var campaignNameFilter = ""; //e.g. "My Campaign Name"
 //----------------//


/*
    Script starts below don't edit anything here
*/

function main() {
    complete();
}

 function complete(){

    const exactMatchAdGroupIterator = getExactMatchAdGroups(campaignNameFilter);
    while (exactMatchAdGroupIterator.hasNext()){
      const adGroup = exactMatchAdGroupIterator.next();
      const adGroupId = adGroup.getId();


      const adGroupSearchQueries = getAdGroupSearchQueries(dateRange,adGroupId);


      const keywordIterator = getExactMatchKeywords(adGroupId);
      while (keywordIterator.hasNext()){
        const keywordObject = keywordIterator.next();
        if (keywordObject.isEnabled()){
            //Returns string including match type symbols ie. [keyword]
          const keyword = keywordObject.getText();
          for (i = 0; i < adGroupSearchQueries.length; i++){

            if (editDistance(adGroupSearchQueries[i], keyword) < 4){
              adGroupSearchQueries.splice(i,1);
              i--;
            }
          }
        }
      }

      for (j = 0; j < adGroupSearchQueries.length; j++) {
        adGroup.createNegativeKeyword("[" + adGroupSearchQueries[j] + "]");
        console.log("Add negative keyword: " + adGroupSearchQueries[j]);
      }
    }
  }

  /**
 * 
 * @param {string} campaignNameFilter 
 * @returns {Object} Ad Group Iterator
 */
  function getExactMatchAdGroups(campaignNameFilter) {
    //parses user filter for the GAQL query - in case it uses special characters
    const escapedCampaignFilter = escapedFilter(campaignNameFilter);
    var adGroupSelector = AdsApp.adGroups().withCondition(`campaign.name LIKE "${escapedCampaignFilter}"`);
    var adGroupIterator = adGroupSelector.get();
    return adGroupIterator;
  }

/**
 * 
 * @param {int} adGroupId 
 * @returns {Object} Keyword Iterator
 */
  function getExactMatchKeywords(adGroupId){

    const keywordIterator = AdsApp.keywords()
        .withCondition(`ad_group.id = "${adGroupId}"`)
        .get();

    return keywordIterator;
  }


/**
 * 
 * @param {string} dateRange 
 * @param {int} adGroupId 
 * @returns {string[]} Exact Match Ad Group Queries
 */
  function getAdGroupSearchQueries(dateRange, adGroupId) {
    const queryReport = (AdWordsApp.report(
      "SELECT Query \
        FROM SEARCH_QUERY_PERFORMANCE_REPORT \
        WHERE AdGroupId = '" + adGroupId + "' \
        DURING " + dateRange + " \
        "
    )).rows();

    const queries = [];

    while (queryReport.hasNext()) {
      const row = queryReport.next();
      const query = row.Query;
      queries.push(query);
    }
    return queries;
  }

  function editDistance(searchQuery, keyword) {
 
    searchQuery = searchQuery.toLowerCase();
    keyword = keyword.toLowerCase();
   
    var matrix = [[0]];
    for (var i = 1; i <= searchQuery.length; i++) {
      matrix[i] = [];
      matrix[i][0] = i;
    }
    for (var j = 1; j <= keyword.length; j++) {
      matrix[0][j] = j;
    }
 
    for (var j = 1; j <= keyword.length; j++) {
      for (var i = 1; i <= searchQuery.length; i++) {
        var substitutionCost = ((searchQuery[i] === keyword[j]) ? 0 : 1);
 
        matrix[i][j] = Math.min(
          matrix[i-1][j] + 1,
          matrix[i][j-1] + 1,
          matrix[i-1][j-1] + substitutionCost
        );
      }
    }

    return matrix[searchQuery.length][keyword.length];
  }

  function escapedFilter(name){
    return name.replace(/([\[\]%_\\])/g, "\[$1\]");
  }