
/*
    Settings 

    For the script to function correctly, you must use consistent naming convention for all of your exact match campaigns so that it can differentiate them from the others.
*/

var dateRange = "LAST_14_DAYS"; // Choose from "YESTERDAY", "LAST_7_DAYS","LAST_14_DAYS", "LAST_30_DAYS"
var campaignNameFilter = ""; //e.g. "My Campaign Name"
 
/*
    Script starts below don't edit anything here
*/

function main() {
    const closeVariantQueries = getExactCloseVariantSearchQueries(dateRange,campaignNameFilter);
    const addNegatives = addNegativeKeywordsToAdGroups(closeVariantQueries);
}

 /**
  * @param {Array<object>} closeVariantQueries
  */
function addNegativeKeywordsToAdGroups(closeVariantQueries) {
    const adGroupIdsArray = [];

//Gets list of adGroup Ids that we want to deal with
    for (i = 0; i < closeVariantQueries.length; i++){
        const closeVariantAdGroupId = closeVariantQueries[i].AdGroupId;
        adGroupIdsArray.push(closeVariantAdGroupId);
    }
    const uniqueAdGroupArray = uniqueAdGroupIdsArray(adGroupIdsArray);

//Iterates over adgroups from list above    
    const adGroupIterator = AdsApp.adGroups().withIds(uniqueAdGroupArray).get();

    while (adGroupIterator.hasNext()){
        const adGroup = adGroupIterator.next();
        const adGroupIdentity = adGroup.getId();

    
        for (i = 0; i < closeVariantQueries.length; i++){
            const closeVariantAdGroupId = closeVariantQueries[i].AdGroupId;
            const query = closeVariantQueries[i].Query;

            if (closeVariantAdGroupId == adGroupIdentity) {
             
              console.log(adGroup.getName());

                const exactMatchKeywordsArray = getExactMatchAdGroupKeywordsStrings(dateRange,adGroupIdentity);
             

                const isDistanceTooFarArray = [];
   
                    function arrayContainsFalse(isDistanceTooFarArray){
                        return isDistanceTooFarArray.some((element) => {
                            return element === false;
                        });
                    }
                    //Check query distance from all keywords in ad group
                    for (var j = 0; j < exactMatchKeywordsArray.length; j++){
           
                        var editDistanceLength = editDistance(query,exactMatchKeywordsArray[j]);
           
                        if (editDistanceLength > 4) {
                            isDistanceTooFarArray.push(true);
                        } else isDistanceTooFarArray.push(false);
                    }
           
                    const isContainingFalse = arrayContainsFalse(isDistanceTooFarArray);
                    if (!isContainingFalse){
                        adGroup.createNegativeKeyword("[" + query + "]");
                        console.log("Add negative keyword: " + query);
                       
                    }
                 
            }

        }
    }
}

/**
 *
 * @param {string} searchQuery
 * @param {string} keyword
 * @returns {int} distance
 */
function editDistance(searchQuery, keyword) {
 
    searchQuery = searchQuery.toLowerCase();
    keyword = keyword.toLowerCase();
   
    var matrix = [[0]];
    for (var i=1; i<=searchQuery.length; i++) {
      matrix[i] = [];
      matrix[i][0] = i;
    }
    for (var j=1; j<=keyword.length; j++) {
      matrix[0][j] = j;
    }
 
    for (var j=1; j<=keyword.length; j++) {
      for (var i=1; i<=searchQuery.length; i++) {
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


 /**
 * Get a list keyword strings in ad group
 * @param {string} dateRange GAQL Date Range
 * @param {int} id Ad Group ID
 * @returns {Array<string>} Array of Keywords
 */

function getExactMatchAdGroupKeywordsStrings(dateRange,id) {
    const keywordsArray = [];
    const keywordPerformanceReport = getKeywordPerformanceReport(dateRange, id);
    while (keywordPerformanceReport.hasNext()) {
      var keyword = keywordPerformanceReport.next();
        var keywordString = keyword.Criteria;
        keywordsArray.push(keywordString);
    }
    return keywordsArray;
  }


  /**
   *  GAQL call to get object (list) of exact match keywords
   * @returns {object} Google Ads Report "object"
   */

  function getKeywordPerformanceReport(dateRange, adGroupId) {
    return (AdsApp.report(
        "SELECT Criteria, AdGroupId \
          FROM KEYWORDS_PERFORMANCE_REPORT \
          WHERE AdGroupId = " + adGroupId + " \
          AND Impressions > 0 AND KeywordMatchType = EXACT \
          DURING " + dateRange + " \
          "
      )).rows();
  }

/**
 * This returns a list of search query objects each object contains the query and the adgroup id.
 * @param {string} campaignNameFilter
 * @param {string} dateRange
 * @returns {Array<object>} searchQuery object array
 */

  function getExactCloseVariantSearchQueries(dateRange, campaignNameFilter){
    const adGroupSearchQueries = [];
    const searchQueryReport = getSearchQueryPerformanceReport(dateRange,campaignNameFilter);

    while (searchQueryReport.hasNext()) {
        const row = searchQueryReport.next();
        adGroupSearchQueries.push(row);
    }
    return adGroupSearchQueries;
  }

/**
 *
 * @param {string} dateRange
 * @param {string} campaignNameFilter
 * @returns {object} Google Ads Report Object
 */

  function getSearchQueryPerformanceReport(dateRange, campaignNameFilter) {
    return (AdWordsApp.report(
      "SELECT Query, AdGroupId \
        FROM SEARCH_QUERY_PERFORMANCE_REPORT \
        WHERE CampaignName CONTAINS_IGNORE_CASE '" + campaignNameFilter + "' \
        DURING " + dateRange + " \
        "
    )).rows();
  }

  function uniqueAdGroupIdsArray(adGroupIdsArray){
    return Array.from(new Set(adGroupIdsArray));
  }
