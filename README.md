IMPORTANT:

This script modifies your Google Ads account by adding negative keywords. Ensure you understand the implications before running it.
Consider testing the script on a limited set of ad groups before applying it to a large campaign.
------------------------------
Disclaimer:

This script is provided as-is without warranty of any kind. You are responsible for ensuring its proper use and any consequences arising from its execution.
-----------------------------------------

Description:

This script automates the process of adding negative keywords to exact match Google Ads campaigns. It helps to keep your exact match campaigns as exactly that - exact! It targets search terms that closely resemble your exact match keywords but are not identical. This helps ensure your campaigns only target users searching for your specific terms and avoids spending budget on irrelevant searches.

This script works multi ad group campaigns and also multikeyword ad groups - if your search term matches closely with ANY keyword within the ad group, it will not be added as a negative keyword.


Usage:
Set the dateRange variable to the desired date range string (e.g., "LAST_7_DAYS").
Set your campaign filter to filter for you exact match campaigns - this script assumes you have a consisent naming convention for your exact match campaigns and uses the campaign filter to ensure it only works through exact match campaigns.
Run the script.


Functionality:

Scans Search Terms: The script retrieves search terms for your exact match campaigns within a specified date range of your choosing.
Analyzes Similarity: It utilizes the Levenshtein distance algorithm to calculate the edit distance (number of edits required) between each search term and your exact match keywords.
Identifies Close Variants: Search terms with an edit distance exceeding a threshold (indicating they are not very similar) are considered close variants. A close variant is identified if the search term is not close to any keyword within the ad group.
Adds Negative Keywords: The script adds these close variants as negative keywords to their corresponding ad groups. This prevents your ads from triggering for those search terms.

